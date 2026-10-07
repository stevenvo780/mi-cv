import { PUBLIC_PROJECT_CATALOG as PROJECT_CATALOG } from './catalog';
import type { ProjectActivity, ProjectPeriod, ProjectSnapshot } from './model';

const OWNER = 'stevenvo780';
const DAY = 86_400_000;
const LENGTHS: Record<ProjectPeriod, number> = { week: 7, month: 30, year: 365 };
const MAX_COUNT = 1_000_000;
let cooldownUntil = 0;

function deferSource(response: Response) {
  const time = Date.now();
  let until = time + 60_000;
  if (response.status === 403 || response.status === 429) {
    const retry = response.headers.get('retry-after');
    const reset = Number(response.headers.get('x-ratelimit-reset')) * 1000;
    if (retry) until = Math.max(until, /^\d+$/.test(retry) ? time + Number(retry) * 1000 : Date.parse(retry) || until);
    if (Number.isFinite(reset)) until = Math.max(until, reset);
  }
  cooldownUntil = Math.max(cooldownUntil, Math.min(until, time + 3_600_000));
}

/** per_page=1 means the last page number is the exact total, without reading commit messages. */
export function parseCommitCount(body: unknown, link: string | null): { count: number; lastActive: string | null } {
  if (!Array.isArray(body) || body.length > 1) throw new Error('Invalid project activity');
  if (body.length === 0) {
    if (link) throw new Error('Invalid project pagination');
    return { count: 0, lastActive: null };
  }
  const row = body[0];
  const date = row?.commit?.committer?.date;
  if (row?.author?.login?.toLowerCase() !== OWNER || typeof date !== 'string' || !Number.isFinite(Date.parse(date))) throw new Error('Invalid project activity');
  if (!link) return { count: 1, lastActive: date.slice(0, 10) };
  const last = link.split(',').find((part) => /;\s*rel="last"/.test(part));
  const target = last && /^\s*<([^>]+)>/.exec(last)?.[1];
  if (!target) throw new Error('Incomplete project pagination');
  const url = new URL(target);
  const page = url.searchParams.get('page');
  const commitPath = /^\/repos\/stevenvo780\/[\w.-]+\/commits$/.test(url.pathname) || /^\/repositories\/\d+\/commits$/.test(url.pathname);
  if (url.origin !== 'https://api.github.com' || !commitPath || url.searchParams.get('per_page') !== '1' || !page || !/^\d+$/.test(page)) throw new Error('Invalid project pagination');
  const count = Number(page);
  if (!Number.isSafeInteger(count) || count < 1 || count > MAX_COUNT) throw new Error('Invalid project count');
  return { count, lastActive: date.slice(0, 10) };
}

export function projectWindow(period: ProjectPeriod, now: Date) {
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return {
    since: new Date(today - (LENGTHS[period] - 1) * DAY).toISOString(),
    until: new Date(today + DAY - 1).toISOString(),
  };
}

async function readCount(repo: string, period: ProjectPeriod, now: Date, fetcher: typeof fetch) {
  const url = new URL(`https://api.github.com/repos/${OWNER}/${repo}/commits`);
  const { since, until } = projectWindow(period, now);
  Object.entries({ author: OWNER, since, until, per_page: '1' }).forEach(([key, value]) => url.searchParams.set(key, value));
  const response = await fetcher(url, {
    headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'Mouseion-Published-Projects/1.0' },
    signal: AbortSignal.timeout(12_000), redirect: 'error',
  });
  if (!response.ok || !response.body || Number(response.headers.get('content-length')) > 65_536) {
    deferSource(response);
    await response.body?.cancel();
    throw new Error('Project source unavailable');
  }
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let body = '', bytes = 0;
  try {
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      bytes += chunk.value.byteLength;
      if (bytes > 65_536) throw new Error('Project source too large');
      body += decoder.decode(chunk.value, { stream: true });
    }
    body += decoder.decode();
  } finally { await reader.cancel(); }
  const result = parseCommitCount(JSON.parse(body), response.headers.get('link'));
  // Cached GitHub responses keep their original Date: do not stamp older measurements as fresh.
  const measured = Date.parse(response.headers.get('date') ?? '');
  return { ...result, measuredAt: Number.isFinite(measured) ? Math.min(measured, now.getTime()) : now.getTime() };
}

let pending: Promise<ProjectSnapshot> | null = null;

async function collect(now: Date, fetcher: typeof fetch): Promise<ProjectSnapshot> {
  let measuredAt = now.getTime();
  const projects: ProjectActivity[] = [];
  // Four projects at a time; the daily publisher performs 36 small requests.
  for (let offset = 0; offset < PROJECT_CATALOG.length; offset += 4) {
    const batch = await Promise.allSettled(PROJECT_CATALOG.slice(offset, offset + 4).map(async ({ repo, ...identity }) => {
      const results = await Promise.allSettled((['week', 'month', 'year'] as const).map((period) => readCount(repo, period, now, fetcher)));
      const failure = results.find((result) => result.status === 'rejected');
      if (failure?.status === 'rejected') throw failure.reason;
      const [week, month, year] = results.map((result) => {
        if (result.status === 'rejected') throw result.reason;
        return result.value;
      });
      measuredAt = Math.min(measuredAt, week.measuredAt, month.measuredAt, year.measuredAt);
      if (week.count > month.count || month.count > year.count) throw new Error('Inconsistent project activity');
      return { ...identity, counts: { week: week.count, month: month.count, year: year.count }, lastActive: year.lastActive };
    }));
    const failure = batch.find((result) => result.status === 'rejected');
    if (failure?.status === 'rejected') throw failure.reason;
    for (const result of batch) if (result.status === 'fulfilled') projects.push(result.value);
  }
  return { version: 1, source: 'github-public', metric: 'commits', coverage: 'published-projects', updatedAt: new Date(measuredAt).toISOString(), projects };
}

/** Collection is used by the daily publisher; the website reads only the sanitized asset. */
export async function collectPublicProjects(now = new Date(), fetcher: typeof fetch = fetch): Promise<ProjectSnapshot> {
  if (pending) return pending;
  if (Date.now() < cooldownUntil) throw new Error('Project source temporarily unavailable');
  pending = collect(now, fetcher);
  try { return await pending; }
  catch (error) {
    cooldownUntil = Math.max(cooldownUntil, Date.now() + 60_000);
    throw error;
  }
  finally { pending = null; }
}
