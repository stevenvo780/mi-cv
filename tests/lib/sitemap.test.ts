import { describe, expect, it } from 'vitest';
import sitemap from '@/app/sitemap';

describe('sitemap', () => {
  const entries = sitemap();
  it('solo lista URLs canónicas del dominio con www', () => {
    expect(entries).toHaveLength(14);
    expect(entries.map((e) => e.url)).toContain('https://www.stevenvallejo.com/es/compartir');
    expect(entries.map((e) => e.url)).toContain('https://www.stevenvallejo.com/en/compartir');
    for (const e of entries) expect(e.url).toMatch(/^https:\/\/www\.stevenvallejo\.com\/(es|en)(\/[a-z]+)?$/);
  });
  it('cada entrada declara sus alternates recíprocos', () => {
    for (const e of entries) expect(Object.keys(e.alternates?.languages ?? {})).toEqual(['es', 'en', 'x-default']);
  });
});
