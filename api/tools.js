const path = require('path');
const fs = require('fs');

function readJsonFile(filePath, defaultContent = []) {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (_) {}
  return defaultContent;
}

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    res.status(405).json({ message: 'Method not allowed' });
    return;
  }
  try {
    const toolsFilePath = path.join(process.cwd(), 'public', 'tools.json');
    const tools = readJsonFile(toolsFilePath);
    res.status(200).json(tools);
  } catch (err) {
    console.error('tools api error:', err);
    res.status(500).json({ message: 'Failed to fetch tools' });
  }
};
