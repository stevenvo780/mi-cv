import { describe, expect, it } from 'vitest';
import { SITE, clampDescription, isLocale, localeUrl, pageAlternates, toLocale } from '@/lib/site';

describe('site', () => {
  it('usa el dominio con www', () => {
    expect(SITE).toBe('https://www.stevenvallejo.com');
  });
  it('reconoce locales', () => {
    expect(isLocale('es')).toBe(true);
    expect(isLocale('fr')).toBe(false);
    expect(isLocale(undefined)).toBe(false);
    expect(toLocale('es')).toBe('es');
    expect(toLocale('fr')).toBe('en');
  });
  it('construye URLs de locale', () => {
    expect(localeUrl('es')).toBe('https://www.stevenvallejo.com/es');
    expect(localeUrl('en', '/lore')).toBe('https://www.stevenvallejo.com/en/lore');
  });
  it('alternates propios de cada página con x-default a inglés', () => {
    expect(pageAlternates('es', '/filosofia')).toEqual({
      canonical: 'https://www.stevenvallejo.com/es/filosofia',
      languages: {
        es: 'https://www.stevenvallejo.com/es/filosofia',
        en: 'https://www.stevenvallejo.com/en/filosofia',
        'x-default': 'https://www.stevenvallejo.com/en/filosofia',
      },
    });
  });
  it('recorta descripciones por palabra sin superar el máximo', () => {
    const long = 'palabra '.repeat(40).trim();
    const out = clampDescription(long, 155);
    expect(out.length).toBeLessThanOrEqual(155);
    expect(out.endsWith('…')).toBe(true);
    expect(clampDescription('corta', 155)).toBe('corta');
  });
});
