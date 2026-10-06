'use client';

import { useId, useRef, type KeyboardEvent } from 'react';
import type { ActivityDay } from '@/activity/model';
import { ACTIVITY } from '@/content/activity';
import type { Locale } from '@/lib/site';

type Point = ActivityDay & { x: number; y: number; radius: number; color: string; inWindow: boolean };

function position(index: number, total: number) {
  const fraction = index / Math.max(total - 1, 1);
  const angle = -Math.PI / 2 + fraction * Math.PI * 5.7;
  const radius = 127 + fraction * 185;
  return { x: 400 + Math.cos(angle) * radius, y: 400 + Math.sin(angle) * radius };
}

export default function ActivityOrbit({ days, locale, selectedDate, windowStart, onSelect, total, periodLabel, unit }: {
  days: ActivityDay[]; locale: Locale; selectedDate: string | null; windowStart: string;
  onSelect: (date: string) => void; total: number | null; periodLabel: string; unit: string;
}) {
  const t = ACTIVITY[locale];
  const id = useId().replace(/:/g, '');
  const nodes = useRef(new Map<string, SVGGElement>());
  const max = Math.max(1, ...days.map((day) => day.count));
  const points: Point[] = days.map((day, index) => ({
    ...day, ...position(index, days.length), radius: day.count ? 2.3 + Math.sqrt(day.count / max) * 5.3 : 1.6,
    color: day.count / max > 0.65 ? 'var(--gold-2)' : day.count / max > 0.3 ? '#ac9adf' : 'var(--teal-2)',
    inWindow: day.date >= windowStart,
  }));
  const selectedPoint = points.find((day) => day.date === selectedDate);
  const dateFormat = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
  const monthFormat = new Intl.DateTimeFormat(locale, { month: 'short', timeZone: 'UTC' });
  const months = points.filter((day, index) => index === 0 || day.date.slice(0, 7) !== points[index - 1].date.slice(0, 7));
  // The spiral is decorative until a real snapshot arrives; no invented contribution marks.
  const guide = Array.from({ length: 240 }, (_, index) => position(index, 240));
  const spiral = guide.map((point, index) => `${index ? 'L' : 'M'}${point.x.toFixed(2)},${point.y.toFixed(2)}`).join(' ');
  function onKeyDown(event: KeyboardEvent<SVGGElement>, index: number) {
    const changes: Record<string, number> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
    let next = index;
    if (event.key in changes) next = Math.min(points.length - 1, Math.max(0, index + changes[event.key]));
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = points.length - 1;
    else if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onSelect(points[index].date); return; }
    else return;
    event.preventDefault();
    onSelect(points[next].date);
    nodes.current.get(points[next].date)?.focus();
  }
  return (
    <div className="activity-orbit-frame">
      <svg className="activity-orbit" viewBox="0 0 800 800" role="group" aria-labelledby={`${id}-title ${id}-desc`}>
        <title id={`${id}-title`}>{t.chartTitle}</title>
        <desc id={`${id}-desc`}>{t.chartAccessible}</desc>
        <defs>
          <radialGradient id={`${id}-halo`}><stop stopColor="#43b5a6" stopOpacity=".15" /><stop offset="1" stopColor="#43b5a6" stopOpacity="0" /></radialGradient>
          <linearGradient id={`${id}-trace`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#6fd3c4" /><stop offset=".5" stopColor="#8d7cc0" /><stop offset="1" stopColor="#f0c887" /></linearGradient>
        </defs>
        <circle cx="400" cy="400" r="330" fill={`url(#${id}-halo)`} />
        <g className="activity-orbit-grid" fill="none">
          {[116, 188, 260, 344].map((radius) => <circle key={radius} cx="400" cy="400" r={radius} />)}
          <path d="M400 41v44m0 630v44M41 400h44m630 0h44" />
          {Array.from({ length: 72 }, (_, index) => <path key={index} d="M400 49v5" transform={`rotate(${index * 5} 400 400)`} />)}
        </g>
        <path className="activity-orbit-trace" d={spiral} fill="none" stroke={`url(#${id}-trace)`} />
        <g className="activity-orbit-axis" aria-hidden="true"><text x="400" y="29">N</text><text x="771" y="404">E</text><text x="400" y="786">S</text><text x="29" y="404">W</text></g>
        {months.map((point) => {
          const outward = Math.atan2(point.y - 400, point.x - 400);
          return <text className="activity-month-label" key={point.date} x={point.x + Math.cos(outward) * 22} y={point.y + Math.sin(outward) * 22 - 3} textAnchor={point.x < 360 ? 'end' : point.x > 440 ? 'start' : 'middle'} aria-hidden="true">{monthFormat.format(new Date(`${point.date}T00:00:00Z`))}</text>;
        })}
        {selectedPoint && <line className="activity-selected-ray" x1="400" y1="400" x2={selectedPoint.x} y2={selectedPoint.y} />}
        {points.map((point, index) => (
          <g key={point.date} className={`activity-day${point.date === selectedDate ? ' is-selected' : ''}${point.inWindow ? '' : ' outside-window'}${point.count ? ' has-activity' : ''}`}
            ref={(node) => { if (node) nodes.current.set(point.date, node); else nodes.current.delete(point.date); }}
            role="button" tabIndex={point.date === selectedDate ? 0 : -1} aria-pressed={point.date === selectedDate}
            aria-label={`${dateFormat.format(new Date(`${point.date}T00:00:00Z`))}: ${point.count} ${unit}`}
            onClick={() => onSelect(point.date)} onKeyDown={(event) => onKeyDown(event, index)}
            style={{ color: point.color }}>
            <circle className="activity-day-hit" cx={point.x} cy={point.y} r={11} />
            {point.count > 0 && <circle className="activity-day-aura" cx={point.x} cy={point.y} r={point.radius * 2.7} />}
            <circle className="activity-day-core" cx={point.x} cy={point.y} r={point.radius} />
            <circle className="activity-day-ring" cx={point.x} cy={point.y} r={point.radius + 6} />
          </g>
        ))}
        <g className="activity-orbit-center" aria-hidden="true">
          <text className="activity-orbit-symbol" x="400" y="368">✳</text>
          <text className="activity-orbit-total" x="400" y="423">{total === null ? '—' : new Intl.NumberFormat(locale).format(total)}</text>
          <text className="activity-orbit-period" x="400" y="451">{total === null ? t.orbitEmpty : periodLabel}</text>
          <text className="activity-orbit-motto" x="400" y="474">{t.orbitLabel}</text>
        </g>
      </svg>
      <div className="activity-orbit-caption"><span>{t.keyboardHint}</span><span>{t.timezone}</span></div>
    </div>
  );
}
