// server.js
const express = require('express');
const fs = require('fs'); // Node.js built-in module for file system operations
const path = require('path'); // Node.js built-in module for path manipulation
const bodyParser = require('body-parser'); // Middleware to parse JSON bodies

const app = express();
const PORT = process.env.PORT || 3000; // Use port 3000 or a port defined by environment variable

// Middleware to parse JSON bodies from incoming requests
app.use(bodyParser.json());

// Serve static files from the 'public' directory
// This means any requests for /index.html, /style.css, /script.js, etc.,
// will be served directly from the public folder.
app.use(express.static(path.join(__dirname, 'public')));

// API endpoint for adding a new tool
app.post('/api/add-tool', (req, res) => {
    // In a real application, you'd implement authentication here
    // For example, checking an admin token or session.
    // For now, this endpoint is publicly accessible (which is not secure for admin actions).

    const newTool = req.body; // The JSON data sent from the frontend form

    // Basic validation: Check if required fields are present
    if (!newTool || !newTool.name || !newTool.category || !newTool.websiteUrl || !newTool.imageUrl || !newTool.description) {
        console.warn('Attempted to add tool with missing required fields:', newTool);
        return res.status(400).json({ message: 'Missing required tool information: name, category, description, websiteUrl, imageUrl are mandatory.' });
    }

    // Define the path to your tools.json file
    const toolsFilePath = path.join(__dirname, 'public', 'tools.json');

    // Read the existing tools data
    fs.readFile(toolsFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading tools.json:', err);
            // If the file doesn't exist, we can create it with the first tool
            if (err.code === 'ENOENT') { // ENOENT means "Error NO ENtry" (file not found)
                const initialTools = [newTool]; // Start with the first tool
                fs.writeFile(toolsFilePath, JSON.stringify(initialTools, null, 2), 'utf8', (writeErr) => {
                    if (writeErr) {
                        console.error('Error creating tools.json with first tool:', writeErr);
                        return res.status(500).json({ message: 'Failed to create tools file.' });
                    }
                    console.log('tools.json created and first tool added successfully.');
                    res.status(201).json({ message: 'Tool added successfully (file created)!', tool: newTool });
                });
            } else {
                return res.status(500).json({ message: 'Failed to read existing tools data.' });
            }
            return; // Exit here to prevent further execution in this callback
        }

        let tools = [];
        try {
            tools = JSON.parse(data); // Parse the existing JSON data
        } catch (parseError) {
            console.error('Error parsing tools.json:', parseError);
            return res.status(500).json({ message: 'Failed to parse existing tools data. Check JSON format.' });
        }

        // Add the new tool to the array
        tools.push(newTool);

        // Write the updated data back to tools.json
        // null, 2 makes the JSON output pretty-printed with 2 spaces indentation
        fs.writeFile(toolsFilePath, JSON.stringify(tools, null, 2), 'utf8', (writeErr) => {
            if (writeErr) {
                console.error('Error writing to tools.json:', writeErr);
                return res.status(500).json({ message: 'Failed to save tool data.' });
            }
            console.log(`Tool '${newTool.name}' added successfully.`);
            res.status(201).json({ message: 'Tool added successfully!', tool: newTool });
        });
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Access your website at http://localhost:${PORT}/index.html`);
    console.log(`Access the admin "Add Tool" page at http://localhost:${PORT}/add-tool.html`);
});
