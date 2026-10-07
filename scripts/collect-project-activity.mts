import { mkdir, rename, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { PUBLIC_PROJECT_CATALOG as PROJECT_CATALOG } from '../src/activity/projects/catalog';
import { collectPublicProjects } from '../src/activity/projects/collector';
import type { ProjectSnapshot } from '../src/activity/projects/model';

const REPOSITORY = 'stevenvo780/mi-cv';
const OWNER = 'stevenvo780';
const APPROVED_PATHS = new Set(PROJECT_CATALOG.map(({ repo }) => `/repos/${OWNER}/${repo}/commits`));
const APPROVED_PARAMETERS = new Set(['author', 'since', 'until', 'per_page']);

/** The Actions token can reach only the published catalogue's count requests. */
export function createPublicProjectFetcher(token: string, transport: typeof fetch = fetch): typeof fetch {
  return async (input, init) => {
    const url = new URL(input instanceof Request ? input.url : input.toString());
    const method = init?.method ?? (input instanceof Request ? input.method : 'GET');
    const parameters = [...url.searchParams.keys()];
    const since = url.searchParams.get('since');
    const until = url.searchParams.get('until');
    if (
      url.origin !== 'https://api.github.com' || url.username || url.password || url.hash ||
      !APPROVED_PATHS.has(url.pathname) || method.toUpperCase() !== 'GET' || init?.body ||
      parameters.length !== 4 || new Set(parameters).size !== 4 ||
      parameters.some((key) => !APPROVED_PARAMETERS.has(key)) ||
      url.searchParams.get('author') !== OWNER || url.searchParams.get('per_page') !== '1' ||
      !since || !until || !Number.isFinite(Date.parse(since)) || !Number.isFinite(Date.parse(until)) ||
      Date.parse(since) > Date.parse(until)
    ) throw new Error('Request outside the published project catalogue');

    const headers = new Headers(init?.headers);
    headers.set('Authorization', `Bearer ${token}`);
    headers.set('Accept', 'application/vnd.github+json');
    headers.set('User-Agent', 'Mouseion-Public-Activity-Collector/1.0');
    // Redirects must never carry the job token to a different host or endpoint.
    return transport(url, { ...init, method: 'GET', headers, redirect: 'error', credentials: 'omit' });
  };
}

/** Rebuild the public payload: response metadata and commit contents cannot leak into it. */
export function publicSnapshot(snapshot: ProjectSnapshot, now = new Date()): ProjectSnapshot {
  const measured = Date.parse(snapshot.updatedAt);
  if (
    snapshot.version !== 1 || snapshot.source !== 'github-public' || snapshot.metric !== 'commits' ||
    snapshot.coverage !== 'published-projects' || !Number.isFinite(measured) ||
    measured > now.getTime() + 300_000 || !Array.isArray(snapshot.projects) ||
    snapshot.projects.length !== PROJECT_CATALOG.length
  ) throw new Error('Invalid public project snapshot');

  const byId = new Map(snapshot.projects.map((project) => [project.id, project]));
  if (byId.size !== PROJECT_CATALOG.length) throw new Error('Invalid published project selection');
  const projects = PROJECT_CATALOG.map(({ id, name, description, url, kind }) => {
    const identity = { id, name, description, url, kind };
    const project = byId.get(identity.id);
    if (!project) throw new Error('Missing published project');
    const { week, month, year } = project.counts;
    if (
      ![week, month, year].every((count) => Number.isSafeInteger(count) && count >= 0 && count <= 1_000_000) ||
      week > month || month > year
    ) throw new Error('Invalid published project counts');
    const lastActive = project.lastActive;
    if (lastActive !== null && (
      !/^\d{4}-\d{2}-\d{2}$/.test(lastActive) || !Number.isFinite(Date.parse(lastActive)) ||
      new Date(lastActive).toISOString().slice(0, 10) !== lastActive ||
      lastActive > now.toISOString().slice(0, 10)
    )) throw new Error('Invalid published activity date');
    if ((year === 0) !== (lastActive === null)) throw new Error('Inconsistent published activity date');
    return { ...identity, counts: { week, month, year }, lastActive };
  });
  return {
    version: 1, source: 'github-public', metric: 'commits', coverage: 'published-projects',
    updatedAt: new Date(measured).toISOString(), projects,
  };
}

async function main() {
  // No local credential discovery: this collector runs with the native, temporary job token only.
  if (process.env.GITHUB_ACTIONS !== 'true' || process.env.GITHUB_REPOSITORY !== REPOSITORY) {
    throw new Error('Collector requires its own GitHub Actions job');
  }
  const token = process.env.GITHUB_TOKEN;
  const [destination, ...extra] = process.argv.slice(2);
  if (!token || !destination || extra.length || !destination.endsWith('.json')) {
    throw new Error('Collector configuration unavailable');
  }
  const now = new Date();
  const snapshot = publicSnapshot(await collectPublicProjects(now, createPublicProjectFetcher(token)), now);
  const output = resolve(destination);
  const temporary = `${output}.tmp-${process.pid}`;
  await mkdir(dirname(output), { recursive: true });
  await writeFile(temporary, `${JSON.stringify(snapshot)}\n`, { encoding: 'utf8', mode: 0o644 });
  await rename(temporary, output);
  console.info(`Public activity feed ready: ${snapshot.projects.length} published projects; measured ${snapshot.updatedAt}.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch(() => {
    // Raw errors can include request details. A failed collection never reaches the upload step.
    console.error('Public activity collection failed. No new feed was published.');
    process.exitCode = 1;
  });
}
