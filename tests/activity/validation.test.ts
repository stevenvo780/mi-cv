import { describe, expect, it } from 'vitest';
import { dayWindow, parseGithubCalendar, validateSnapshot, validDate } from '@/activity/validation';

const now = new Date('2026-10-06T20:00:00Z');
const snapshot = () => ({ version: 1, source: 'journal', metric: 'commits', updatedAt: now.toISOString(),
  days: dayWindow(now).map((date) => ({ date, count: 0 })), highlights: [] });

describe('public activity contract', () => {
  it('keeps only the public allowlist, including nested objects', () => {
    const raw = { ...snapshot(), repository: 'PRIVATE-REPOSITORY', token: 'NEVER-PUBLIC',
      days: snapshot().days.map((d) => ({ ...d, count: 13, sha: 'PRIVATE-SHA', email: 'PRIVATE-EMAIL' })),
      highlights: [{ date: '2026-10-06', area: 'research', title: { es: 'Resultado revisado', en: 'Reviewed result', rawCommit: 'PRIVATE-MESSAGE' }, path: 'PRIVATE-PATH' }] };
    const clean = validateSnapshot(raw, now);
    expect(JSON.stringify(clean)).not.toContain('PRIVATE');
    expect(JSON.stringify(clean)).not.toContain('NEVER');
    expect(clean.days.at(-1)).toEqual({ date: '2026-10-06', count: 13 });
  });
  it.each([-1, 0.5, NaN, Infinity, 1_000_001])('rejects invalid count %s', (count) => {
    expect(() => validateSnapshot({ ...snapshot(), days: snapshot().days.map((day) => ({ ...day, count })) }, now)).toThrow();
  });
  it('does not make an old feed fresh when read again', () => {
    const old = '2026-09-02T12:00:00Z';
    const days = dayWindow(new Date(old)).map((date) => ({ date, count: 0 }));
    expect(Date.parse(validateSnapshot({ ...snapshot(), updatedAt: old, days }, now).updatedAt)).toBe(Date.parse(old));
  });
  it('rejects partial years and calendars newer than their generation timestamp', () => {
    expect(() => validateSnapshot({ ...snapshot(), days: [{ date: '2026-10-06', count: 13 }] }, now)).toThrow();
    expect(() => validateSnapshot({ ...snapshot(), updatedAt: '2026-09-02T12:00:00Z' }, now)).toThrow();
  });
  it('rejects future timestamps, future dates, duplicate dates and calendar holes', () => {
    expect(() => validateSnapshot({ ...snapshot(), updatedAt: '2099-01-01T00:00:00Z' }, now)).toThrow();
    for (const dates of [['2026-10-07'], ['2026-10-06', '2026-10-06'], ['2026-10-04', '2026-10-06']]) {
      expect(() => validateSnapshot({ ...snapshot(), days: dates.map((date) => ({ date, count: 1 })) }, now)).toThrow();
    }
  });
  it('uses UTC and validates actual Gregorian dates', () => {
    expect(dayWindow(new Date('2026-10-06T23:30:00-05:00'), 2)).toEqual(['2026-10-06', '2026-10-07']);
    expect(validDate('2026-02-29')).toBe(false);
    expect(validDate('2024-02-29')).toBe(true);
  });
});

describe('public GitHub calendar parser', () => {
  const html = dayWindow(now).map((date, i) => `<td id="day-${i}" data-date="${date}" data-level="4"></td><tool-tip for="day-${i}">${i === 0 ? 'No contributions' : i === 1 ? '1 contribution' : '1,234 contributions'} on a date.</tool-tip>`).join('');
  it('reads exact tooltip counts instead of guessing counts from color levels', () => {
    const result = parseGithubCalendar(html, now);
    expect(result.days).toHaveLength(365);
    expect(result.days.slice(0, 3).map((d) => d.count)).toEqual([0, 1, 1234]);
    expect(result.highlights).toEqual([]);
    expect(result.metric).toBe('contributions');
  });
  it('fails visibly if GitHub markup is missing or changed, rather than inventing zero activity', () => {
    expect(() => parseGithubCalendar(html.replace('for="day-0"', 'for="changed"'), now)).toThrow();
    expect(() => parseGithubCalendar('<html>unavailable</html>', now)).toThrow();
  });
  it('supports leap-year source calendars', () => {
    const end = new Date('2024-12-31T12:00:00Z');
    const leap = dayWindow(end, 366).map((date, i) => `<td data-date="${date}" id="${i}"></td><tool-tip for="${i}">No contributions on a date.</tool-tip>`).join('');
    const result = parseGithubCalendar(leap, end, 366);
    expect(result.days[0].date).toBe('2024-01-01');
    expect(result.days).toHaveLength(366);
  });
});
