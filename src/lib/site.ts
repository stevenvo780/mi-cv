export const SITE = 'https://www.stevenvallejo.com';
export const LOCALES = ['es', 'en'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';
export const OG_LOCALE: Record<Locale, string> = { es: 'es_ES', en: 'en_US' };

export const PROFILES = {
  github: 'https://github.com/stevenvo780',
  linkedin: 'https://www.linkedin.com/in/steven-vallejo/',
  instagram: 'https://www.instagram.com/stev_vallejo/',
} as const;

export function isLocale(value: string | undefined): value is Locale {
  return value === 'es' || value === 'en';
}

export function toLocale(value: string | undefined): Locale {
  return value === 'es' ? 'es' : 'en';
}

/** `path` es relativo a la raíz del locale: '' (home), '/lore', '/filosofia'. */
export function localeUrl(locale: Locale, path = ''): string {
  return `${SITE}/${locale}${path}`;
}

export function pageAlternates(locale: Locale, path = '') {
  return {
    canonical: localeUrl(locale, path),
    languages: {
      es: localeUrl('es', path),
      en: localeUrl('en', path),
      'x-default': localeUrl('en', path),
    },
  };
}

export function clampDescription(text: string, max = 155): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > 0 ? cut.slice(0, lastSpace) : cut).replace(/[\s,.;:—-]+$/u, '')}…`;
}
