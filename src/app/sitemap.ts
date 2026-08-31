import type { MetadataRoute } from 'next';

const baseUrl = 'https://www.stevenvallejo.com';
const crossLinks = {
  humanizar: 'https://humanizar.tech',
  praxis: 'https://praxis.stevenvallejo.com',
  cauceV3: 'https://humanizar.tech/cauce-v3',
};

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

  // Cross-link entries — Steven requested that stevenvallejo ↔ humanizar (and vice versa)
  // refer each other, so both can be discovered through either sitemap.
  sitemapEntries.push(
    {
      url: crossLinks.humanizar,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.7,
      alternates: {
        languages: { es: crossLinks.humanizar, en: crossLinks.humanizar },
      },
    },
    {
      url: crossLinks.praxis,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.7,
      alternates: {
        languages: { es: crossLinks.praxis, en: crossLinks.praxis },
      },
    },
    {
      url: crossLinks.cauceV3,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.7,
      alternates: {
        languages: { es: crossLinks.cauceV3, en: crossLinks.cauceV3 },
      },
    },
  );

  return sitemapEntries;
}
