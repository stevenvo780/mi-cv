import { afterEach, describe, expect, it, vi } from 'vitest';
import { PUBLIC_PROJECT_CATALOG as PROJECT_CATALOG } from '@/activity/projects/catalog';
import { collectPublicProjects as loadProjectActivity, parseCommitCount, projectWindow } from '@/activity/projects/collector';

const now = new Date('2026-10-06T20:00:00Z');
const row = { author: { login: 'stevenvo780' }, commit: { committer: { date: '2026-10-06T15:00:00Z' }, message: 'message must never leave source' }, sha: 'not-published' };
function pagination(count: number) {
  return `<https://api.github.com/repos/stevenvo780/cauce-v3/commits?per_page=1&page=2>; rel="next", <https://api.github.com/repos/stevenvo780/cauce-v3/commits?per_page=1&page=${count}>; rel="last"`;
}
afterEach(() => vi.unstubAllGlobals());

describe('published project activity', () => {
  it('counts complete pagination, empty repos, and single commits accurately', () => {
    expect(parseCommitCount([row], pagination(1253))).toEqual({ count: 1253, lastActive: '2026-10-06' });
    expect(parseCommitCount([row], pagination(561).replaceAll('/repos/stevenvo780/cauce-v3', '/repositories/1309412669')).count).toBe(561);
    // GitHub can emit next=2 / last=1 for a real one-commit history (reel-forge).
    expect(parseCommitCount([row], pagination(1).replaceAll('/repos/stevenvo780/cauce-v3', '/repositories/1277839800')).count).toBe(1);
    expect(parseCommitCount([row], null).count).toBe(1);
    expect(parseCommitCount([], null)).toEqual({ count: 0, lastActive: null });
  });
  it('refuses truncated totals and misleading pagination instead of making up counts', () => {
    expect(() => parseCommitCount([row], '<https://api.github.com/commits?page=2>; rel="next"')).toThrow();
    expect(() => parseCommitCount([row], pagination(0))).toThrow();
    expect(() => parseCommitCount([row], pagination(100).replaceAll('per_page=1', 'per_page=100'))).toThrow();
    expect(() => parseCommitCount([row], pagination(100).replaceAll('api.github.com', 'example.invalid'))).toThrow();
    expect(() => parseCommitCount([{ ...row, author: { login: 'someone-else' } }], null)).toThrow();
  });
  it('uses fixed UTC day windows that remain cacheable across visits and roll over daily', () => {
    expect(projectWindow('week', now)).toEqual({ since: '2026-09-30T00:00:00.000Z', until: '2026-10-06T23:59:59.999Z' });
    expect(projectWindow('month', now).since).toBe('2026-09-07T00:00:00.000Z');
    expect(projectWindow('year', now).since).toBe('2025-10-07T00:00:00.000Z');
    expect(projectWindow('year', now)).toEqual(projectWindow('year', new Date('2026-10-06T01:00:00Z')));
  });
  it('deduplicates concurrent collection and publishes only approved identities and aggregate counts', async () => {
    const fetch = vi.fn(async (input: string, init: RequestInit & { next?: unknown }) => {
      const url = new URL(input);
      expect(url.origin).toBe('https://api.github.com');
      expect(url.searchParams.get('author')).toBe('stevenvo780');
      expect(new Headers(init.headers).has('Authorization')).toBe(false);
      return Response.json([row], { headers: { link: pagination(100), date: 'Tue, 06 Oct 2026 18:00:00 GMT' } });
    });
    vi.stubGlobal('fetch', fetch);
    const [a, b] = await Promise.all([loadProjectActivity(now), loadProjectActivity(now)]);
    expect(a).toBe(b);
    expect(fetch).toHaveBeenCalledTimes(PROJECT_CATALOG.length * 3);
    expect(a.updatedAt).toBe('2026-10-06T18:00:00.000Z');
    expect(a.projects).toHaveLength(12);
    expect(JSON.stringify(a)).not.toMatch(/sha|message must|not-published|committer|author|email/);
    expect(Object.keys(a.projects[0]).sort()).toEqual(['counts', 'description', 'id', 'kind', 'lastActive', 'name', 'url']);
    expect(a.projects[0].counts).toEqual({ week: 100, month: 100, year: 100 });
  });
  it('treats rate limits and private/missing repos as unavailable rather than zero activity', async () => {
    const fetch = vi.fn(async () => new Response('private upstream details', { status: 403, headers: { 'Retry-After': '1800' } }));
    vi.stubGlobal('fetch', fetch);
    await expect(loadProjectActivity(now)).rejects.toThrow('Project source unavailable');
    expect(fetch).toHaveBeenCalledTimes(12);
    await expect(loadProjectActivity(now)).rejects.toThrow('Project source temporarily unavailable');
    expect(fetch).toHaveBeenCalledTimes(12);
  });
});
