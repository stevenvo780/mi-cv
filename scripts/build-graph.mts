import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { buildArtifacts } from '../src/graph/artifacts';

const PUBLIC_DIR = 'public/graph';
const GENERATED_DIR = 'src/graph/generated';
const STATS_FILE = `${GENERATED_DIR}/stats.ts`;
const HEADER = '// Generado por scripts/build-graph.mts — no editar a mano.\n';

function dataDate(): string {
  try {
    const out = execSync('git log -1 --format=%cs -- src/data src/locales src/graph/relations.ts src/graph/sources.ts', {
      stdio: ['ignore', 'pipe', 'ignore'],
    })
      .toString()
      .trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(out)) return out;
  } catch {
    // sin git (p. ej. clon superficial): se conserva la fecha ya generada
  }
  if (existsSync(STATS_FILE)) {
    const previous = readFileSync(STATS_FILE, 'utf8').match(/DATA_DATE = '(\d{4}-\d{2}-\d{2})'/);
    if (previous) return previous[1];
  }
  return new Date().toISOString().slice(0, 10);
}

const { bin, meta, posterSvg, hash, model } = buildArtifacts();

const dataGz = gzipSync(bin).length + gzipSync(JSON.stringify(meta)).length;
const posterGz = gzipSync(posterSvg).length;
if (dataGz > 60 * 1024) throw new Error(`Datos del grafo ${dataGz} B gz > 60 KB`);
if (posterGz > 12 * 1024) throw new Error(`Póster ${posterGz} B gz > 12 KB`);

mkdirSync(PUBLIC_DIR, { recursive: true });
mkdirSync(GENERATED_DIR, { recursive: true });
for (const f of readdirSync(PUBLIC_DIR)) {
  if (/^graph\.[0-9a-f]{10}\.(bin|json)$/.test(f) && !f.includes(hash)) rmSync(`${PUBLIC_DIR}/${f}`);
}
writeFileSync(`${PUBLIC_DIR}/graph.${hash}.bin`, bin);
writeFileSync(`${PUBLIC_DIR}/graph.${hash}.json`, JSON.stringify(meta));
writeFileSync(`${GENERATED_DIR}/poster.ts`, `${HEADER}export const POSTER_SVG = ${JSON.stringify(posterSvg)};\n`);
writeFileSync(
  STATS_FILE,
  `${HEADER}export const GRAPH_STATS = { nodes: ${model.nodes.length}, edges: ${model.edges.length} } as const;\n` +
    `export const GRAPH_ASSET = { bin: '/graph/graph.${hash}.bin', meta: '/graph/graph.${hash}.json' } as const;\n` +
    `export const DATA_DATE = '${dataDate()}';\n`,
);
console.log(`grafo ${hash}: ${model.nodes.length} nodos, ${model.edges.length} aristas · datos ${dataGz} B gz · póster ${posterGz} B gz`);
