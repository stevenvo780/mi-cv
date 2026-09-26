// Hoja del arte de la home: une las hojas de src/components/home/art (primero las compartidas, «_*.css»), la minifica
// y la publica con su hash en el nombre, fuera de la ruta crítica: Fronts.tsx la enlaza en el cuerpo, justo antes del
// catálogo, así que no retrasa el hero (el LCP). Corre en el prebuild; en desarrollo, `npm run art:build`.
//   npx tsx scripts/build-art-css.mts
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { transform } from 'esbuild';

const DIR = new URL('../src/components/home/art/', import.meta.url);
const PUBLIC = new URL('../public/art/', import.meta.url);

const files = readdirSync(DIR)
  .filter((f) => f.endsWith('.css'))
  .sort((a, b) => Number(!a.startsWith('_')) - Number(!b.startsWith('_')) || a.localeCompare(b));
const source = files.map((f) => `/* ${f} */\n${readFileSync(new URL(f, DIR), 'utf8')}`).join('\n');
// El esbuild del repo: sin «target», así que conserva @layer, @container, :has() y la sintaxis moderna tal cual.
const { code } = await transform(source, { loader: 'css', minify: true, legalComments: 'none' });
const hash = createHash('sha1').update(code).digest('hex').slice(0, 10);

for (const f of readdirSync(PUBLIC)) if (/^art\.[0-9a-f]{10}\.css$/.test(f)) rmSync(new URL(f, PUBLIC));
writeFileSync(new URL(`art.${hash}.css`, PUBLIC), code);
writeFileSync(
  new URL('generated.ts', DIR),
  `// Generado por scripts/build-art-css.mts — no editar a mano.\nexport const ART_CSS = '/art/art.${hash}.css' as const;\nexport const ART_CSS_BYTES = ${Buffer.byteLength(code)};\n`,
);
console.log(`art.${hash}.css: ${files.length} hojas, ${Buffer.byteLength(code)} B`);
