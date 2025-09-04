module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    res.status(405).json({ message: 'Method not allowed' });
    return;
  }
  const adminKey = req.headers['x-admin-key'];
  const secret = process.env.ADMIN_SECRET_KEY || 'your_super_secret_admin_key';
  if (adminKey === secret) {
    res.status(200).json({ authenticated: true, message: 'Admin access granted.' });
  } else {
    res.status(401).json({ authenticated: false, message: 'Unauthorized access. Invalid admin key.' });
  }
};
