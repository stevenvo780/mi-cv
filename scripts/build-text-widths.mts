// Tabla de avances de Geist (subconjunto de la home) para medir etiquetas en el servidor: el mapa de cada catálogo
// (src/lib/catalogMap.ts) decide con ella cuántas líneas ocupa cada etiqueta. Se regenera tras regenerar las fuentes:
//   npx tsx scripts/build-text-widths.mts
// tests/lib/catalog-map.test.ts comprueba que la tabla coincide con geist-home.woff2.
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const fontkit = createRequire(import.meta.url)('next/dist/compiled/@next/font/dist/fontkit').default;
const openFont = fontkit.default ?? fontkit;
const font = openFont(readFileSync(new URL('../src/app/fonts/geist-home.woff2', import.meta.url)));

const widths: Record<string, number> = {};
for (const cp of [...font.characterSet].sort((a: number, b: number) => a - b)) {
  const ch = String.fromCodePoint(cp);
  const glyph = font.glyphForCodePoint(cp);
  widths[ch] = Math.round((glyph.advanceWidth / font.unitsPerEm) * 1000);
}

const out = `// Generado por scripts/build-text-widths.mts desde src/app/fonts/geist-home.woff2 — no editar a mano.
/** Avance de cada carácter de Geist, en milésimas de em. */
export const GEIST_ADVANCE: Record<string, number> = ${JSON.stringify(widths)};
`;
writeFileSync(new URL('../src/lib/generated/geistAdvance.ts', import.meta.url), out);
console.log(`geistAdvance.ts: ${Object.keys(widths).length} caracteres`);
