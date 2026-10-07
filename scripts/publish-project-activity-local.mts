import { spawn } from 'node:child_process';
import { chmod, lstat, mkdir, mkdtemp, open, readFile, realpath, rename, rm, stat } from 'node:fs/promises';
import { basename, dirname, extname, isAbsolute, join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { PROJECT_CATALOG } from '../src/activity/projects/catalog';
import type { ProjectActivity, ProjectSnapshot } from '../src/activity/projects/model';
import { validateProjectFeed } from '../src/activity/projects/validation';

const OWNER = 'stevenvo780';
const ASSET = 'projects-selected.json';
export const BACKUPASSET = 'projects-selected-backup.json';
const RELEASE = 'activity-feed';
const DAY = 86_400_000;
const MAX_OUTPUT = 1_048_576;
const COMMAND_TIMEOUT = 45_000;
const ROOT = fileURLToPath(new URL('../', import.meta.url));
const GRAPHQL_ARGS = ['api', 'graphql', '--hostname', 'github.com', '--input', '-'] as const;
const VIEWER_QUERY = 'query PublisherViewer { viewer { id login } }';
export const SELECTED_HISTORY_QUERY = `query SelectedProjectActivity(
  $repo:String!, $author:ID!, $week:GitTimestamp!, $month:GitTimestamp!, $year:GitTimestamp!, $until:GitTimestamp!
) {
  repository(owner:"stevenvo780",name:$repo) {
    defaultBranchRef { target { ... on Commit {
      week:history(first:1,author:{id:$author},since:$week,until:$until) { totalCount }
      month:history(first:1,author:{id:$author},since:$month,until:$until) { totalCount }
      year:history(first:1,author:{id:$author},since:$year,until:$until) { totalCount nodes { committedDate } }
    } } }
  }
}`;

export type GhRunner = (args: readonly string[], input?: string) => Promise<string>;
export interface PublisherConfig { projects: { id: string; repo: string }[] }
export interface PublisherArgs { configPath: string; destination: string; publish: boolean }
export interface PublisherWindows { week: string; month: string; year: string; until: string }
const object = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value);
const exactKeys = (value: Record<string, unknown>, keys: string[]) =>
  Object.keys(value).length === keys.length && keys.every((key) => Object.hasOwn(value, key));

/** Private paths exist only in this external config; they never become public identity fields. */
export function validatePublisherConfig(input: unknown): PublisherConfig {
  if (!object(input) || !exactKeys(input, ['projects']) || !Array.isArray(input.projects)
    || input.projects.length !== PROJECT_CATALOG.length) throw new Error('Invalid local publisher configuration');
  const rows = new Map<string, string>();
  const repositories = new Set<string>();
  const approved = new Set(PROJECT_CATALOG.map((project) => project.id));
  for (const row of input.projects) {
    if (!object(row) || !exactKeys(row, ['id', 'repo']) || typeof row.id !== 'string' || !approved.has(row.id)
      || rows.has(row.id) || typeof row.repo !== 'string' || !/^[A-Za-z0-9_.-]{1,100}$/.test(row.repo)
      || row.repo === '.' || row.repo === '..' || repositories.has(row.repo.toLowerCase())) {
      throw new Error('Invalid local publisher configuration');
    }
    rows.set(row.id, row.repo);
    repositories.add(row.repo.toLowerCase());
  }
  return { projects: PROJECT_CATALOG.map(({ id }) => ({ id, repo: rows.get(id)! })) };
}

export function parsePublisherArgs(args: string[]): PublisherArgs {
  const publish = args.includes('--publish');
  const paths = args.filter((arg) => arg !== '--publish');
  if (args.filter((arg) => arg === '--publish').length > 1 || paths.length !== 2
    || paths.some((path) => !path || path.startsWith('-') || extname(path) !== '.json')
    || resolve(paths[0]) === resolve(paths[1]) || (publish && basename(paths[1]) !== ASSET)) {
    throw new Error('Usage: publish-project-activity-local.mts <config.json> <destination.json> [--publish]');
  }
  return { configPath: resolve(paths[0]), destination: resolve(paths[1]), publish };
}

