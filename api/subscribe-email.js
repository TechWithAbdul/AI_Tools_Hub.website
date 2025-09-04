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
  const { email } = req.body || {};
  if (!email || !email.includes('@') || !email.includes('.')) {
    res.status(400).json({ message: 'Please provide a valid email address.' });
    return;
  }

  const pool = getPool();
  try {
    if (pool) {
      await pool.query(`INSERT INTO subscribers (email) VALUES ($1) ON CONFLICT (email) DO NOTHING`, [email]);
      res.status(200).json({ message: 'Successfully subscribed to the newsletter!' });
    } else {
      const filePath = path.join(process.cwd(), 'public', 'subscribers.json');
      const arr = readJsonFile(filePath);
      if (arr.includes(email)) {
        res.status(409).json({ message: 'This email is already subscribed.' });
        return;
      }
      arr.push(email);
      writeJsonFile(filePath, arr);
      res.status(200).json({ message: 'Successfully subscribed to the newsletter!' });
    }
  } catch (err) {
    console.error('subscribe-email api error:', err);
    res.status(500).json({ message: 'Failed to subscribe email.' });
  }
};
