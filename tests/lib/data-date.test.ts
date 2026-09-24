import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { committedDataDate, dataDate } from '../../scripts/data-date';

// Repositorio de prueba: un commit de datos (2026-01-15) y después 5 commits que no tocan datos (2026-02-01…05),
// como main tras el Plan 2 o una tanda de fixes. Vercel clona con --depth=10; aquí se reproduce con --depth 1 y 3.
let root: string;
let repo: string;

function git(cwd: string, args: string[], date?: string) {
  const env = date ? { ...process.env, GIT_AUTHOR_DATE: `${date}T12:00:00Z`, GIT_COMMITTER_DATE: `${date}T12:00:00Z` } : process.env;
  return execFileSync('git', ['-c', 'user.name=t', '-c', 'user.email=t@t', '-c', 'commit.gpgsign=false', ...args], { cwd, env, stdio: 'pipe' }).toString();
}

function commit(file: string, content: string, date: string) {
  mkdirSync(join(repo, file, '..'), { recursive: true });
  writeFileSync(join(repo, file), content);
  git(repo, ['add', '-A']);
  git(repo, ['commit', '-q', '-m', `cambia ${file}`], date);
}

function shallowClone(depth: number): string {
  const dir = join(root, `depth-${depth}`);
  git(root, ['clone', '-q', '--depth', String(depth), `file://${repo}`, dir]);
  return dir;
}

beforeAll(() => {
  root = mkdtempSync(join(tmpdir(), 'data-date-'));
  repo = join(root, 'repo');
  mkdirSync(repo);
  git(repo, ['init', '-q', '-b', 'main']);
  commit('README.md', 'inicio', '2026-01-01');
  commit('src/data/frentes.ts', 'export const x = 1;', '2026-01-15');
  for (let d = 1; d <= 5; d++) commit(`src/components/c${d}.tsx`, `// ${d}`, `2026-02-0${d}`);
});

afterAll(() => rmSync(root, { recursive: true, force: true }));

describe('dataDate (DATA_DATE de sitemap y JSON-LD)', () => {
  it('en un clon completo es la fecha del último commit de datos', () => {
    expect(dataDate({ cwd: repo, committed: '2025-12-31' })).toBe('2026-01-15');
  });

  it.each([1, 3])('en un clon superficial (--depth %i) que no llega al commit de datos conserva la fecha commiteada', (depth) => {
    const clone = shallowClone(depth);
    // Sin la guarda, git devuelve la frontera del clon, que es un commit de UI.
    expect(git(clone, ['log', '-1', '--format=%cs', '--', 'src/data'])).toMatch(/^2026-02-0/);
    expect(dataDate({ cwd: clone, committed: '2026-01-15' })).toBe('2026-01-15');
  });

  it('en un clon superficial que sí llega al commit de datos usa su fecha', () => {
    const clone = shallowClone(10);
    expect(dataDate({ cwd: clone, committed: '2025-12-31' })).toBe('2026-01-15');
  });

  it('sin repositorio git conserva la fecha commiteada', () => {
    const plain = mkdtempSync(join(root, 'sin-git-'));
    // Por si el directorio temporal cuelga de otro repositorio: git no debe buscar más arriba de `root`.
    const ceiling = process.env.GIT_CEILING_DIRECTORIES;
    process.env.GIT_CEILING_DIRECTORIES = root;
    try {
      expect(dataDate({ cwd: plain, committed: '2026-01-15' })).toBe('2026-01-15');
    } finally {
      if (ceiling === undefined) delete process.env.GIT_CEILING_DIRECTORIES;
      else process.env.GIT_CEILING_DIRECTORIES = ceiling;
    }
  });

  it('lee el DATA_DATE de stats.ts', () => {
    const stats = join(root, 'stats.ts');
    writeFileSync(stats, "export const DATA_DATE = '2026-09-24';\n");
    expect(committedDataDate(stats)).toBe('2026-09-24');
    expect(committedDataDate(join(root, 'no-existe.ts'))).toBeNull();
  });
});
