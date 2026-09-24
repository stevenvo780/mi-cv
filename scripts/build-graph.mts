import { mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { buildArtifacts } from '../src/graph/artifacts';
import { committedDataDate, dataDate } from './data-date';

const PUBLIC_DIR = 'public/graph';
const GENERATED_DIR = 'src/graph/generated';
const STATS_FILE = `${GENERATED_DIR}/stats.ts`;
const HEADER = '// Generado por scripts/build-graph.mts — no editar a mano.\n';

// Se lee antes de reescribir stats.ts: es el respaldo de dataDate() en un clon superficial.
const date = dataDate({ committed: committedDataDate(STATS_FILE) });
const { bin, meta, posterSvg, posterHash, hash, model } = buildArtifacts();

const dataGz = gzipSync(bin).length + gzipSync(JSON.stringify(meta)).length;
const posterGz = gzipSync(posterSvg).length;
if (dataGz > 60 * 1024) throw new Error(`Datos del grafo ${dataGz} B gz > 60 KB`);
if (posterGz > 12 * 1024) throw new Error(`Póster ${posterGz} B gz > 12 KB`);

mkdirSync(PUBLIC_DIR, { recursive: true });
mkdirSync(GENERATED_DIR, { recursive: true });
for (const f of readdirSync(PUBLIC_DIR)) {
  if (/^graph\.[0-9a-f]{10}\.(bin|json)$/.test(f) && !f.includes(hash)) rmSync(`${PUBLIC_DIR}/${f}`);
  if (/^poster\.[0-9a-f]{10}\.svg$/.test(f) && !f.includes(posterHash)) rmSync(`${PUBLIC_DIR}/${f}`);
}
writeFileSync(`${PUBLIC_DIR}/graph.${hash}.bin`, bin);
writeFileSync(`${PUBLIC_DIR}/graph.${hash}.json`, JSON.stringify(meta));
// El póster de la home es un archivo aparte (Stage.tsx lo pinta con <img>): inline iba dos veces en el HTML, como
// marcado y dentro del payload RSC (spec §5.2). El módulo POSTER_SVG queda para la imagen OG, que se genera en build.
writeFileSync(`${PUBLIC_DIR}/poster.${posterHash}.svg`, posterSvg);
writeFileSync(`${GENERATED_DIR}/poster.ts`, `${HEADER}export const POSTER_SVG = ${JSON.stringify(posterSvg)};\n`);
writeFileSync(
  STATS_FILE,
  `${HEADER}export const GRAPH_STATS = { nodes: ${model.nodes.length}, edges: ${model.edges.length} } as const;\n` +
    `export const GRAPH_ASSET = { bin: '/graph/graph.${hash}.bin', meta: '/graph/graph.${hash}.json' } as const;\n` +
    `export const POSTER_ASSET = '/graph/poster.${posterHash}.svg';\n` +
    `export const DATA_DATE = '${date}';\n`,
);
console.log(`grafo ${hash}: ${model.nodes.length} nodos, ${model.edges.length} aristas · datos ${dataGz} B gz · póster ${posterGz} B gz`);
