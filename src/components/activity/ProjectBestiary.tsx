'use client';

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore, type CSSProperties, type KeyboardEvent } from 'react';
import type { ProjectPeriod, ProjectResponse, ProjectSnapshot } from '@/activity/projects/model';
import { BEAST_KINDS, PROJECT_BESTIARY } from '@/content/project-bestiary';
import type { Locale } from '@/lib/site';
import BeastFallback from './beasts/BeastFallback';
import BeastScene from './beasts/BeastScene';
import '@/styles/project-bestiary.css';

const getReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function subscribeMotion(notify: () => void) {
  const query = window.matchMedia('(prefers-reduced-motion: reduce)');
  query.addEventListener('change', notify);
  return () => query.removeEventListener('change', notify);
}
const getGlobalPause = () => document.documentElement.dataset.motion === 'paused';
function subscribeGlobalPause(notify: () => void) {
  const observer = new MutationObserver(notify);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-motion'] });
  return () => observer.disconnect();
}
function validSnapshot(value: ProjectSnapshot): boolean {
  if (value.version !== 1 || !(['github-public', 'github-authorized'] as const).includes(value.source) || value.metric !== 'commits' || value.coverage !== 'published-projects' || !Number.isFinite(Date.parse(value.updatedAt)) || !Array.isArray(value.projects)) return false;
  const identities = new Set<string>();
  return value.projects.every((project) => {
    if (!project || typeof project.id !== 'string' || !project.id || identities.has(project.id) || !project.name || !project.description || !BEAST_KINDS.includes(project.kind)) return false;
    if (!(['es', 'en'] as const).every((language) => typeof project.name[language] === 'string' && typeof project.description[language] === 'string')) return false;
    if (!project.counts || !(['week', 'month', 'year'] as const).every((period) => Number.isSafeInteger(project.counts[period]) && project.counts[period] >= 0)) return false;
    if (project.lastActive !== null && !Number.isFinite(Date.parse(project.lastActive))) return false;
    if (project.url !== undefined) {
      if (typeof project.url !== 'string') return false;
      const url = new URL(project.url);
      if (url.protocol !== 'https:' || url.username || url.password) return false;
    }
    identities.add(project.id);
    return true;
  });
}

