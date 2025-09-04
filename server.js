// server.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
// Add Postgres client (optional) when DATABASE_URL is provided
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

// IMPORTANT: For demonstration only. In a real application,
// this admin key would be stored securely (e.g., in environment variables)
// and authentication would involve user logins and sessions.
const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY || 'aradmin'; // CHANGE THIS!

// Initialize optional Postgres pool
const hasDb = !!process.env.DATABASE_URL;
let pool = null;
if (hasDb) {
    pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.PGSSL === 'disable' ? false : { rejectUnauthorized: false }
    });
}

// Middleware to parse JSON bodies from incoming requests
app.use(bodyParser.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Helper function to read a JSON file
const readJsonFile = (filePath, defaultContent = []) => {
    try {
        if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath, 'utf8');
            const parsedData = JSON.parse(data);
            if (Array.isArray(parsedData)) {
                return parsedData;
            } else {
                console.warn(`File ${filePath} contains invalid JSON (not an array). Initializing as empty.`);
                return defaultContent;
            }
        }
    } catch (error) {
        console.error(`Error reading or parsing ${filePath}:`, error);
    }
    return defaultContent;
};

// Helper function to write to a JSON file
const writeJsonFile = (filePath, data, res) => {
    fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8', (err) => {
        if (err) {
            console.error(`Error writing to ${filePath}:`, err);
            return res.status(500).json({ message: `Failed to save data to ${path.basename(filePath)}.` });
        }
        // No explicit res.status here, as the calling function will handle the final response
        return true;
    });
};

// --- API Endpoints ---

// Endpoint to retrieve tools (DB if available, else JSON)
app.get('/api/tools', async (req, res) => {
    try {
        if (hasDb && pool) {
            const { rows } = await pool.query(`
                SELECT id, name, category, description, website_url AS "websiteUrl", image_url AS "imageUrl",
                       features, pricing_model AS "pricingModel", rating, views, badge, created_at AS "createdAt"
                FROM tools
                ORDER BY created_at DESC
            `);
            return res.json(rows);
        } else {
            const toolsFilePath = path.join(__dirname, 'public', 'tools.json');
            const tools = readJsonFile(toolsFilePath);
            return res.json(tools);
        }
    } catch (err) {
        console.error('Error fetching tools:', err);
        return res.status(500).json({ message: 'Failed to fetch tools.' });
    }
});

// Endpoint for checking admin access (used by frontend to reveal admin form)
app.get('/api/check-admin', (req, res) => {
    const adminKey = req.headers['x-admin-key']; // Expecting the key in a custom header

    if (adminKey === ADMIN_SECRET_KEY) {
        res.status(200).json({ authenticated: true, message: 'Admin access granted.' });
    } else {
        res.status(401).json({ authenticated: false, message: 'Unauthorized access. Invalid admin key.' });
    }
});


