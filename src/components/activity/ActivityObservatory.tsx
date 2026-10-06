'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { ActivityResponse, ActivitySnapshot } from '@/activity/model';
import { ACTIVITY } from '@/content/activity';
import type { Locale } from '@/lib/site';
import ActivityOrbit from './ActivityOrbit';

type Period = 'week' | 'month' | 'year';
type LoadState = 'loading' | 'ready' | 'unavailable' | 'error';
const DAY = 86_400_000;

export default function ActivityObservatory({ locale }: { locale: Locale }) {
  const t = ACTIVITY[locale];
  const [snapshot, setSnapshot] = useState<ActivitySnapshot | null>(null);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [period, setPeriod] = useState<Period>('year');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [refreshFailed, setRefreshFailed] = useState(false);
  const [stale, setStale] = useState(false);
  const lastAttempt = useRef(0);
  const pending = useRef(false);
  const controller = useRef<AbortController | null>(null);

  const load = useCallback(async () => {
    if (pending.current) return;
    pending.current = true;
    lastAttempt.current = Date.now();
    const request = new AbortController();
    controller.current = request;
    try {
      const response = await fetch('/api/activity', { signal: request.signal, cache: 'no-store' });
      if (!response.ok) throw new Error('Activity unavailable');
      const body: ActivityResponse = await response.json();
      if (request.signal.aborted) return;
      if (body.status === 'unavailable' && body.snapshot === null) {
        setSnapshot(null); setSelectedDate(null); setLoadState('unavailable'); setRefreshFailed(false); return;
      }
      if (body.status !== 'ready' || !body.snapshot || !Array.isArray(body.snapshot.days) || !body.snapshot.days.length) throw new Error('Invalid activity');
      const next = body.snapshot;
      setSnapshot(next);
      setSelectedDate((current) => current && next.days.some((day) => day.date === current) ? current : next.days[next.days.length - 1].date);
      setStale(Date.now() - Date.parse(next.updatedAt) > 2 * DAY);
      setLoadState('ready'); setRefreshFailed(false);
    } catch {
      if (!request.signal.aborted) {
        setRefreshFailed(true);
        setLoadState((current) => current === 'ready' ? current : 'error');
      }
    } finally { if (controller.current === request) pending.current = false; }
  }, []);

  useEffect(() => {
    let mounted = true;
    // Defer the initial request; the discarded StrictMode setup never starts a fetch.
    queueMicrotask(() => { if (mounted) void load(); });
    const refresh = () => {
      if (document.visibilityState === 'visible' && Date.now() - lastAttempt.current >= 3_600_000) void load();
    };
    document.addEventListener('visibilitychange', refresh);
    window.addEventListener('focus', refresh);
    return () => {
      mounted = false;
      controller.current?.abort();
      pending.current = false;
      document.removeEventListener('visibilitychange', refresh);
      window.removeEventListener('focus', refresh);
    };
  }, [load]);

  const days = snapshot?.days ?? [];
  const lastDate = days.at(-1)?.date;
  const windowLength = period === 'week' ? 7 : period === 'month' ? 30 : days.length;
  const windowStart = lastDate ? new Date(Date.parse(`${lastDate}T00:00:00Z`) - (windowLength - 1) * DAY).toISOString().slice(0, 10) : '';
  const visibleDays = days.filter((day) => day.date >= windowStart);
  const total = snapshot ? visibleDays.reduce((sum, day) => sum + day.count, 0) : null;
  const active = snapshot ? visibleDays.filter((day) => day.count > 0).length : null;
  const busiest = visibleDays.reduce<(typeof days)[number] | null>((peak, day) => !peak || day.count > peak.count ? day : peak, null);
  const selectedIndex = days.findIndex((day) => day.date === selectedDate);
  const selected = days[selectedIndex];
  const latestContribution = [...days].reverse().find((day) => day.count > 0);
  const unit = snapshot?.metric === 'commits' ? t.commits : t.contributions;
  const highlights = snapshot?.highlights.filter((entry) => entry.date >= windowStart && (!lastDate || entry.date <= lastDate)).sort((a, b) => b.date.localeCompare(a.date)) ?? [];
  const selectedHighlights = snapshot?.highlights.filter((entry) => entry.date === selectedDate) ?? [];
  const number = (value: number | null) => value === null ? '—' : new Intl.NumberFormat(locale).format(value);
  const date = (value: string, full = false) => new Intl.DateTimeFormat(locale, { day: 'numeric', month: full ? 'long' : 'short', ...(full ? { year: 'numeric' as const } : {}), timeZone: 'UTC' }).format(new Date(`${value}T00:00:00Z`));
  const syncDate = snapshot ? new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' }).format(new Date(snapshot.updatedAt)) : null;

  function choosePeriod(next: Period) {
    setPeriod(next);
    if (lastDate) setSelectedDate(lastDate);
  }

  return (
    <>
      <section className="activity-observatory" aria-labelledby="activity-chart-title" aria-busy={loadState === 'loading'}>
        <div className="activity-section-heading">
          <div><p className="activity-eyebrow">{t.observatory}</p><h2 id="activity-chart-title">{t.chartTitle}</h2></div>
          <p>{t.chartIntro}</p>
        </div>
        <div className="activity-period-row">
          <div className="activity-periods" role="group" aria-label={t.periodLabel}>
            {(['week', 'month', 'year'] as const).map((item) => <button type="button" key={item} aria-pressed={period === item} onClick={() => choosePeriod(item)}>{t.periods[item]}<span aria-hidden="true">↗</span></button>)}
          </div>
          <span className="activity-window-range">{visibleDays.length ? `${date(visibleDays[0].date)} — ${date(visibleDays[visibleDays.length - 1].date, true)}` : '—'}</span>
        </div>
        <div className="activity-status" role="status">
          {loadState === 'loading' && <p className="activity-loading">{t.loading}</p>}
          {loadState === 'unavailable' && <p>{t.unavailable}</p>}
          {loadState === 'error' && <p>{t.fetchFailed} <button type="button" onClick={() => { setLoadState('loading'); void load(); }}>{t.retry} <span aria-hidden="true">↗</span></button></p>}
          {loadState === 'ready' && stale && <p>{t.stale}</p>}
          {loadState === 'ready' && refreshFailed && <p>{t.refreshFailed}</p>}
        </div>
        <div className="activity-sky">
          <ActivityOrbit days={days} locale={locale} selectedDate={selectedDate} windowStart={windowStart} onSelect={setSelectedDate} total={total} periodLabel={t.periodsShort[period]} unit={unit} />
          <aside className="activity-day-detail" aria-label={t.selected}>
            <p className="activity-eyebrow">{t.selected}</p>
            <div className="activity-day-selector">
              <label className="sr-only" htmlFor="activity-day-select">{t.selectDay}</label>
              <select id="activity-day-select" value={selectedDate ?? ''} disabled={!days.length} onChange={(event) => setSelectedDate(event.target.value)}>
                {!days.length && <option value="">—</option>}
                {[...days].reverse().map((day) => <option key={day.date} value={day.date}>{date(day.date, true)}</option>)}
              </select>
              <div className="activity-day-arrows">
                <button type="button" aria-label={t.previousDay} disabled={selectedIndex <= 0} onClick={() => setSelectedDate(days[selectedIndex - 1].date)}>←</button>
                <button type="button" aria-label={t.nextDay} disabled={selectedIndex < 0 || selectedIndex === days.length - 1} onClick={() => setSelectedDate(days[selectedIndex + 1].date)}>→</button>
              </div>
            </div>
            <p className="activity-day-value" aria-live="polite" aria-atomic="true">{number(selected?.count ?? null)}<span>{unit}</span></p>
            <div className="activity-day-story">
              {selectedHighlights.length ? selectedHighlights.map((entry, index) => <div key={`${entry.date}-${index}`}><span className="activity-area">{t.areas[entry.area]}</span><p>{entry.title[locale]}</p></div>) : <p>{selected?.count === 0 ? t.zeroDay : selected ? t.noNarrative : t.selectPrompt}</p>}
            </div>
            <div className="activity-legend"><span>{t.legendLow}</span><i aria-hidden="true" /><span>{t.legendHigh}</span></div>
          </aside>
        </div>
        <dl className="activity-metrics">
          <div><dt>{unit} <span>{t.periods[period].toLowerCase()}</span></dt><dd>{number(total)}</dd></div>
          <div><dt>{t.activeDays}</dt><dd>{number(active)}<span> / {snapshot ? visibleDays.length : '—'}</span></dd></div>
          <div><dt>{t.busiestDay}</dt><dd>{busiest && busiest.count > 0 ? date(busiest.date) : '—'}<span>{busiest && busiest.count > 0 ? `${number(busiest.count)} ${unit}` : ''}</span></dd></div>
        </dl>
        <dl className="activity-provenance">
          <div><dt>{t.source}</dt><dd>{snapshot ? snapshot.source === 'github' ? t.github : t.journal : '—'}</dd></div>
          <div><dt>{t.sync}</dt><dd>{syncDate ?? '—'}{snapshot && ' UTC'}</dd></div>
          <div><dt>{t.latest}</dt><dd>{latestContribution ? date(latestContribution.date, true) : snapshot ? t.noLatest : '—'}</dd></div>
        </dl>
      </section>
      <section className="activity-diary" aria-labelledby="activity-diary-title">
        <div><p className="activity-eyebrow">{t.diaryEyebrow}</p><h2 id="activity-diary-title">{t.diaryTitle}</h2><p className="activity-diary-intro">{t.diaryIntro}</p></div>
        <div className="activity-diary-entries">
          {highlights.length ? highlights.map((entry, index) => <article key={`${entry.date}-${index}`}><time dateTime={entry.date}>{date(entry.date, true)}</time><span className="activity-area">{t.areas[entry.area]}</span><h3>{entry.title[locale]}</h3></article>) : <div className="activity-diary-empty"><span aria-hidden="true">✳</span><p>{t.noDiary}</p></div>}
        </div>
      </section>
    </>
  );
}
