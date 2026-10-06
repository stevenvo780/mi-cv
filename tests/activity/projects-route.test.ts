import { afterEach, describe, expect, it, vi } from 'vitest';
vi.mock('@/activity/projects/source', () => ({ loadProjectActivity: vi.fn() }));
import { loadProjectActivity } from '@/activity/projects/source';
import { GET } from '@/app/api/activity/projects/route';
afterEach(() => vi.clearAllMocks());

describe('project activity API boundary', () => {
  it('serves a cacheable aggregate snapshot', async () => {
    const snapshot = { version: 1 as const, source: 'github-public' as const, metric: 'commits' as const, coverage: 'published-projects' as const, updatedAt: '2026-10-06T18:00:00Z', projects: [] };
    vi.mocked(loadProjectActivity).mockResolvedValue(snapshot);
    const response = await GET();
    expect(response.status).toBe(200);
    expect(response.headers.get('Cache-Control')).toContain('s-maxage=900');
    expect(await response.json()).toEqual({ status: 'ready', snapshot });
  });
  it('keeps upstream diagnostics out of the public response and never caches failures', async () => {
    vi.mocked(loadProjectActivity).mockRejectedValue(new Error('internal private upstream diagnostic'));
    const response = await GET();
    expect(response.status).toBe(503);
    expect(response.headers.get('Cache-Control')).toBe('no-store');
    expect(await response.json()).toEqual({ status: 'unavailable', snapshot: null });
  });
});
