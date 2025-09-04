module.exports = async (req, res) => {
  const siteUrl = process.env.SITE_URL || `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host}`;
  const body = `User-agent: *\nAllow: /\nSitemap: ${siteUrl.replace(/\/$/, '')}/sitemap.xml\n`;
  res.setHeader('Content-Type', 'text/plain');
  res.status(200).send(body);
};
