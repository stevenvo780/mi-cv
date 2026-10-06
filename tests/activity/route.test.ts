import { afterEach, describe, expect, it, vi } from 'vitest';
vi.mock('@/activity/source', () => ({ loadActivity: vi.fn() }));
import { loadActivity } from '@/activity/source';
import { GET } from '@/app/api/activity/route';
import type { ActivitySnapshot } from '@/activity/model';

afterEach(() => vi.clearAllMocks());
describe('activity API', () => {
  it('returns a cacheable public snapshot', async () => {
    const snapshot: ActivitySnapshot = { version: 1, source: 'github', metric: 'contributions', updatedAt: '2026-10-06T00:00:00Z', days: [], highlights: [] };
    vi.mocked(loadActivity).mockResolvedValue(snapshot);
    const response = await GET();
    expect(response.status).toBe(200);
    expect(response.headers.get('Cache-Control')).toContain('s-maxage=900');
    expect(await response.json()).toEqual({ status: 'ready', snapshot });
  });
  it('does not leak upstream errors or cache failures', async () => {
    vi.mocked(loadActivity).mockRejectedValue(new Error('PRIVATE feed URL and response'));
    const response = await GET();
    expect(response.status).toBe(503);
    expect(response.headers.get('Cache-Control')).toBe('no-store');
    expect(await response.json()).toEqual({ status: 'unavailable', snapshot: null });
  });
});
