const path = require('path');
const fs = require('fs');

function readJsonFile(filePath, def = []) {
  try {
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(raw);
      if (Array.isArray(data)) return data;
    }
  } catch (_) {}
  return def;
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Method not allowed' });
    return;
  }

  try {
    const toolsPath = path.join(process.cwd(), 'public', 'tools.json');
    const tools = readJsonFile(toolsPath, []);
    if (!tools.length) {
      res.status(200).json({ message: 'No tools found in public/tools.json.' });
      return;
    }
    res.status(200).json({ message: `This app uses public/tools.json only. ${tools.length} tools are available.` });
  } catch (err) {
    console.error('seed-tools error:', err);
    res.status(500).json({ message: 'Failed to read tools.json.' });
  }
};
