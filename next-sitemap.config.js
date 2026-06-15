module.exports = {
  siteUrl: 'https://stevenvallejo.com',
  generateRobotsTxt: true,
  priority: 0.7,
  changefreq: 'weekly',
  sitemapSize: 5000,
  exclude: ['/404', '/admin/*'],

  transform: async (config, path) => {
    return {
      loc: path,
      changefreq: config.changefreq,
      priority: path === '/' ? 1.0 : config.priority,
      lastmod: new Date().toISOString(),
    };
  },

  robotsTxtOptions: {
    policies: [
      { userAgent: '*', allow: '/' },
      { userAgent: '*', disallow: '/admin' },
    ],
    additionalSitemaps: [
      'https://stevenvallejo.com/sitemap-0.xml',
    ],
  },
};
