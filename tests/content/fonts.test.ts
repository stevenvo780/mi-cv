import { readFileSync, statSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { HOME } from '@/content/home';
import { LOCALES } from '@/lib/site';

// Subconjuntos de fuentes de la home (spec §3.2): el del h1 lleva solo los glifos del nombre. fontkit viene compilado
// dentro de next (lo usa next/font/local para calcular los respaldos); next está fijado a 16.3.6.
const fontkit = createRequire(import.meta.url)('next/dist/compiled/@next/font/dist/fontkit').default;
const openFont: (buffer: Buffer) => { characterSet: number[] } = fontkit.default ?? fontkit;
const HERO = fileURLToPath(new URL('../../src/app/fonts/cormorant-hero.woff2', import.meta.url));

describe('subconjunto de fuente del h1', () => {
  it.each(LOCALES)('cubre el nombre del hero (%s)', (locale) => {
    const glyphs = new Set(openFont(readFileSync(HERO)).characterSet);
    const { first, last } = HOME[locale].hero;
    const missing = [...new Set(`${first} ${last}`)].filter((c) => !glyphs.has(c.codePointAt(0)!));
    expect(missing, 'faltan en cormorant-hero.woff2: añádelos en scripts/subset-fonts.sh y regenera').toEqual([]);
  });

  it('es mínimo: es el único archivo que se precarga y compite con el LCP', () => {
    expect(statSync(HERO).size).toBeLessThanOrEqual(6 * 1024);
  });
});
