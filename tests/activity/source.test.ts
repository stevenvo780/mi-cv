import { afterEach, describe, expect, it, vi } from 'vitest';
import { loadActivity } from '@/activity/source';
import { dayWindow } from '@/activity/validation';

const now = new Date('2026-10-06T20:00:00Z');
function calendar(year: number, count: number) {
  return dayWindow(new Date(`${year}-12-31T12:00:00Z`)).map((date, i) => `<td data-date="${date}" id="day-${i}"></td><tool-tip for="day-${i}">${count} contributions on a date.</tool-tip>`).join('');
}
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

describe('activity source boundary', () => {
  it('combines years with repeated DOM ids by date, keeping exact rolling coverage', async () => {
    vi.stubEnv('ACTIVITY_FEED_URL', '');
    const fetch = vi.fn(async (url: string) => new Response(calendar(url.includes('2025-01-01') ? 2025 : 2026, url.includes('2025-01-01') ? 2 : 3)));
    vi.stubGlobal('fetch', fetch);
    const result = await loadActivity(now);
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(result.days).toHaveLength(365);
    expect(result.days[0]).toEqual({ date: '2025-10-07', count: 2 });
    expect(result.days.at(-1)).toEqual({ date: '2026-10-06', count: 3 });
    expect(result.days.find((day) => day.date === '2025-12-31')?.count).toBe(2);
    expect(result.days.find((day) => day.date === '2026-01-01')?.count).toBe(3);
  });
  it('rejects an oversized source stream without silently switching to GitHub', async () => {
    vi.stubEnv('ACTIVITY_FEED_URL', 'https://example.invalid/activity.json');
    const fetch = vi.fn(async () => new Response('x'.repeat(262_145)));
    vi.stubGlobal('fetch', fetch);
    await expect(loadActivity(now)).rejects.toThrow('Activity source too large');
    expect(fetch).toHaveBeenCalledTimes(1);
  });
  it('rejects partial feeds without silently changing the metric', async () => {
    vi.stubEnv('ACTIVITY_FEED_URL', 'https://example.invalid/activity.json');
    const fetch = vi.fn(async () => Response.json({ version: 1, source: 'journal', metric: 'commits', updatedAt: now.toISOString(), days: [{ date: '2026-10-06', count: 1 }], highlights: [] }));
    vi.stubGlobal('fetch', fetch);
    await expect(loadActivity(now)).rejects.toThrow('Invalid activity days');
    expect(fetch).toHaveBeenCalledTimes(1);
  });
  it.each(['http://example.invalid/data', 'https://user:password@example.invalid/data'])('rejects unsafe feed URL before fetching', async (url) => {
    vi.stubEnv('ACTIVITY_FEED_URL', url);
    const fetch = vi.fn();
    vi.stubGlobal('fetch', fetch);
    await expect(loadActivity(now)).rejects.toThrow('Invalid activity feed URL');
    expect(fetch).not.toHaveBeenCalled();
  });
});
