const path = require('path');
const fs = require('fs');
const { getPool } = require('./_db');

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
  const adminKey = req.headers['x-admin-key'];
  const secret = process.env.ADMIN_SECRET_KEY || 'your_super_secret_admin_key';
  if (adminKey !== secret) {
    res.status(401).json({ message: 'Unauthorized: Admin key missing or invalid.' });
    return;
  }

  const newTool = req.body || {};
  if (!newTool.name || !newTool.category || !newTool.description || !newTool.websiteUrl) {
    res.status(400).json({ message: 'Missing required fields: name, category, description, websiteUrl.' });
    return;
  }
  newTool.id = newTool.id || `${newTool.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`;

  const pool = getPool();
  try {
    if (pool) {
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
      res.status(201).json({ message: 'Tool added successfully!', tool: newTool });
    } else {
      const toolsFilePath = path.join(process.cwd(), 'public', 'tools.json');
      const tools = readJsonFile(toolsFilePath);
      tools.push(newTool);
      writeJsonFile(toolsFilePath, tools);
      res.status(201).json({ message: 'Tool added successfully!', tool: newTool });
    }
  } catch (err) {
    console.error('add-tool api error:', err);
    res.status(500).json({ message: 'Failed to add tool.' });
  }
};
