// Arte de la home, listo para servir. Corre en el prebuild; en desarrollo, `npm run art:build`.
//   npx tsx scripts/build-art.mts
// 1. La hoja: une las hojas de src/components/home/art (primero las compartidas, «_*.css»), la minifica y la publica con
//    su hash en el nombre, fuera de la ruta crítica: Fronts.tsx la enlaza en el cuerpo, justo antes del catálogo, así
//    que no retrasa el hero (el LCP).
// 2. El HTML: pinta cada pieza en cada idioma. En producción ArtBox lo inserta tal cual: React no recorre esos nodos al
//    hidratar ni los repite uno a uno en la carga RSC del documento (tests/components/art.test.ts vigila que esté al día).
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { transform } from 'esbuild';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import * as registry from '@/components/home/art/index';
import { LOCALES } from '@/lib/site';

const DIR = new URL('../src/components/home/art/', import.meta.url);
const PUBLIC = new URL('../public/art/', import.meta.url);

const files = readdirSync(DIR)
  .filter((f) => f.endsWith('.css'))
  .sort((a, b) => Number(!a.startsWith('_')) - Number(!b.startsWith('_')) || a.localeCompare(b));
const source = files.map((f) => `/* ${f} */\n${readFileSync(new URL(f, DIR), 'utf8')}`).join('\n');
// El esbuild del repo: sin «target», así que conserva @layer, @container, :has() y la sintaxis moderna tal cual.
const { code } = await transform(source, { loader: 'css', minify: true, legalComments: 'none' });
const hash = createHash('sha1').update(code).digest('hex').slice(0, 10);

// tsx entrega el índice como módulo CommonJS: ART puede venir envuelto en default.
const mod = registry as unknown as { ART?: typeof registry.ART; default?: { ART: typeof registry.ART } };
const ART = mod.ART ?? mod.default!.ART;
const html: Record<string, Record<string, string>> = {};
for (const id of Object.keys(ART).sort()) {
  html[id] = Object.fromEntries(LOCALES.map((locale) => [locale, renderToStaticMarkup(createElement(ART[id], { locale }))]));
}
const entries = Object.entries(html).map(([id, byLocale]) => {
  const values = [...new Set(Object.values(byLocale))];
  return `  ${JSON.stringify(id)}: ${values.length === 1 ? JSON.stringify(values[0]) : JSON.stringify(byLocale)},`;
});

for (const f of readdirSync(PUBLIC)) if (/^art\.[0-9a-f]{10}\.css$/.test(f)) rmSync(new URL(f, PUBLIC));
writeFileSync(new URL(`art.${hash}.css`, PUBLIC), code);
writeFileSync(
  new URL('generated.ts', DIR),
  `// Generado por scripts/build-art.mts — no editar a mano.
import type { Locale } from '@/lib/site';

export const ART_CSS = '/art/art.${hash}.css' as const;
export const ART_CSS_BYTES = ${Buffer.byteLength(code)};

/** El HTML de cada pieza: uno solo si no depende del idioma. */
export const ART_HTML: Record<string, string | Record<Locale, string>> = {
${entries.join('\n')}
};
`,
);
const htmlBytes = Object.values(html).reduce((n, byLocale) => n + Buffer.byteLength(byLocale[LOCALES[0]]), 0);
console.log(`art.${hash}.css: ${files.length} hojas, ${Buffer.byteLength(code)} B; HTML de ${Object.keys(html).length} piezas: ${htmlBytes} B (${LOCALES[0]})`);
