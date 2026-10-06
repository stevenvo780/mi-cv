import { PROJECT_CATALOG } from './catalog';
import type { ProjectActivity, ProjectSnapshot } from './model';
import { unstable_cache } from 'next/cache';
import { collectPublicProjects } from './collector';

export const PROJECT_FEED_URL = 'https://github.com/stevenvo780/mi-cv/releases/download/activity-feed/projects.json';

/** Reconstruct all published identities; a remote feed cannot introduce a repository or a name. */
export function validateProjectFeed(input: unknown, now = new Date()): ProjectSnapshot {
  if (!input || typeof input !== 'object') throw new Error('Invalid project feed');
  const body = input as Record<string, unknown>;
  const measuredAt = typeof body.updatedAt === 'string' ? Date.parse(body.updatedAt) : NaN;
  if (body.version !== 1 || body.source !== 'github-public' || body.metric !== 'commits' || body.coverage !== 'published-projects' ||
    !Number.isFinite(measuredAt) || measuredAt > now.getTime() + 300_000 || !Array.isArray(body.projects) || body.projects.length !== PROJECT_CATALOG.length) throw new Error('Invalid project feed');
  const seen = new Set<string>();
  const measured = new Date(measuredAt);
  const firstDay = new Date(Date.UTC(measured.getUTCFullYear(), measured.getUTCMonth(), measured.getUTCDate()) - 364 * 86_400_000).toISOString().slice(0, 10);
  const projects: ProjectActivity[] = body.projects.map((raw: unknown) => {
    if (!raw || typeof raw !== 'object') throw new Error('Invalid project feed');
    const row = raw as Record<string, unknown>;
    const approved = PROJECT_CATALOG.find((item) => item.id === row.id);
    if (!approved || seen.has(approved.id) || !row.counts || typeof row.counts !== 'object') throw new Error('Invalid project identity');
    seen.add(approved.id);
    const counts = row.counts as Record<string, unknown>;
    if (['week', 'month', 'year'].some((key) => !Number.isSafeInteger(counts[key]) || Number(counts[key]) < 0 || Number(counts[key]) > 1_000_000) || Number(counts.week) > Number(counts.month) || Number(counts.month) > Number(counts.year)) throw new Error('Invalid project counts');
    const active = row.lastActive;
    if ((Number(counts.year) === 0) !== (active === null)) throw new Error('Invalid project date');
    if (active !== null && (typeof active !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(active) || new Date(`${active}T00:00:00Z`).toISOString().slice(0, 10) !== active || active < firstDay || active > measured.toISOString().slice(0, 10))) throw new Error('Invalid project date');
    return { id: approved.id, name: approved.name, description: approved.description, kind: approved.kind, url: approved.url, counts: { week: Number(counts.week), month: Number(counts.month), year: Number(counts.year) }, lastActive: active as string | null };
  });
  return { version: 1, source: 'github-public', metric: 'commits', coverage: 'published-projects', updatedAt: new Date(measuredAt).toISOString(), projects };
}

/** The website reads only a public, sanitized release asset. No API token is available here. */
async function readPublishedFeed(now: Date): Promise<ProjectSnapshot> {
  const response = await fetch(PROJECT_FEED_URL, {
    headers: { Accept: 'application/json', 'User-Agent': 'Mouseion-Published-Projects/1.0' },
    next: { revalidate: 3600, tags: ['activity-projects'] },
    signal: AbortSignal.timeout(12_000), redirect: 'follow',
  });
  if (!response.ok || !response.body || Number(response.headers.get('content-length')) > 131_072) throw new Error('Project feed unavailable');
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let body = '', bytes = 0;
  try {
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      bytes += chunk.value.byteLength;
      if (bytes > 131_072) throw new Error('Project feed too large');
      body += decoder.decode(chunk.value, { stream: true });
    }
    body += decoder.decode();
  } finally { await reader.cancel(); }
  return validateProjectFeed(JSON.parse(body), now);
}

// Public data can still refresh if the owner temporarily cannot run GitHub Actions.
// One stable aggregate cache avoids per-visitor API batches and the UTC midnight double batch.
const cachedPublicCollection = unstable_cache(() => collectPublicProjects(), ['mouseion-public-project-fallback-v1'], {
  revalidate: 21_600, tags: ['activity-projects'],
});

export async function loadProjectActivity(now = new Date()): Promise<ProjectSnapshot> {
  let published: ProjectSnapshot | null = null;
  try { published = await readPublishedFeed(now); } catch { /* A missing publisher must not disable public data. */ }
  if (published && now.getTime() - Date.parse(published.updatedAt) < 21_600_000) return published;
  try {
    const live = validateProjectFeed(await cachedPublicCollection(), now);
    return published && Date.parse(published.updatedAt) > Date.parse(live.updatedAt) ? published : live;
  } catch {
    // Preserve the actual measurement time. A stale record is explicitly marked in the UI.
    if (published) return published;
    throw new Error('Public project activity unavailable');
  }
}