// API endpoint for adding a new tool (Admin only)
app.post('/api/add-tool', async (req, res) => {
    const adminKey = req.headers['x-admin-key']; // Check admin key for this protected route

    if (adminKey !== ADMIN_SECRET_KEY) {
        return res.status(401).json({ message: 'Unauthorized: Admin key missing or invalid.' });
    }

    const newTool = req.body;

    // Basic server-side validation for mandatory fields
    if (!newTool.name || !newTool.category || !newTool.description || !newTool.websiteUrl) {
        return res.status(400).json({ message: 'Missing required fields: name, category, description, websiteUrl.' });
    }

    // Assign a unique ID if not provided (good practice for backend to control this)
    newTool.id = newTool.id || `${newTool.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`;

    try {
        if (hasDb && pool) {
            await pool.query(
                `INSERT INTO tools (id, name, category, description, website_url, image_url, features, pricing_model, rating, views, badge)
                 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
                [
                    newTool.id,
                    newTool.name,
                    newTool.category,
                    newTool.description,
                    newTool.websiteUrl,
                    newTool.imageUrl || null,
                    Array.isArray(newTool.features) ? JSON.stringify(newTool.features) : JSON.stringify([]),
                    newTool.pricingModel || null,
                    typeof newTool.rating === 'number' ? newTool.rating : 0,
                    typeof newTool.views === 'number' ? newTool.views : 0,
                    newTool.badge || null
                ]
            );
            return res.status(201).json({ message: 'Tool added successfully!', tool: newTool });
        } else {
            const toolsFilePath = path.join(__dirname, 'public', 'tools.json');
            let tools = readJsonFile(toolsFilePath);
            tools.push(newTool);
            writeJsonFile(toolsFilePath, tools, res);
            return res.status(201).json({ message: 'Tool added successfully!', tool: newTool });
        }
    } catch (err) {
        console.error('Error adding tool:', err);
        return res.status(500).json({ message: 'Failed to add tool.' });
    }
});

// API endpoint for submitting a tool (Public)
app.post('/api/submit-tool', async (req, res) => {
    const submittedTool = req.body;

    // Basic server-side validation for public submissions
    if (!submittedTool.name || !submittedTool.category || !submittedTool.description || !submittedTool.websiteUrl) {
        return res.status(400).json({ message: 'Missing required fields for submission: name, category, description, websiteUrl.' });
    }

    // Assign a unique ID for submitted tools
    submittedTool.id = `${submittedTool.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-submitted-${Date.now()}`;
    submittedTool.submissionDate = new Date().toISOString(); // Add a timestamp
    submittedTool.status = 'pending'; // Default status for review

    try {
        if (hasDb && pool) {
            await pool.query(
                `INSERT INTO submitted_tools (id, name, category, description, website_url, image_url, tags, features, your_name, your_email, status, submission_date)
                 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
                [
                    submittedTool.id,
                    submittedTool.name,
                    submittedTool.category,
                    submittedTool.description,
                    submittedTool.websiteUrl,
                    submittedTool.imageUrl || null,
                    submittedTool.tags ? JSON.stringify(submittedTool.tags) : JSON.stringify([]),
                    submittedTool.features ? JSON.stringify(submittedTool.features) : JSON.stringify([]),
                    submittedTool.yourName || null,
                    submittedTool.yourEmail || null,
                    submittedTool.status,
                    submittedTool.submissionDate
                ]
            );
            return res.status(201).json({ message: 'Tool suggestion submitted successfully! It will be reviewed by our team.', submission: submittedTool });
        } else {
            const submittedToolsFilePath = path.join(__dirname, 'public', 'submitted-tools.json'); // Separate file for public submissions
            let submittedTools = readJsonFile(submittedToolsFilePath);
            submittedTools.push(submittedTool);
            writeJsonFile(submittedToolsFilePath, submittedTools, res);
            return res.status(201).json({ message: 'Tool suggestion submitted successfully! It will be reviewed by our team.', submission: submittedTool });
        }
    } catch (err) {
        console.error('Error submitting tool:', err);
        return res.status(500).json({ message: 'Failed to submit tool.' });
    }
});


// API endpoint for email subscription
app.post('/api/subscribe-email', async (req, res) => {
    const { email } = req.body;

    if (!email || !email.includes('@') || !email.includes('.')) {
        return res.status(400).json({ message: 'Please provide a valid email address.' });
    }

    try {
        if (hasDb && pool) {
            await pool.query(
                `INSERT INTO subscribers (email) VALUES ($1)
                 ON CONFLICT (email) DO NOTHING`,
                [email]
            );
            return res.status(200).json({ message: 'Successfully subscribed to the newsletter!' });
        } else {
            const subscribersFilePath = path.join(__dirname, 'public', 'subscribers.json');
            let subscribers = readJsonFile(subscribersFilePath);

            if (subscribers.includes(email)) {
                return res.status(409).json({ message: 'This email is already subscribed.' });
            }

            subscribers.push(email);
            writeJsonFile(subscribersFilePath, subscribers, res);
            return res.status(200).json({ message: 'Successfully subscribed to the newsletter!' });
        }
    } catch (err) {
        console.error('Error subscribing email:', err);
        return res.status(500).json({ message: 'Failed to subscribe email.' });
    }
});

// Catch-all for unmatched routes to serve custom 404 page
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Access your main website at: http://localhost:${PORT}/index.html`);
    console.log(`Public 'Submit Tool' page (also linked in navigation): http://localhost:${PORT}/submit.html`);
    console.log(`Admin 'Add Tool' page (direct URL, not linked in navigation): http://localhost:${PORT}/add-tool.html`);
    console.log(`Remember to CHANGE 'your_super_secret_admin_key' in server.js for actual use.`);
    if (hasDb) {
        console.log('Database connection detected. Using Postgres for data operations.');
    } else {
        console.log('No DATABASE_URL found. Falling back to JSON files for data storage.');
    }
});
