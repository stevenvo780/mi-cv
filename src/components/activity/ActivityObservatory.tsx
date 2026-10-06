'use client';

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import type { ActivityDay, ActivityResponse, ActivitySnapshot } from '@/activity/model';
import { ACTIVITY } from '@/content/activity';
import type { Locale } from '@/lib/site';
import ActivityOrbit from './ActivityOrbit';
import ActivityScene from './ActivityScene';

type Period = 'week' | 'month' | 'year';
type LoadState = 'loading' | 'ready' | 'unavailable' | 'error';
const DAY = 86_400_000;
const EMPTY_DAYS: ActivityDay[] = [];
const MOTION_QUERY = '(prefers-reduced-motion: reduce)';
const getReducedMotion = () => window.matchMedia(MOTION_QUERY).matches;
function subscribeMotion(notify: () => void) {
  const query = window.matchMedia(MOTION_QUERY);
  query.addEventListener('change', notify);
  return () => query.removeEventListener('change', notify);
}
const getVisibility = () => document.visibilityState === 'visible';
function subscribeVisibility(notify: () => void) {
  document.addEventListener('visibilitychange', notify);
  return () => document.removeEventListener('visibilitychange', notify);
}

/** Ease towards measured values without announcing every animation frame. */
function Count({ value, locale, reducedMotion }: { value: number | null; locale: Locale; reducedMotion: boolean }) {
  const [display, setDisplay] = useState(value ?? 0);
  const current = useRef(value ?? 0);
  useEffect(() => {
    if (value === null || reducedMotion) return;
    let frame = 0;
    const from = current.current;
    const start = performance.now();
    const animate = (now: number) => {
      const progress = Math.min((now - start) / 900, 1);
      current.current = Math.round(from + (value - from) * (1 - Math.pow(1 - progress, 3)));
      setDisplay(current.current);
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [value, reducedMotion]);
  const formatter = new Intl.NumberFormat(locale);
  return <span role="img" aria-label={value === null ? '—' : formatter.format(value)}>{value === null ? '—' : formatter.format(reducedMotion ? value : display)}</span>;
}

export default function ActivityObservatory({ locale }: { locale: Locale }) {
  const t = ACTIVITY[locale];
  const [snapshot, setSnapshot] = useState<ActivitySnapshot | null>(null);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [period, setPeriod] = useState<Period>('year');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [refreshFailed, setRefreshFailed] = useState(false);
  const [stale, setStale] = useState(false);
  const [paused, setPaused] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [reveal, setReveal] = useState(1);
  const [sceneReady, setSceneReady] = useState(false);
  const [stageVisible, setStageVisible] = useState(true);
  const reducedMotion = useSyncExternalStore(subscribeMotion, getReducedMotion, () => true);
  const pageVisible = useSyncExternalStore(subscribeVisibility, getVisibility, () => true);
  const revealRef = useRef(1);
  const lastAttempt = useRef(0);
  const pending = useRef(false);
  const controller = useRef<AbortController | null>(null);
  const stage = useRef<HTMLElement>(null);

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
    queueMicrotask(() => {
      if (!mounted) return;
      void load();
      let stopped = document.documentElement.dataset.motion === 'paused';
      try {
        const saved = localStorage.getItem('mouseion:motion');
        stopped ||= saved === 'paused';
      } catch { /* Storage is optional; the visible controls still work. */ }
      setPaused(stopped);
      document.documentElement.dataset.motion = stopped ? 'paused' : 'running';
    });
    const refresh = () => {
      if (document.visibilityState === 'visible' && Date.now() - lastAttempt.current >= 3_600_000) void load();
    };
    document.addEventListener('visibilitychange', refresh);
    window.addEventListener('focus', refresh);
    return () => {
      mounted = false; controller.current?.abort(); pending.current = false;
      document.removeEventListener('visibilitychange', refresh);
      window.removeEventListener('focus', refresh);
    };
  }, [load]);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setStageVisible(entry.isIntersecting);
    }, { threshold: .1 });
    if (stage.current) observer.observe(stage.current);
    return () => observer.disconnect();
  }, []);

  const days = snapshot?.days ?? EMPTY_DAYS;
  const lastDate = days.at(-1)?.date;
  const windowLength = period === 'week' ? 7 : period === 'month' ? 30 : days.length || 365;
  const visibleDays = useMemo(() => days.slice(-windowLength), [days, windowLength]);
  const windowStart = visibleDays[0]?.date ?? '';
  const total = snapshot ? visibleDays.reduce((sum, day) => sum + day.count, 0) : null;
  const active = snapshot ? visibleDays.filter((day) => day.count > 0).length : null;
  const busiest = visibleDays.reduce<ActivityDay | null>((peak, day) => !peak || day.count > peak.count ? day : peak, null);
  const selectedIndex = days.findIndex((day) => day.date === selectedDate);
  const selected = days[selectedIndex];
  const latestContribution = [...days].reverse().find((day) => day.count > 0);
  const unit = snapshot?.metric === 'commits' ? t.commits : t.contributions;
  const highlights = snapshot?.highlights.filter((entry) => entry.date >= windowStart && (!lastDate || entry.date <= lastDate)).sort((a, b) => b.date.localeCompare(a.date)) ?? [];
  const selectedHighlights = snapshot?.highlights.filter((entry) => entry.date === selectedDate) ?? [];
  const number = (value: number | null) => value === null ? '—' : new Intl.NumberFormat(locale).format(value);
  const date = (value: string, full = false) => new Intl.DateTimeFormat(locale, { day: 'numeric', month: full ? 'long' : 'short', ...(full ? { year: 'numeric' as const } : {}), timeZone: 'UTC' }).format(new Date(`${value}T00:00:00Z`));
  const syncDate = snapshot ? new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' }).format(new Date(snapshot.updatedAt)) : null;
  const max = Math.max(1, ...days.map((day) => day.count));
  const handleSceneReady = useCallback((available: boolean) => setSceneReady(available), []);

  useEffect(() => {
    if (!playing || paused || reducedMotion || !visibleDays.length || !stageVisible || !pageVisible) return;
    let frame = 0;
    let last = performance.now();
    let painted = last;
    const advance = (now: number) => {
      revealRef.current = Math.min(1, revealRef.current + (now - last) / 18_000);
      last = now;
      if (now - painted >= 50 || revealRef.current >= 1) {
        painted = now;
        setReveal(revealRef.current);
        const index = Math.min(visibleDays.length - 1, Math.floor(revealRef.current * visibleDays.length));
        setSelectedDate(visibleDays[index].date);
      }
      if (revealRef.current < 1) frame = requestAnimationFrame(advance);
      else setPlaying(false);
    };
    frame = requestAnimationFrame(advance);
    return () => cancelAnimationFrame(frame);
  }, [playing, paused, reducedMotion, visibleDays, stageVisible, pageVisible]);

  function selectDay(value: string) {
    setPlaying(false); revealRef.current = 1; setReveal(1); setSelectedDate(value);
    if (value < windowStart) setPeriod('year');
  }
  function choosePeriod(next: Period) {
    setPlaying(false); revealRef.current = 1; setReveal(1); setPeriod(next);
    if (lastDate) setSelectedDate(lastDate);
  }
  function toggleMotion() {
    const stopped = !paused;
    setPaused(stopped);
    if (stopped) { setPlaying(false); revealRef.current = 1; setReveal(1); }
    document.documentElement.dataset.motion = stopped ? 'paused' : 'running';
    try { localStorage.setItem('mouseion:motion', stopped ? 'paused' : 'running'); } catch { /* Optional persistence. */ }
  }
  function togglePlayback() {
    if (playing) { setPlaying(false); revealRef.current = 1; setReveal(1); return; }
    revealRef.current = 0; setReveal(0); setPlaying(true);
    if (visibleDays.length) setSelectedDate(visibleDays[0].date);
  }

  return (
    <div className="activity-experience" data-motion={paused || reducedMotion ? 'paused' : 'running'}>
      <section ref={stage} className={`activity-stage activity-period-${period}${sceneReady && !reducedMotion ? ' has-webgl' : ' has-fallback'}`} aria-labelledby="activity-title" aria-busy={loadState === 'loading'}>
        <div className="activity-stage-grid" aria-hidden="true" />
        <div className="activity-stage-axis" aria-hidden="true"><span>τ / {days.length || '—'}</span><span>365 : 30 : 7</span></div>
        <div className="activity-stage-editorial">
          <p className="activity-eyebrow activity-enter"><span className="activity-signal" aria-hidden="true" />{t.eyebrow}</p>
          <h1 id="activity-title" className="activity-enter"><span>{t.titleFirst}</span><span>{t.titleBridge}</span><em>{t.titleLast}</em></h1>
          <p className="activity-stage-intro activity-enter">{t.intro}</p>
          <dl className="activity-metrics activity-enter">
            <div><dt>{unit}<span>{t.periods[period].toLowerCase()}</span></dt><dd><Count value={total} locale={locale} reducedMotion={reducedMotion || paused} /></dd></div>
            <div><dt>{t.activeDays}</dt><dd>{number(active)}<span> / {snapshot ? visibleDays.length : '—'}</span></dd></div>
            <div><dt>{t.busiestDay}</dt><dd>{busiest && busiest.count > 0 ? date(busiest.date) : '—'}<span>{busiest && busiest.count > 0 ? `${number(busiest.count)} ${unit}` : ''}</span></dd></div>
          </dl>
        </div>
        <div className="activity-stage-visual">
          <div className="activity-scene-mount">
            {!reducedMotion && <ActivityScene days={days} windowSize={windowLength} selectedDate={selectedDate} onSelect={selectDay} paused={paused} reveal={reveal} reducedMotion={reducedMotion} label={t.stageLabel} onReady={handleSceneReady} />}
          </div>
          {(!sceneReady || reducedMotion) && <div className="activity-scene-fallback"><ActivityOrbit days={days} locale={locale} selectedDate={selectedDate} windowStart={windowStart} onSelect={selectDay} total={total} periodLabel={t.periodsShort[period]} unit={unit} /></div>}
          <div className="activity-scene-caption" aria-hidden="true"><span>{t.geometry[period]}</span><span>{t.stageHint}</span></div>
          <div className="activity-day-detail">
            <span className="activity-selected-marker" aria-hidden="true">＋</span>
            <p className="activity-day-date">{selected ? date(selected.date, true) : '—'}</p>
            <p className="activity-day-value">{number(selected?.count ?? null)}<span>{unit}</span></p>
          </div>
        </div>
        <div className="activity-transport activity-enter">
          <div className="activity-transport-heading">
            <div className="activity-periods" role="group" aria-label={t.periodLabel}>
              {(['year', 'month', 'week'] as const).map((item) => <button type="button" key={item} aria-label={t.periods[item]} aria-pressed={period === item} onClick={() => choosePeriod(item)}><span className="activity-period-index" aria-hidden="true">{item === 'year' ? '01' : item === 'month' ? '02' : '03'}</span>{t.periodsShort[item]}</button>)}
            </div>
            <div className="activity-motion-controls">
              <button type="button" className="activity-replay" aria-label={playing ? t.stop : t.play} disabled={!days.length || (!playing && (reducedMotion || paused))} onClick={togglePlayback}><span aria-hidden="true">{playing ? '■' : '▷'}</span><span className="activity-replay-full">{playing ? t.stopShort : t.playShort}</span><span className="activity-replay-compact">{playing ? t.stopShort : t.playCompact}</span><small>18s</small></button>
              <button type="button" className="activity-motion-button" aria-label={paused ? t.resume : t.pause} aria-pressed={paused} disabled={reducedMotion} onClick={toggleMotion}><span aria-hidden="true">{paused ? '▷' : 'Ⅱ'}</span><span>{reducedMotion ? t.reduced : paused ? t.motionPaused : t.motion}</span></button>
            </div>
          </div>
          <div className="activity-time-rail">
            <div className="activity-time-bars" aria-hidden="true">
              {days.map((day) => <span key={day.date} className={`${day.date >= windowStart ? ' in-window' : ''}${day.date === selectedDate ? ' is-current' : ''}`} style={{ height: `${day.count ? 13 + Math.sqrt(day.count / max) * 68 : 3}%` }} />)}
            </div>
            <label className="sr-only" htmlFor="activity-time-range">{t.timelineLabel}</label>
            <input id="activity-time-range" type="range" min={0} max={Math.max(0, days.length - 1)} step={1} value={Math.max(0, selectedIndex)} disabled={!days.length} aria-valuetext={selected ? `${date(selected.date, true)} · ${selected.count} ${unit}` : '—'} onChange={(event) => selectDay(days[Number(event.target.value)].date)} />
          </div>
          <div className="activity-time-labels"><span>{days.length ? date(days[0].date, true) : '—'}</span><span>{t.timeline}</span><span>{lastDate ? date(lastDate, true) : '—'}</span></div>
          <div className="activity-explorer-row">
            <p>{t.heroNote}</p>
            <div className="activity-date-controls">
              <button type="button" aria-label={t.previousDay} disabled={selectedIndex <= 0} onClick={() => selectDay(days[selectedIndex - 1].date)}>←</button>
              <label className="sr-only" htmlFor="activity-day-select">{t.selectDay}</label>
              <input id="activity-day-select" type="date" value={selectedDate ?? ''} min={days[0]?.date} max={lastDate} disabled={!days.length} onChange={(event) => { if (days.some((day) => day.date === event.target.value)) selectDay(event.target.value); }} />
              <button type="button" aria-label={t.nextDay} disabled={selectedIndex < 0 || selectedIndex === days.length - 1} onClick={() => selectDay(days[selectedIndex + 1].date)}>→</button>
              <span>{t.timezone}</span>
            </div>
          </div>
        </div>
        <div className="activity-status" role="status">
          {loadState === 'loading' && <p className="activity-loading">{t.loading}</p>}
          {loadState === 'unavailable' && <p>{t.unavailable}</p>}
          {loadState === 'error' && <p>{t.fetchFailed} <button type="button" onClick={() => { setLoadState('loading'); void load(); }}>{t.retry} <span aria-hidden="true">↗</span></button></p>}
          {loadState === 'ready' && stale && <p>{t.stale}</p>}
          {loadState === 'ready' && refreshFailed && <p>{t.refreshFailed}</p>}
        </div>
      </section>
      <section className="activity-record" aria-labelledby="activity-chart-title">
        <div className="activity-record-heading"><p className="activity-mobile-intro">{t.intro}</p><p className="activity-eyebrow">{t.observatory}</p><h2 id="activity-chart-title">{t.chartTitle}</h2><p>{t.chartIntro}</p></div>
        <dl className="activity-provenance">
          <div><dt>{t.source}</dt><dd>{snapshot ? snapshot.source === 'github' ? t.github : t.journal : '—'}</dd></div>
          <div><dt>{t.sync}</dt><dd>{syncDate ?? '—'}{snapshot && ' UTC'}</dd></div>
          <div><dt>{t.latest}</dt><dd>{latestContribution ? date(latestContribution.date, true) : snapshot ? t.noLatest : '—'}</dd></div>
        </dl>
      </section>
      <section className="activity-diary" aria-labelledby="activity-diary-title">
        <div><p className="activity-eyebrow">{t.diaryEyebrow}</p><h2 id="activity-diary-title">{t.diaryTitle}</h2><p className="activity-diary-intro">{t.diaryIntro}</p></div>
        <div className="activity-diary-entries">
          {selectedHighlights.length > 0 && <div className="activity-selected-note"><span className="activity-area">{selectedDate ? date(selectedDate, true) : ''}</span>{selectedHighlights.map((entry, index) => <p key={`${entry.date}-${index}`}>{entry.title[locale]}</p>)}</div>}
          {highlights.length ? highlights.map((entry, index) => <article key={`${entry.date}-${index}`}><time dateTime={entry.date}>{date(entry.date, true)}</time><span className="activity-area">{t.areas[entry.area]}</span><h3>{entry.title[locale]}</h3></article>) : <div className="activity-diary-empty"><span aria-hidden="true">✳</span><p>{t.noDiary}</p></div>}
        </div>
      </section>
    </div>
  );
}
