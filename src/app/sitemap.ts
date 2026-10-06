import type { MetadataRoute } from 'next';
import { DATA_DATE } from '@/graph/generated/stats';
import { LOCALES, pageAlternates } from '@/lib/site';

const PATHS = ['', '/compartir', '/actividad', '/lore', '/informatica', '/filosofia', '/ciencias', '/enterprise'] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  return PATHS.flatMap((path) =>
    LOCALES.map((locale) => {
      const alt = pageAlternates(locale, path);
      return {
        url: alt.canonical,
        lastModified: DATA_DATE,
        changeFrequency: path === '/actividad' ? 'daily' as const : 'monthly' as const,
        priority: path === '' ? 1 : 0.7,
        alternates: { languages: alt.languages },
      };
    }),
  );
}