export default function ProjectBestiary({ locale }: { locale: Locale }) {
  const t = PROJECT_BESTIARY[locale];
  const section = useRef<HTMLElement>(null);
  const ranking = useRef<HTMLOListElement>(null);
  const rows = useRef(new Map<string, HTMLButtonElement>());
  const [near, setNear] = useState(false);
  const [visible, setVisible] = useState(false);
  const [snapshot, setSnapshot] = useState<ProjectSnapshot | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'unavailable' | 'error'>('loading');
  const [refreshFailed, setRefreshFailed] = useState(false);
  const [stale, setStale] = useState(false);
  const [period, setPeriod] = useState<ProjectPeriod>('year');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [localPause, setLocalPause] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);
  const snapshotRef = useRef<ProjectSnapshot | null>(null);
  const controller = useRef<AbortController | null>(null);
  const pending = useRef(false);
  const lastAttempt = useRef(0);
  const reducedMotion = useSyncExternalStore(subscribeMotion, getReducedMotion, () => true);
  const globalPause = useSyncExternalStore(subscribeGlobalPause, getGlobalPause, () => false);
  const paused = reducedMotion || globalPause || localPause;
  const onReady = useCallback((available: boolean) => setSceneReady(available), []);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setVisible(entry.isIntersecting);
      if (entry.isIntersecting) setNear(true);
    }, { rootMargin: '300px 0px', threshold: .01 });
    if (section.current) observer.observe(section.current);
    return () => observer.disconnect();
  }, []);

  const load = useCallback(async () => {
    if (pending.current) return;
    pending.current = true; lastAttempt.current = Date.now();
    const request = new AbortController();
    controller.current = request;
    try {
      const response = await fetch('/api/activity/projects', { signal: request.signal, cache: 'no-store' });
      if (!response.ok) throw new Error('Project record unavailable');
      const body: ProjectResponse = await response.json();
      if (request.signal.aborted) return;
      if (body.status === 'unavailable' && body.snapshot === null) {
        if (snapshotRef.current) { setRefreshFailed(true); setStatus('ready'); }
        else setStatus('unavailable');
        return;
      }
      if (body.status !== 'ready' || !body.snapshot || !validSnapshot(body.snapshot)) throw new Error('Invalid project record');
      if (snapshotRef.current?.source === 'github-authorized' && body.snapshot.source !== 'github-authorized') throw new Error('Project scope unavailable');
      snapshotRef.current = body.snapshot;
      setSnapshot(body.snapshot); setStatus('ready'); setRefreshFailed(false);
      setStale(Date.now() - Date.parse(body.snapshot.updatedAt) > 172_800_000);
    } catch {
      if (!request.signal.aborted) {
        setRefreshFailed(Boolean(snapshotRef.current));
        setStatus(snapshotRef.current ? 'ready' : 'error');
      }
    } finally { if (controller.current === request) pending.current = false; }
  }, []);

  useEffect(() => {
    if (!near) return;
    let mounted = true;
    queueMicrotask(() => { if (mounted) void load(); });
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
  }, [near, load]);

  const ranked = useMemo(() => [...(snapshot?.projects ?? [])].sort((a, b) => b.counts[period] - a.counts[period] || a.name[locale].localeCompare(b.name[locale], locale)), [snapshot, period, locale]);
  const selected = ranked.find((project) => project.id === selectedId) ?? ranked[0] ?? null;
  const selectedIndex = selected ? ranked.findIndex((project) => project.id === selected.id) : -1;
  const max = Math.max(1, ...ranked.map((project) => project.counts[period]));
  const count = selected?.counts[period] ?? null;
  const energy = count === null ? 0 : Math.log1p(count) / Math.log1p(max);
  const creature = selected ? t.species[selected.kind] : null;
  const format = new Intl.NumberFormat(locale);
  const number = (value: number | null) => value === null ? '—' : format.format(value);
  const date = (value: string) => new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(value));
  const accessibleSpecimen = selected && creature ? `${selected.name[locale]} · ${creature.species} · ${number(count)} ${t.commits}` : t.selected;
  const authorized = snapshot?.source === 'github-authorized';

  useEffect(() => {
    const list = ranking.current;
    const row = selected ? rows.current.get(selected.id) : null;
    if (!list || !row) return;
    const bounds = list.getBoundingClientRect();
    const item = row.getBoundingClientRect();
    // Follow selection inside the ledger without moving the page or keyboard focus.
    if (item.top < bounds.top) list.scrollTop += item.top - bounds.top;
    else if (item.bottom > bounds.bottom) list.scrollTop += item.bottom - bounds.bottom;
  }, [selected, period]);

  function cycle(direction: number) {
    if (!ranked.length) return;
    const next = (selectedIndex + direction + ranked.length) % ranked.length;
    setSelectedId(ranked[next].id);
  }
  function onRowKey(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next = index;
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') next = Math.min(ranked.length - 1, index + 1);
    else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') next = Math.max(0, index - 1);
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = ranked.length - 1;
    else return;
    event.preventDefault();
    setSelectedId(ranked[next].id);
    rows.current.get(ranked[next].id)?.focus();
  }

  return (
    <section ref={section} className="project-bestiary" id="project-bestiary" aria-labelledby="pb-title" aria-busy={near && status === 'loading'} data-motion={paused ? 'paused' : 'running'} data-visible={visible} data-kind={selected?.kind ?? 'hydra'}>
      <div className="pb-grain" aria-hidden="true" />
      <header className="pb-header">
        <div><p className="pb-eyebrow"><span aria-hidden="true">✳</span>{t.eyebrow}</p><h2 id="pb-title"><span>{t.titleFirst}</span><span>{t.titleBridge}</span><em>{t.titleLast}</em></h2></div>
        <div className="pb-header-aside"><p>{t.intro}</p><span className="pb-classification" aria-hidden="true">ORDO / 06<br />FORMA / VIVA</span></div>
      </header>
      <div className="pb-controls">
        <div className="pb-periods" role="group" aria-label={t.periodLabel}>{(['year', 'month', 'week'] as const).map((item) => <button type="button" key={item} aria-label={t.periodNames[item]} aria-pressed={period === item} onClick={() => setPeriod(item)}><span aria-hidden="true">{item === 'year' ? '01' : item === 'month' ? '02' : '03'}</span>{t.periods[item]}</button>)}</div>
        <button type="button" className="pb-motion-control" aria-label={globalPause ? t.globalPaused : localPause ? t.resume : t.pause} aria-pressed={paused} disabled={globalPause || reducedMotion} onClick={() => setLocalPause(!localPause)}><span aria-hidden="true">{paused ? '▷' : 'Ⅱ'}</span>{reducedMotion ? t.reduced : globalPause ? t.globalPaused : localPause ? t.paused : t.motion}</button>
      </div>
      <div className="pb-status" role="status">
        {near && status === 'loading' && <p>{t.loading}</p>}
        {status === 'unavailable' && <p>{t.unavailable} <button type="button" onClick={() => { setStatus('loading'); void load(); }}>{t.retry} ↗</button></p>}
        {status === 'error' && <p>{t.failed} <button type="button" onClick={() => { setStatus('loading'); void load(); }}>{t.retry} ↗</button></p>}
        {status === 'ready' && stale && <p>{t.stale}</p>}
        {status === 'ready' && refreshFailed && <p>{t.refreshFailed}</p>}
      </div>
      <div className="pb-theatre">
        <figure className={`pb-exhibit${sceneReady && !reducedMotion ? ' has-webgl' : ' has-fallback'}`}>
          <div className="pb-specimen-label"><span>{t.specimen} / {selectedIndex >= 0 ? String(selectedIndex + 1).padStart(3, '0') : '—'}</span><span>{creature?.species ?? '—'}</span></div>
          <div className="pb-specimen-visual" role="img" aria-label={accessibleSpecimen}>
            <div className="pb-specimen-grid" aria-hidden="true" /><div className="pb-specimen-reticle" aria-hidden="true">＋</div>
            {selected && near && !reducedMotion && <div className="pb-scene-mount" aria-hidden="true"><BeastScene kind={selected.kind} identity={selected.id} energy={energy} paused={paused} reducedMotion={reducedMotion} label={accessibleSpecimen} onReady={onReady} /></div>}
            {selected && (!sceneReady || reducedMotion) && <div className="pb-scene-fallback"><BeastFallback kind={selected.kind} identity={selected.id} energy={energy} /></div>}
            {!selected && <div className="pb-empty-exhibit"><span aria-hidden="true">✳</span><p>{near ? status === 'loading' ? t.loading : t.noProjects : t.loading}</p></div>}
            <div className="pb-particles" aria-hidden="true">{Array.from({ length: 13 }, (_, index) => <i key={index} style={{ '--i': index } as CSSProperties} />)}</div>
          </div>
          <figcaption className="pb-specimen-caption" key={selected?.id ?? 'empty'}>
            <div className="pb-specimen-identity"><span className="pb-character">{creature?.character ?? t.selected}</span><h3>{selected?.name[locale] ?? '—'}</h3><p>{selected?.description[locale] ?? ''}</p></div>
            <div className="pb-specimen-count"><span className="pb-count">{number(count)}</span><span>{t.commits} / {t.periods[period].toLowerCase()}</span></div>
            <div className="pb-specimen-footer"><p>{creature?.lore ?? ''}</p><div><button type="button" aria-label={t.previous} disabled={ranked.length < 2} onClick={() => cycle(-1)}>←</button><button type="button" aria-label={t.next} disabled={ranked.length < 2} onClick={() => cycle(1)}>→</button>{selected?.url && <a href={selected.url} target="_blank" rel="noopener noreferrer">{t.explore}<span aria-hidden="true">↗</span></a>}</div></div>
          </figcaption>
        </figure>
        <aside className="pb-ledger" aria-labelledby="pb-ledger-title">
          <div className="pb-ledger-heading"><h3 id="pb-ledger-title">{t.ranking}</h3><span>{snapshot ? String(ranked.length).padStart(2, '0') : '—'}</span></div><p id="pb-ledger-note" className="pb-ledger-note">{t.rankingNote}{ranked.length > 12 ? ` · ${t.rankingScroll}` : ''}</p>
          <ol ref={ranking} className="pb-ranking" aria-labelledby="pb-ledger-title" aria-describedby="pb-ledger-note" tabIndex={ranked.length ? 0 : -1}>{ranked.map((project, index) => {
            const relative = Math.log1p(project.counts[period]) / Math.log1p(max);
            return <li key={project.id} style={{ '--rank': index, '--energy': relative } as CSSProperties}>
              <button type="button" className={`pb-project-row${selected?.id === project.id ? ' is-selected' : ''}`} data-project-id={project.id} data-kind={project.kind} aria-label={`${project.name[locale]} · ${number(project.counts[period])} ${t.commits}`} aria-pressed={selected?.id === project.id}
                ref={(node) => { if (node) rows.current.set(project.id, node); else rows.current.delete(project.id); }} onClick={() => setSelectedId(project.id)} onKeyDown={(event) => onRowKey(event, index)}>
                <span className="pb-rank" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span><span className="pb-row-creature" aria-hidden="true"><BeastFallback kind={project.kind} identity={project.id} energy={relative} /></span>
                <span className="pb-row-identity"><span>{project.name[locale]}</span><small>{t.species[project.kind].species}</small></span><span className="pb-row-count">{number(project.counts[period])}<small>{t.commits}</small></span><span className="pb-row-meter" aria-hidden="true" />
              </button>
            </li>;
          })}</ol>
          {!ranked.length && <div className="pb-ledger-empty"><span>—</span><p>{near && status !== 'loading' ? t.noProjects : t.loading}</p></div>}
          <div className="pb-energy-caption"><span>{t.energy}</span><i aria-hidden="true" /><span>{t.less} → {t.more}</span></div><p className="pb-energy-note">{t.energyNote}</p>
          {selected && <p className="pb-last-active">{t.lastActive}<span>{selected.lastActive ? date(selected.lastActive) : t.none}</span></p>}
        </aside>
      </div>
      <div className="pb-field-guide" aria-labelledby="pb-guide-title"><div className="pb-guide-heading"><h3 id="pb-guide-title">{t.guide}</h3><p>{t.guideNote}</p></div>
        <div className="pb-species-strip">{BEAST_KINDS.map((kind, index) => {
          const project = ranked.find((entry) => entry.kind === kind);
          return <button key={kind} type="button" className={`pb-species${selected?.kind === kind ? ' is-selected' : ''}`} data-kind={kind} disabled={!project} aria-label={`${t.guideSelect}: ${t.species[kind].species}`} aria-pressed={selected?.kind === kind} title={project ? t.species[kind].character : t.emptySpecies} onClick={() => { if (project) setSelectedId(project.id); }}>
            <span className="pb-species-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span><BeastFallback kind={kind} energy={project ? Math.log1p(project.counts[period]) / Math.log1p(max) : 0} /><span className="pb-species-name">{t.species[kind].species}</span><span className="pb-species-character">{t.species[kind].character}</span>
          </button>;
        })}</div>
      </div>
      <footer className="pb-provenance"><div><p className="pb-eyebrow">{authorized ? t.authorizedSourceLabel : t.sourceLabel}</p><p>{authorized ? t.authorizedSource : t.source}</p></div><div><span>{t.updated}</span><time dateTime={snapshot?.updatedAt}>{snapshot ? date(snapshot.updatedAt) : '—'}</time><span>{t.timezone}</span></div></footer>
    </section>
  );
}
