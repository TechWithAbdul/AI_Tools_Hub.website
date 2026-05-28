const path = require('path');
const fs = require('fs');

function readJsonFile(filePath, def = []) {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (_) {}
  return def;
}
function writeJsonFile(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Method not allowed' });
    return;
  }
  const submission = req.body || {};
  if (!submission.name || !submission.category || !submission.description || !submission.websiteUrl) {
    res.status(400).json({ message: 'Missing required fields for submission: name, category, description, websiteUrl.' });
    return;
  }
  submission.id = `${submission.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-submitted-${Date.now()}`;
  submission.submissionDate = new Date().toISOString();
  submission.status = 'pending';

  try {
    const filePath = path.join(process.cwd(), 'public', 'submitted-tools.json');
    const arr = readJsonFile(filePath);
    arr.push(submission);
    writeJsonFile(filePath, arr);
    res.status(201).json({ message: 'Tool suggestion submitted successfully! It will be reviewed by our team.', submission });
  } catch (err) {
    console.error('submit-tool api error:', err);
    res.status(500).json({ message: 'Failed to submit tool.' });
  }
};
