import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/** Rutas cuyos commits cambian los datos del sitio: DATA_DATE es la fecha del último que las toca. */
export const DATA_PATHS = ['src/data', 'src/locales', 'src/graph/relations.ts', 'src/graph/sources.ts'];

const DATE = /^\d{4}-\d{2}-\d{2}$/;

function git(cwd: string, args: string[]): string {
  return execFileSync('git', args, { cwd, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
}

/**
 * ¿Es `sha` un commit frontera de un clon superficial? Vercel clona con --depth=10: git trata la frontera como
 * raíz, así que su diff "toca" todos los archivos y `git log -1 -- <rutas>` la devuelve aunque no cambie datos.
 */
function isShallowBoundary(cwd: string, sha: string): boolean {
  if (git(cwd, ['rev-parse', '--is-shallow-repository']) !== 'true') return false;
  const shallowFile = resolve(cwd, git(cwd, ['rev-parse', '--git-path', 'shallow']));
  return readFileSync(shallowFile, 'utf8').split('\n').includes(sha);
}

/**
 * Fecha (YYYY-MM-DD) del último commit que tocó los datos, para el lastModified del sitemap y el dateModified del
 * JSON-LD. Si git no está, o si en un clon superficial el commit que devuelve es la frontera (la fecha real queda
 * fuera del clon), conserva `committed`: el DATA_DATE ya generado. Por eso src/graph/generated/stats.ts se
 * regenera (npm run graph:build) y se commitea después de commitear los cambios de datos.
 */
export function dataDate({ cwd = process.cwd(), committed }: { cwd?: string; committed: string | null }): string {
  try {
    const [sha, date] = git(cwd, ['log', '-1', '--format=%H %cs', '--', ...DATA_PATHS]).split(' ');
    if (sha && date && DATE.test(date) && !isShallowBoundary(cwd, sha)) return date;
  } catch {
    // sin git o sin repositorio: se conserva la fecha ya generada
  }
  return committed && DATE.test(committed) ? committed : new Date().toISOString().slice(0, 10);
}

/** DATA_DATE commiteado en src/graph/generated/stats.ts, o null si aún no existe. */
export function committedDataDate(statsFile: string): string | null {
  try {
    return readFileSync(statsFile, 'utf8').match(/DATA_DATE = '(\d{4}-\d{2}-\d{2})'/)?.[1] ?? null;
  } catch {
    return null;
  }
}
