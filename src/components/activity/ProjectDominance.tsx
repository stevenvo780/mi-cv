'use client';

import { useId, useSyncExternalStore, type CSSProperties } from 'react';
import type { DominionTier } from '@/activity/projects/dominance';
import type { ProjectPeriod } from '@/activity/projects/model';
import { PROJECT_DOMINANCE } from '@/content/project-dominance';
import type { Locale } from '@/lib/site';
import '@/styles/project-dominance.css';

export interface DominanceEntry {
  id: string;
  name: string;
  count: number;
  ratio: number;
  tier: DominionTier;
}

const documentVisible = () => document.visibilityState === 'visible';
function subscribeVisibility(notify: () => void) {
  document.addEventListener('visibilitychange', notify);
  return () => document.removeEventListener('visibilitychange', notify);
}

export default function ProjectDominance({ locale, entries, selectedId, period, onSelect }: {
  locale: Locale;
  entries: DominanceEntry[];
  selectedId: string | null;
  period: ProjectPeriod;
  onSelect: (id: string) => void;
}) {
  const t = PROJECT_DOMINANCE[locale];
  const titleId = useId();
  const descriptionId = useId();
  const visible = useSyncExternalStore(subscribeVisibility, documentVisible, () => false);
  const hasActivity = entries.some((entry) => entry.count > 0);
  const sharedLead = entries.filter((entry) => entry.count > 0 && entry.tier === 'apex').length > 1;
  const format = new Intl.NumberFormat(locale);
  const percent = new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: 1 });

  if (!entries.length) return null;

  return (
    <section className="pd-instrument" aria-labelledby={titleId} aria-describedby={descriptionId} data-resting={!hasActivity} data-hidden={!visible}>
      <div className="pd-caption">
        <p className="pd-index"><span aria-hidden="true">✧</span>{t.periods[period]}</p>
        <h3 id={titleId}>{t.title}</h3>
        <p id={descriptionId} className="pd-reference">{t.relative}<span>{hasActivity ? t.reference : t.resting}</span></p>
      </div>
      <div className="pd-field" style={{ '--pd-columns': entries.length } as CSSProperties}>
        {entries.map((entry, index) => {
          const ratio = entry.count > 0 ? Math.max(0, Math.min(1, entry.ratio)) : 0;
          const apex = entry.count > 0 && entry.tier === 'apex';
          const active = selectedId === entry.id;
          const tier = apex && sharedLead ? t.shared : t.tiers[entry.tier];
          const relation = percent.format(ratio);
          return (
            <button type="button" className="pd-project" key={entry.id} data-project-id={entry.id} data-tier={entry.tier} data-apex={apex} aria-pressed={active}
              aria-label={`${entry.name} · ${format.format(entry.count)} ${t.commits} · ${t.relative}: ${relation} · ${tier}`}
              onClick={() => onSelect(entry.id)} style={{ '--pd-ratio': ratio, '--pd-order': index } as CSSProperties}>
              <span className="pd-measure" aria-hidden="true">
                <span className="pd-ruler" /><span className="pd-beam" /><span className="pd-core" />
                {apex && <svg className="pd-crown" viewBox="0 0 28 16" fill="none"><path d="m2 4 5 5 7-7 7 7 5-5-3 10H5L2 4Z" stroke="currentColor" strokeWidth="1.2" /><path d="M7 14h14" stroke="currentColor" strokeWidth="2" /></svg>}
              </span>
              <span className="pd-name">{entry.name}</span>
              <span className="pd-count">{format.format(entry.count)}<small>{t.commits}</small></span>
              <span className="pd-relation"><span>{relation}</span><span>{entry.count ? tier : t.resting}</span></span>
              <span className="pd-selection" aria-hidden="true">{active ? '↗' : '＋'}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
