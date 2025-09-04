const path = require('path');
const fs = require('fs');
const { getPool } = require('./_db');

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
  const adminKey = req.headers['x-admin-key'];
  const secret = process.env.ADMIN_SECRET_KEY || 'your_super_secret_admin_key';
  if (adminKey !== secret) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }
  const pool = getPool();
  if (!pool) {
    res.status(400).json({ message: 'No database configured (DATABASE_URL missing).' });
    return;
  }
  try {
    const toolsPath = path.join(process.cwd(), 'public', 'tools.json');
    const tools = readJsonFile(toolsPath, []);
    if (!tools.length) {
      res.status(200).json({ message: 'No tools to seed.' });
      return;
    }
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      for (const t of tools) {
        const id = t.id || `${(t.name||'tool').toLowerCase().replace(/[^a-z0-9]+/g,'-')}-${Date.now()}`;
        await client.query(
          `INSERT INTO tools (id, name, category, description, website_url, image_url, features, pricing_model, rating, views, badge)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
           ON CONFLICT (id) DO NOTHING`,
          [
            id,
            t.name || 'Unknown',
            t.category || 'Other',
            t.description || '',
            t.websiteUrl || '',
            t.imageUrl || null,
            Array.isArray(t.features) ? JSON.stringify(t.features) : JSON.stringify([]),
            t.pricingModel || null,
            typeof t.rating === 'number' ? t.rating : 0,
            typeof t.views === 'number' ? t.views : 0,
            t.badge || null
          ]
        );
      }
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
    res.status(200).json({ message: `Seeded ${tools.length} tools.` });
  } catch (err) {
    console.error('seed-tools error:', err);
    res.status(500).json({ message: 'Failed to seed tools.' });
  }
};