export function assertExternalConfigPath(configPath: string, repositoryRoot = ROOT): void {
  const path = relative(resolve(repositoryRoot), resolve(configPath));
  if (!path || (!isAbsolute(path) && path !== '..' && !path.startsWith(`..${process.platform === 'win32' ? '\\' : '/'}`))) {
    throw new Error('Publisher configuration must remain outside the repository');
  }
}

/** Inclusive UTC calendar windows, identical for every project in this measurement. */
export function publisherWindows(now = new Date()): PublisherWindows {
  if (!Number.isFinite(now.getTime())) throw new Error('Invalid publisher date');
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return { week: new Date(today - 6 * DAY).toISOString(), month: new Date(today - 29 * DAY).toISOString(),
    year: new Date(today - 364 * DAY).toISOString(), until: new Date(today + DAY - 1).toISOString() };
}

/** Native gh handles its existing authentication. No token, auth file or secret environment is read here. */
export const runNativeGh: GhRunner = (args, input) => new Promise((done, reject) => {
  let settled = false;
  let bytes = 0;
  const chunks: Buffer[] = [];
  const child = spawn('gh', [...args], { stdio: ['pipe', 'pipe', 'ignore'], shell: false });
  const finish = (failed: boolean) => {
    if (settled) return;
    settled = true;
    clearTimeout(timer);
    if (failed) { child.kill('SIGKILL'); chunks.length = 0; reject(new Error('Native GitHub command unavailable')); }
    else done(Buffer.concat(chunks).toString('utf8'));
  };
  const timer = setTimeout(() => { child.kill('SIGKILL'); finish(true); }, COMMAND_TIMEOUT);
  child.once('error', () => finish(true));
  child.stdin.on('error', () => finish(true));
  child.stdout.on('error', () => finish(true));
  child.stdout.on('data', (chunk: Buffer) => {
    bytes += chunk.length;
    if (bytes > MAX_OUTPUT) { child.kill('SIGKILL'); finish(true); }
    else if (!settled) chunks.push(chunk);
  });
  child.once('close', (code) => finish(code !== 0));
  child.stdin.end(input);
});

function graphqlBody(raw: string): Record<string, unknown> {
  let parsed: unknown;
  try { parsed = JSON.parse(raw); } catch { throw new Error('Invalid selected project response'); }
  if (!object(parsed) || !object(parsed.data) || (parsed.errors !== undefined
    && (!Array.isArray(parsed.errors) || parsed.errors.length))) throw new Error('Selected project query unavailable');
  return parsed.data;
}

export function parsePublisherViewer(raw: string): string {
  const viewer = graphqlBody(raw).viewer;
  if (!object(viewer) || viewer.login !== OWNER || typeof viewer.id !== 'string' || !viewer.id || viewer.id.length > 200) {
    throw new Error('Authenticated account is not the approved owner');
  }
  return viewer.id;
}

export function parseSelectedHistory(raw: string, windows: PublisherWindows): Pick<ProjectActivity, 'counts' | 'lastActive'> {
  const repository = graphqlBody(raw).repository;
  if (!object(repository)) throw new Error('Selected project query unavailable');
  // A real empty repository has no default branch. Missing/inaccessible repositories above remain failures.
  if (repository.defaultBranchRef === null) return { counts: { week: 0, month: 0, year: 0 }, lastActive: null };
  const branch = repository.defaultBranchRef;
  if (!object(branch) || !object(branch.target)) throw new Error('Invalid selected project response');
  const counts = { week: 0, month: 0, year: 0 };
  for (const period of ['week', 'month', 'year'] as const) {
    const history = branch.target[period];
    if (!object(history) || !Number.isSafeInteger(history.totalCount) || Number(history.totalCount) < 0
      || Number(history.totalCount) > 1_000_000) throw new Error('Invalid selected project counts');
    counts[period] = Number(history.totalCount);
  }
  if (counts.week > counts.month || counts.month > counts.year) throw new Error('Invalid selected project counts');
  const history = branch.target.year as Record<string, unknown>;
  if (!Array.isArray(history.nodes) || history.nodes.length !== (counts.year ? 1 : 0)) throw new Error('Invalid selected project date');
  if (!counts.year) return { counts, lastActive: null };
  const node = history.nodes[0];
  const committedDate = object(node) && typeof node.committedDate === 'string' ? node.committedDate : '';
  const measured = Date.parse(committedDate);
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,9})?Z$/.test(committedDate)
    || !Number.isFinite(measured) || new Date(measured).toISOString().slice(0, 19) !== committedDate.slice(0, 19)
    || measured < Date.parse(windows.year) || measured > Date.parse(windows.until)) {
    throw new Error('Invalid selected project date');
  }
  return { counts, lastActive: new Date(measured).toISOString().slice(0, 10) };
}

