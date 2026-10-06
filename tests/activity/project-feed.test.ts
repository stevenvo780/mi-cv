import { afterEach, describe, expect, it, vi } from 'vitest';
vi.mock('next/cache', () => ({ unstable_cache: (collect: () => Promise<unknown>) => collect }));
vi.mock('@/activity/projects/collector', () => ({ collectPublicProjects: vi.fn() }));
import { collectPublicProjects } from '@/activity/projects/collector';
import { PROJECT_CATALOG } from '@/activity/projects/catalog';
import { loadProjectActivity, PROJECT_FEED_URL, validateProjectFeed } from '@/activity/projects/source';

const now = new Date('2026-10-06T23:35:00Z');
const record = () => ({ version: 1, source: 'github-public', metric: 'commits', coverage: 'published-projects', updatedAt: '2026-10-06T23:30:00Z', projects: PROJECT_CATALOG.map((project) => ({ id: project.id, counts: { week: 1, month: 4, year: 12 }, lastActive: '2026-10-06' })) });
afterEach(() => { vi.unstubAllGlobals(); vi.clearAllMocks(); });

describe('public project feed boundary', () => {
  it('reconstructs approved identities, drops raw fields, and preserves the actual measurement time', () => {
    const input = record();
    Object.assign(input.projects[0], { name: { es: 'Unapproved private name' }, url: 'https://example.invalid', message: 'not published', token: 'not published' });
    const result = validateProjectFeed(input, now);
    expect(result.updatedAt).toBe('2026-10-06T23:30:00.000Z');
    expect(result.projects[0].name.es).toBe('Cauce V3');
    expect(JSON.stringify(result)).not.toMatch(/Unapproved|example.invalid|not published|token/);
  });
  it('rejects unknown/duplicate identities, partial coverage, and inconsistent counts', () => {
    const unknown = record(); unknown.projects[0].id = 'private-project';
    expect(() => validateProjectFeed(unknown, now)).toThrow();
    const duplicate = record(); duplicate.projects[1].id = duplicate.projects[0].id;
    expect(() => validateProjectFeed(duplicate, now)).toThrow();
    const partial = record(); partial.projects.pop();
    expect(() => validateProjectFeed(partial, now)).toThrow();
    const incorrect = record(); incorrect.projects[0].counts.week = 100;
    expect(() => validateProjectFeed(incorrect, now)).toThrow();
    const datedZero = record(); datedZero.projects[0].counts = { week: 0, month: 0, year: 0 };
    expect(() => validateProjectFeed(datedZero, now)).toThrow();
    const outsideWindow = record(); outsideWindow.projects[0].lastActive = '2025-10-06';
    expect(() => validateProjectFeed(outsideWindow, now)).toThrow();
  });
  it('keeps stale measurements dated rather than pretending they were updated on access', () => {
    const input = record(); input.updatedAt = '2026-10-02T23:30:00Z'; input.projects.forEach((row) => { row.lastActive = '2026-10-02'; });
    expect(validateProjectFeed(input, now).updatedAt).toBe('2026-10-02T23:30:00.000Z');
  });
  it('fetches only the public asset, without any credential or API request', async () => {
    const fetch = vi.fn(async () => Response.json(record())); vi.stubGlobal('fetch', fetch);
    expect((await loadProjectActivity(now)).projects).toHaveLength(12);
    expect(fetch).toHaveBeenCalledTimes(1);
    const [url, init] = fetch.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe(PROJECT_FEED_URL);
    expect(new Headers(init.headers).has('Authorization')).toBe(false);
  });
  it('refuses failed or oversized feeds when no verified live record exists', async () => {
    vi.mocked(collectPublicProjects).mockRejectedValue(new Error('Source unavailable'));
    vi.stubGlobal('fetch', vi.fn(async () => new Response('not available', { status: 404 })));
    await expect(loadProjectActivity(now)).rejects.toThrow('Public project activity unavailable');
    vi.stubGlobal('fetch', vi.fn(async () => new Response('x'.repeat(131_073))));
    await expect(loadProjectActivity(now)).rejects.toThrow('Public project activity unavailable');
  });
  it('updates the same public metric even if the daily publisher is unavailable', async () => {
    const live = validateProjectFeed(record(), now);
    vi.mocked(collectPublicProjects).mockResolvedValue(live);
    vi.stubGlobal('fetch', vi.fn(async () => new Response('not available', { status: 404 })));
    expect(await loadProjectActivity(now)).toEqual(live);
  });
  it('keeps the dated published record when a live refresh hits a limit', async () => {
    const old = record(); old.updatedAt = '2026-10-02T23:30:00Z'; old.projects.forEach((row) => { row.lastActive = '2026-10-02'; });
    vi.stubGlobal('fetch', vi.fn(async () => Response.json(old)));
    vi.mocked(collectPublicProjects).mockRejectedValue(new Error('Source unavailable'));
    expect((await loadProjectActivity(now)).updatedAt).toBe('2026-10-02T23:30:00.000Z');
  });
});
