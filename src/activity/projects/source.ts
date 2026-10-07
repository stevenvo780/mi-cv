import type { ProjectSnapshot } from './model';
import { unstable_cache } from 'next/cache';
import { collectPublicProjects } from './collector';
import { validateProjectFeed } from './validation';
export { validateProjectFeed } from './validation';

export const PROJECT_FEED_URL = 'https://github.com/stevenvo780/mi-cv/releases/download/activity-feed/projects.json';
export const AUTHORIZED_PROJECT_FEED_URL = 'https://github.com/stevenvo780/mi-cv/releases/download/activity-feed/projects-selected.json';
export const AUTHORIZED_PROJECT_BACKUP_URL = 'https://github.com/stevenvo780/mi-cv/releases/download/activity-feed/projects-selected-backup.json';
class MissingProjectFeed extends Error {}

/** The website reads only a public, sanitized release asset. No API token is available here. */
async function readPublishedFeed(url: string, now: Date): Promise<ProjectSnapshot> {
  const response = await fetch(url, {
    headers: { Accept: 'application/json', 'User-Agent': 'Mouseion-Published-Projects/1.0' },
    next: { revalidate: 3600, tags: ['activity-projects'] },
    signal: AbortSignal.timeout(12_000), redirect: 'follow',
  });
  if (response.status === 404) throw new MissingProjectFeed('Project feed not published');
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
  // A private-inclusive snapshot must never be replaced with anonymous counts or invented zeros.
  let absent = true;
  for (const url of [AUTHORIZED_PROJECT_FEED_URL, AUTHORIZED_PROJECT_BACKUP_URL]) {
    try {
      const authorized = await readPublishedFeed(url, now);
      if (authorized.source !== 'github-authorized') throw new Error('Invalid authorized source');
      return authorized;
    } catch (error) {
      if (!(error instanceof MissingProjectFeed)) absent = false;
    }
  }
  // Initial absence permits public bootstrap. Real errors preserve the client's last good record.
  if (!absent) throw new Error('Project activity unavailable');
  let published: ProjectSnapshot | null = null;
  try { published = await readPublishedFeed(PROJECT_FEED_URL, now); } catch { /* A missing publisher must not disable public data. */ }
  if (published && now.getTime() - Date.parse(published.updatedAt) < 21_600_000) return published;
  try {
    const live = validateProjectFeed(await cachedPublicCollection(), now);
    return published && Date.parse(published.updatedAt) > Date.parse(live.updatedAt) ? published : live;
  } catch {
    // Preserve the actual measurement time. A stale record is explicitly marked in the UI.
    if (published) return published;
    throw new Error('Project activity unavailable');
  }
}
