module.exports = async (req, res) => {
  const site = (process.env.SITE_URL || `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host}`).replace(/\/$/, '');
  const urls = [
    `${site}/index.html`,
    `${site}/tools.html`,
    `${site}/submit.html`,
    `${site}/about.html`,
    `${site}/404.html`
  ];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u => `  <url><loc>${u}</loc><changefreq>weekly</changefreq></url>`).join('\n')}\n</urlset>`;
  res.setHeader('Content-Type', 'application/xml');
  res.status(200).send(xml);
};
