import type { MetadataRoute } from 'next';

const baseUrl = 'https://stevenvallejo.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const locales = ['es', 'en'];
  const frentes = ['filosofia', 'ciencias', 'informatica', 'enterprise'];

  const sitemapEntries: MetadataRoute.Sitemap = [
    // Root URL with alternate languages
    {
      url: baseUrl,
      lastModified,
      changeFrequency: 'weekly',
      priority: 1.0,
      alternates: {
        languages: {
          es: `${baseUrl}/es`,
          en: `${baseUrl}/en`,
        },
      },
    },
  ];

  // Locale home pages
  locales.forEach((locale) => {
    sitemapEntries.push({
      url: `${baseUrl}/${locale}`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.9,
    });
  });

  // Biography / Lore pages
  locales.forEach((locale) => {
    sitemapEntries.push({
      url: `${baseUrl}/${locale}/lore`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.8,
    });
  });

  // Specialty frente pages
  locales.forEach((locale) => {
    frentes.forEach((frente) => {
      sitemapEntries.push({
        url: `${baseUrl}/${locale}/${frente}`,
        lastModified,
        changeFrequency: 'weekly',
        priority: 0.8,
      });
    });
  });

  return sitemapEntries;
}
