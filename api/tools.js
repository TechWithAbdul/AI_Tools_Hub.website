const path = require('path');
const fs = require('fs');
const { getPool } = require('./_db');

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
  const pool = getPool();
  try {
    if (pool) {
      const { rows } = await pool.query(`
        SELECT id, name, category, description, website_url AS "websiteUrl", image_url AS "imageUrl",
               features, pricing_model AS "pricingModel", rating, views, badge, created_at AS "createdAt"
        FROM tools
        ORDER BY created_at DESC
      `);
      res.status(200).json(rows);
    } else {
      const toolsFilePath = path.join(process.cwd(), 'public', 'tools.json');
      const tools = readJsonFile(toolsFilePath);
      res.status(200).json(tools);
    }
  } catch (err) {
    console.error('tools api error:', err);
    res.status(500).json({ message: 'Failed to fetch tools' });
  }
};