export async function mapWithConcurrency<T, R>(values: T[], limit: number, work: (value: T) => Promise<R>): Promise<R[]> {
  if (!Number.isInteger(limit) || limit < 1 || limit > 4) throw new Error('Invalid publisher concurrency');
  const result: R[] = new Array(values.length);
  let cursor = 0;
  let failed = false;
  const workers = Array.from({ length: Math.min(limit, values.length) }, async () => {
    while (!failed) {
      const index = cursor++;
      if (index >= values.length) return;
      try { result[index] = await work(values[index]); } catch { failed = true; }
    }
  });
  await Promise.all(workers);
  if (failed) throw new Error('Selected project activity unavailable');
  return result;
}

export async function collectSelectedProjects(input: unknown, now = new Date(), runGh: GhRunner = runNativeGh): Promise<ProjectSnapshot> {
  const config = validatePublisherConfig(input);
  const windows = publisherWindows(now);
  const request = async (query: string, variables: Record<string, string> = {}) => {
    try { return await runGh(GRAPHQL_ARGS, JSON.stringify({ query, variables })); }
    catch { throw new Error('Native GitHub command unavailable'); }
  };
  const author = parsePublisherViewer(await request(VIEWER_QUERY));
  const rows = await mapWithConcurrency(config.projects, 4, async ({ id, repo }) => ({
    id, ...parseSelectedHistory(await request(SELECTED_HISTORY_QUERY, { repo, author, ...windows }), windows),
  }));
  // The boundary reconstructs the catalogue's approved names/links/species, never the local mappings or raw metadata.
  return validateProjectFeed({ version: 1, source: 'github-authorized', metric: 'commits', coverage: 'published-projects',
    updatedAt: now.toISOString(), projects: rows }, now);
}

export function releaseUploadArgs(destination: string): string[] {
  if (![ASSET, BACKUPASSET].includes(basename(destination))) throw new Error('Invalid published asset filename');
  return ['release', 'upload', RELEASE, resolve(destination), '--repo', 'github.com/stevenvo780/mi-cv', '--clobber'];
}

export function releaseDownloadArgs(asset: string): string[] {
  if (![ASSET, BACKUPASSET].includes(asset)) throw new Error('Invalid published asset filename');
  return ['release', 'download', RELEASE, '--repo', 'github.com/stevenvo780/mi-cv', '--pattern', asset, '--output', '-'];
}

async function readPublishedSlot(asset: string, now: Date, runGh: GhRunner): Promise<ProjectSnapshot | null> {
  try {
    const snapshot = validateProjectFeed(JSON.parse(await runGh(releaseDownloadArgs(asset))), now);
    return snapshot.source === 'github-authorized' && snapshot.projects.length === PROJECT_CATALOG.length ? snapshot : null;
  } catch { return null; } // Missing, malformed or inaccessible slots never cause raw gh errors to enter logs.
}

export async function probeSelectedSlots(now = new Date(), runGh: GhRunner = runNativeGh): Promise<{ primary: boolean; backup: boolean }> {
  const [primary, backup] = await Promise.all([
    readPublishedSlot(ASSET, now, runGh), readPublishedSlot(BACKUPASSET, now, runGh),
  ]);
  return { primary: primary !== null, backup: backup !== null };
}

