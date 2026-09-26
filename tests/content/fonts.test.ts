import { readFileSync, statSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import HomePage from '@/app/[locale]/(home)/page';
import { HOME } from '@/content/home';
import { frenteOrder, frentesMeta, productos } from '@/data/frentes';
import { LOCALES, type Locale } from '@/lib/site';

// Subconjuntos de fuentes de la home (spec §3.2), generados por scripts/subset-fonts.sh. fontkit viene compilado
// dentro de next (lo usa next/font/local para calcular los respaldos); next está fijado a 16.3.6.
const fontkit = createRequire(import.meta.url)('next/dist/compiled/@next/font/dist/fontkit').default;
const openFont: (buffer: Buffer) => { characterSet: number[] } = fontkit.default ?? fontkit;
const fontPath = (name: string) => fileURLToPath(new URL(`../../src/app/fonts/${name}.woff2`, import.meta.url));
const glyphs = (name: string) => new Set(openFont(readFileSync(fontPath(name))).characterSet);
const HERO = fontPath('cormorant-hero');

const REGENERATE = 'añádelos en scripts/subset-fonts.sh y regenera (bash scripts/subset-fonts.sh)';

describe('subconjunto de fuente del h1', () => {
  it.each(LOCALES)('cubre el nombre del hero (%s)', (locale) => {
    const set = glyphs('cormorant-hero');
    const { first, last } = HOME[locale].hero;
    const missing = [...new Set(`${first} ${last}`)].filter((c) => !set.has(c.codePointAt(0)!));
    expect(missing, `faltan en cormorant-hero.woff2: ${REGENERATE}`).toEqual([]);
  });

  it('es mínimo: se precarga y compite con el LCP', () => {
    expect(statSync(HERO).size).toBeLessThanOrEqual(6 * 1024);
  });
});

// Guarda de glifos sin navegador: editar el copy o los datos de la home (home.ts, frentes.ts, locales) con un
// carácter que los subconjuntos no traen hace fallar `npm test`, no solo el e2e (que además comprueba la familia
// exacta de cada texto con getComputedStyle).
const decode = (s: string) =>
  s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&');

/** Texto que pinta la home: nodos de texto del HTML del servidor, placeholders y el `content` de home.css. */
async function homeText(locale: Locale): Promise<string> {
  const html = renderToStaticMarkup(await HomePage({ params: Promise.resolve({ locale }) }));
  const body = html.replace(/<script\b[\s\S]*?<\/script>/g, '').replace(/<style\b[\s\S]*?<\/style>/g, '');
  const text = body.replace(/<[^>]*>/g, ' ');
  const placeholders = [...body.matchAll(/\bplaceholder="([^"]*)"/g)].map((m) => m[1]);
  const css = readFileSync(fileURLToPath(new URL('../../src/styles/home.css', import.meta.url)), 'utf8');
  const pseudo = [...css.matchAll(/content:\s*'([^']*)'/g)].map((m) => m[1]);
  return decode([text, ...placeholders].join(' ')) + pseudo.join('');
}

const chars = (s: string) => [...new Set(s)].filter((c) => !/\s/u.test(c));

// Glifos que ninguna fuente de la home tiene y que siempre se pintaron con una fuente del sistema (igual que con las
// de Google): «ḗ» de Scholḗ, y «❚» del botón de pausa del grafo (tampoco está en JetBrains Mono). «î» (Mouseîon) no
// está en Geist: solo la pintan la marca (Cormorant) y el kicker, en mono y en mayúsculas por CSS («Î»). «▶» (el botón
// de pausa, pausado) va en mono.
const SYSTEM = new Set(['ḗ', '❚']);
const NOT_IN_SANS: Record<string, [font: string, glyph: string][]> = {
  î: [
    ['cormorant-home', 'î'],
    ['jetbrains-home', 'Î'],
  ],
  '▶': [['jetbrains-home', '▶']],
};

describe('cobertura de glifos del contenido de la home', () => {
  const sans = glyphs('geist-home');
  const display = glyphs('cormorant-home');

  it.each(LOCALES)('cada carácter del texto de /%s está en su subconjunto de fuente', async (locale) => {
    const missing = chars(await homeText(locale)).filter((c) => {
      if (SYSTEM.has(c) || sans.has(c.codePointAt(0)!)) return false;
      const elsewhere = NOT_IN_SANS[c];
      return !elsewhere || !elsewhere.every(([font, glyph]) => glyphs(font).has(glyph.codePointAt(0)!));
    });
    expect(missing.join(''), `caracteres sin glifo en geist-home.woff2: ${REGENERATE}`).toBe('');
  });

  // Titulares y nombres de producto y de frente: van en Cormorant (cormorant-home.woff2).
  it.each(LOCALES)('los nombres y titulares de /%s están en el subconjunto de Cormorant', (locale) => {
    const t = HOME[locale];
    const texts = [
      t.fronts.title, t.contact.title,
      ...productos.map((p) => p.nombre),
      ...frenteOrder.map((f) => frentesMeta[f].nombre[locale]),
    ];
    const missing = chars(texts.join(' ')).filter((c) => !SYSTEM.has(c) && !display.has(c.codePointAt(0)!));
    expect(missing.join(''), `caracteres sin glifo en cormorant-home.woff2: ${REGENERATE}`).toBe('');
  });

  it('detecta un carácter nuevo (control del propio test)', () => {
    expect(['ç', 'ō', '€', '≥'].filter((c) => sans.has(c.codePointAt(0)!))).toEqual([]);
  });
});
