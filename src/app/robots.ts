import type { MetadataRoute } from 'next';

const baseUrl = 'https://www.stevenvallejo.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/'],
      },
    ],
    sitemap: [
      `${baseUrl}/sitemap.xml`,
      'https://humanizar.tech/sitemap.xml',
    ],
    host: baseUrl,
  };
}