/** Validate before touching disk; rename a durable, complete file over the old output. */
export async function writeSelectedFeed(destination: string, input: unknown, now = new Date()): Promise<ProjectSnapshot> {
  const snapshot = validateProjectFeed(input, now);
  if (snapshot.source !== 'github-authorized' || snapshot.projects.length !== PROJECT_CATALOG.length) {
    throw new Error('Invalid selected project feed');
  }
  if (extname(destination) !== '.json') throw new Error('Invalid feed destination');
  const output = resolve(destination);
  const existing = await lstat(output).catch((error: NodeJS.ErrnoException) => {
    if (error.code === 'ENOENT') return null;
    throw new Error('Feed destination unavailable');
  });
  if (existing && !existing.isFile()) throw new Error('Invalid feed destination');
  await mkdir(dirname(output), { recursive: true });
  const temporaryDirectory = await mkdtemp(join(dirname(output), '.selected-feed-'));
  const temporary = join(temporaryDirectory, ASSET);
  try {
    const file = await open(temporary, 'wx', 0o600);
    try { await file.writeFile(`${JSON.stringify(snapshot)}\n`, 'utf8'); await file.sync(); } finally { await file.close(); }
    await chmod(temporary, 0o644);
    await rename(temporary, output);
    const directory = await open(dirname(output), 'r');
    try { await directory.sync(); } finally { await directory.close(); }
  } finally { await rm(temporaryDirectory, { recursive: true, force: true }); }
  return snapshot;
}

export async function publishSelectedFeed(args: PublisherArgs, now = new Date(), runGh: GhRunner = runNativeGh): Promise<ProjectSnapshot> {
  assertExternalConfigPath(args.configPath);
  const configPath = await realpath(args.configPath);
  assertExternalConfigPath(configPath);
  const info = await stat(configPath);
  if (!info.isFile() || info.size > 16_384) throw new Error('Invalid local publisher configuration');
  const canonicalOutput = join(await realpath(dirname(args.destination)), basename(args.destination));
  if (canonicalOutput === configPath) throw new Error('Invalid feed destination');
  const backupPath = join(dirname(canonicalOutput), BACKUPASSET);
  if (args.publish && (basename(canonicalOutput) !== ASSET || backupPath === configPath)) {
    throw new Error('Invalid published asset filename');
  }
  let input: unknown;
  try { input = JSON.parse(await readFile(configPath, 'utf8')); } catch { throw new Error('Invalid local publisher configuration'); }
  const snapshot = await collectSelectedProjects(input, now, runGh);
  if (!args.publish) return writeSelectedFeed(canonicalOutput, snapshot, now);
  const slots = await probeSelectedSlots(now, runGh);
  if (!slots.primary && !slots.backup) throw new Error('Selected publication requires a valid existing slot');
  // Never clobber the sole valid survivor. Successful readback of the first replacement protects the second.
  const order = slots.primary ? [BACKUPASSET, ASSET] : [ASSET, BACKUPASSET];
  for (let i = 0; i < order.length; i++) {
    const asset = order[i];
    const destination = asset === ASSET ? canonicalOutput : backupPath;
    await writeSelectedFeed(destination, snapshot, now);
    try { await runGh(releaseUploadArgs(destination)); }
    catch { throw new Error('Selected feed publication unavailable'); }
    if (i === 0) {
      const confirmed = await readPublishedSlot(asset, now, runGh);
      if (!confirmed || JSON.stringify(confirmed) !== JSON.stringify(snapshot)) {
        throw new Error('Selected feed publication unavailable');
      }
    }
  }
  return snapshot;
}

async function main(): Promise<void> {
  if (process.argv.slice(2).join(' ') === '--help') {
    console.info('Usage: publish-project-activity-local.mts <config.json> <destination.json> [--publish]');
    return;
  }
  const args = parsePublisherArgs(process.argv.slice(2));
  const snapshot = await publishSelectedFeed(args);
  console.info(`Selected activity feed ${args.publish ? 'published' : 'ready'}: ${snapshot.projects.length} approved projects; measured ${snapshot.updatedAt}.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch(() => {
    // gh stderr, local config names, request details and thrown upstream messages never enter logs.
    console.error('Selected activity publisher did not complete.');
    process.exitCode = 1;
  });
}
