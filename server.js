// server.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// IMPORTANT: For demonstration only. In a real application,
// this admin key would be stored securely (e.g., in environment variables)
// and authentication would involve user logins and sessions.
const ADMIN_SECRET_KEY = 'your_super_secret_admin_key'; // CHANGE THIS!

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
app.post('/api/add-tool', (req, res) => {
    const adminKey = req.headers['x-admin-key']; // Check admin key for this protected route

    if (adminKey !== ADMIN_SECRET_KEY) {
        return res.status(401).json({ message: 'Unauthorized: Admin key missing or invalid.' });
    }

    const newTool = req.body;
    const toolsFilePath = path.join(__dirname, 'public', 'tools.json');
    let tools = readJsonFile(toolsFilePath);

    // Basic server-side validation for mandatory fields
    if (!newTool.name || !newTool.category || !newTool.description || !newTool.websiteUrl || !newTool.imageUrl) {
        return res.status(400).json({ message: 'Missing required fields: name, category, description, websiteUrl, imageUrl.' });
    }

    // Assign a unique ID if not provided (good practice for backend to control this)
    newTool.id = newTool.id || `${newTool.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`;

    tools.push(newTool);

    writeJsonFile(toolsFilePath, tools, res); // This helper handles the actual write and error response
    res.status(201).json({ message: 'Tool added successfully!', tool: newTool });
});

// API endpoint for submitting a tool (Public)
app.post('/api/submit-tool', (req, res) => {
    const submittedTool = req.body;
    const submittedToolsFilePath = path.join(__dirname, 'public', 'submitted-tools.json'); // Separate file for public submissions
    let submittedTools = readJsonFile(submittedToolsFilePath);

    // Basic server-side validation for public submissions
    if (!submittedTool.name || !submittedTool.category || !submittedTool.description || !submittedTool.websiteUrl) {
        return res.status(400).json({ message: 'Missing required fields for submission: name, category, description, websiteUrl.' });
    }

    // Assign a unique ID for submitted tools
    submittedTool.id = `${submittedTool.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-submitted-${Date.now()}`;
    submittedTool.submissionDate = new Date().toISOString(); // Add a timestamp
    submittedTool.status = 'pending'; // Default status for review

    submittedTools.push(submittedTool);

    writeJsonFile(submittedToolsFilePath, submittedTools, res);
    res.status(201).json({ message: 'Tool suggestion submitted successfully! It will be reviewed by our team.', submission: submittedTool });
});


// API endpoint for email subscription
app.post('/api/subscribe-email', (req, res) => {
    const { email } = req.body;
    const subscribersFilePath = path.join(__dirname, 'public', 'subscribers.json');
    let subscribers = readJsonFile(subscribersFilePath);

    if (!email || !email.includes('@') || !email.includes('.')) {
        return res.status(400).json({ message: 'Please provide a valid email address.' });
    }

    if (subscribers.includes(email)) {
        return res.status(409).json({ message: 'This email is already subscribed.' });
    }

    subscribers.push(email);

    writeJsonFile(subscribersFilePath, subscribers, res);
    res.status(200).json({ message: 'Successfully subscribed to the newsletter!' });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Access your main website at: http://localhost:${PORT}/index.html`);
    console.log(`Public 'Submit Tool' page (also linked in navigation): http://localhost:${PORT}/submit-tool.html`);
    console.log(`Admin 'Add Tool' page (direct URL, not linked in navigation): http://localhost:${PORT}/add-tool.html`);
    console.log(`Remember to CHANGE 'your_super_secret_admin_key' in server.js for actual use.`);
});
