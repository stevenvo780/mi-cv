'use client';

import { useId, useSyncExternalStore, type CSSProperties } from 'react';
import '@/styles/beast-dominion.css';

export type DominionTier = 'apex' | 'titan' | 'colossus' | 'creature' | 'spark' | 'dormant';
export interface BeastDominionProps {
  ratio: number;
  tier: DominionTier;
  paused: boolean;
  visible: boolean;
  label: string;
}

const CENTER = { x: 325, y: 320 };
const tabVisible = () => document.visibilityState !== 'hidden';
function subscribeVisibility(notify: () => void) {
  document.addEventListener('visibilitychange', notify);
  return () => document.removeEventListener('visibilitychange', notify);
}
function polar(radius: number, degrees: number) {
  const angle = degrees * Math.PI / 180;
  return { x: CENTER.x + Math.cos(angle) * radius, y: CENTER.y + Math.sin(angle) * radius };
}
const pair = (point: { x: number; y: number }) => `${point.x.toFixed(2)} ${point.y.toFixed(2)}`;
function arc(radius: number, start: number, end: number) {
  return `M${pair(polar(radius, start))}A${radius} ${radius} 0 ${end - start > 180 ? 1 : 0} 1 ${pair(polar(radius, end))}`;
}

/** Activity changes the field linearly. Its ceremonial rays and glyphs are ornament, never extra data marks. */
export default function BeastDominion({ ratio, tier, paused, visible, label }: BeastDominionProps) {
  const id = useId().replace(/:/g, '');
  const documentVisible = useSyncExternalStore(subscribeVisibility, tabVisible, () => true);
  const power = Number.isFinite(ratio) ? Math.max(0, Math.min(1, ratio)) : 0;
  const radius = 214 + power * 50;
  const levels = tier === 'apex' ? 3 : tier === 'titan' ? 2 : tier === 'colossus' ? 1 : 0;
  const ref = (name: string) => `url(#bd-${id}-${name})`;
  const style = {
    '--bd-power': power,
    '--bd-iris-opacity': power * 0.65,
    '--bd-ring-opacity': power * 0.66,
    '--bd-ray-opacity': power * 0.87,
    '--bd-crown-opacity': power * 0.94,
    '--bd-field-scale': 0.72 + power * 0.28,
  } as CSSProperties;

  return (
    <div className="beast-dominion" data-tier={tier} data-paused={paused} data-visible={visible && documentVisible}
      data-active={power > 0} aria-hidden="true" style={style}>
      <div className="bd-ambient-iris" />
      <svg className="bd-seal" viewBox="0 0 650 650" focusable="false" aria-hidden="true">
        <title>{label}</title>
        <defs>
          <radialGradient id={`bd-${id}-iris`}>
            <stop offset=".42" stopColor="#0b2723" stopOpacity="0" />
            <stop offset=".64" stopColor="#3da88f" stopOpacity=".02" />
            <stop offset=".79" stopColor="#53bea4" stopOpacity=".24" />
            <stop offset=".87" stopColor="#c7b477" stopOpacity=".3" />
            <stop offset=".94" stopColor="#24786c" stopOpacity=".06" />
            <stop offset="1" stopColor="#3da88f" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`bd-${id}-gold-mist`}>
            <stop offset=".52" stopColor="#ceab5e" stopOpacity="0" />
            <stop offset=".76" stopColor="#c2984b" stopOpacity=".14" />
            <stop offset=".88" stopColor="#efce82" stopOpacity=".18" />
            <stop offset="1" stopColor="#ac7830" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={`bd-${id}-metal`} x1="0" y1=".8" x2="1" y2=".2">
            <stop stopColor="#2b8b79" /><stop offset=".28" stopColor="#8cd4b5" />
            <stop offset=".5" stopColor="#f0d590" /><stop offset=".74" stopColor="#b59657" /><stop offset="1" stopColor="#58958a" />
          </linearGradient>
          <linearGradient id={`bd-${id}-crown`} x1="0" y1="0" x2="0" y2="1">
            <stop stopColor="#fae5a8" /><stop offset=".45" stopColor="#ccac66" /><stop offset="1" stopColor="#34766a" />
          </linearGradient>
        </defs>

        <g className="bd-iris">
          <circle cx="325" cy="320" r="306" fill={ref('iris')} />
          <ellipse cx="325" cy="298" rx="291" ry="278" fill={ref('gold-mist')} />
          <circle cx="325" cy="320" r={radius + 10} fill="none" stroke="#78c6a7" strokeWidth="12" className="bd-soft-halo" />
        </g>

        <g className="bd-rays" fill="none" strokeLinecap="round">
          {Array.from({ length: 72 }, (_, index) => {
            const degrees = index * 5;
            const from = polar(radius + 6, degrees);
            const to = polar(radius + 12 + power * (index % 6 === 0 ? 25 : index % 3 === 0 ? 16 : 8), degrees);
            return <path key={index} d={`M${pair(from)}L${pair(to)}`} stroke={index % 6 === 0 ? '#e6c67f' : '#6bc1a4'}
              strokeWidth={index % 6 === 0 ? 1.2 : 0.65} vectorEffect="non-scaling-stroke" />;
          })}
        </g>

        <g className="bd-orbits bd-orbit-first" fill="none" stroke={ref('metal')}>
          <circle cx="325" cy="320" r={radius - 3} strokeWidth=".8" strokeDasharray="2 12" />
          <path d={arc(radius + 2, -173, -62)} strokeWidth="1.15" />
          <path d={arc(radius + 2, -45, 69)} strokeWidth=".75" />
          <path d={arc(radius + 2, 101, 163)} strokeWidth="1.1" />
          <path d={arc(radius - 13, 21, 144)} strokeWidth=".65" opacity=".5" />
          {[21, 144, 244].map((degrees) => {
            const p = polar(radius + 2, degrees);
            return <g key={degrees} transform={`translate(${p.x} ${p.y}) rotate(${degrees + 90})`}>
              <path d="M0-6 3.5 0 0 6-3.5 0Z" fill="#d9b971" strokeWidth=".7" />
              <path d="M-7 0H7M0-11V-7M0 7V11" strokeWidth=".6" />
            </g>;
          })}
        </g>

        <g className="bd-orbits bd-orbit-second" fill="none" stroke={ref('metal')}>
          <ellipse cx="325" cy="320" rx={radius + 8} ry={radius - 25} transform="rotate(-24 325 320)" strokeWidth=".65" />
          <path d={arc(radius - 24, -137, -58)} strokeWidth="1" />
          <path d={arc(radius - 24, 73, 115)} strokeWidth="1" />
          {Array.from({ length: 12 }, (_, index) => {
            const degrees = index * 30 + 15;
            const p = polar(radius - 24, degrees);
            return <path key={index} transform={`translate(${p.x} ${p.y}) rotate(${degrees + 90})`}
              d="M-3-5 0-2 3-5M0-2V5M-3 5H3" strokeWidth=".7" />;
          })}
        </g>

        {levels > 0 && <g className="bd-crown" fill="none" stroke={ref('crown')} strokeLinejoin="round" strokeLinecap="round">
          {Array.from({ length: levels }, (_, level) => {
            const crownRadius = 241 + level * 15;
            const starts = [-153, -148, -142];
            const ends = [-27, -32, -38];
            return <g key={level} className={`bd-crown-level bd-crown-level-${level}`}>
              <path d={arc(crownRadius, starts[level], ends[level])} strokeWidth={level === 1 ? 1.6 : 0.85} />
              <path d={arc(crownRadius + 5, starts[level] + 4, ends[level] - 4)} strokeWidth=".55" opacity=".55" />
              {Array.from({ length: level === 2 ? 5 : 7 }, (_, index) => {
                const total = level === 2 ? 5 : 7;
                const degrees = starts[level] + 7 + index / (total - 1) * (ends[level] - starts[level] - 14);
                const p = polar(crownRadius, degrees);
                const central = index === (total - 1) / 2;
                const length = (central ? 19 : 11) + level * 4;
                return <g key={index} transform={`translate(${p.x} ${p.y}) rotate(${degrees + 90})`}>
                  <path d={`M-5 2-3-6 0-${length} 3-6 5 2M0-${length}V4`} strokeWidth={central ? 1.1 : 0.75} />
                  {central && <path className="bd-crown-jewel" d={`M0-${length + 3} 3.8-${length + 8} 0-${length + 13}-3.8-${length + 8}Z`} fill="#d7be78" strokeWidth=".6" />}
                  <path d="M-2 5 0 7 2 5" strokeWidth=".6" opacity=".6" />
                </g>;
              })}
            </g>;
          })}
          {tier === 'apex' && <g className="bd-apex-seal" transform="translate(325 47)">
            <path d="M-14 0-7-4 0-14 7-4 14 0 7 4 0 14-7 4Z" strokeWidth=".8" />
            <path d="M0-8 3 0 0 8-3 0Z" fill="#e5cb89" strokeWidth=".6" />
            <path d="M-24 0H-18M18 0H24M0-24V-18M0 18V24" strokeWidth=".65" />
          </g>}
        </g>}

        <g className="bd-underseal" fill="none" stroke={ref('metal')}>
          <path d="M231 569Q325 603 419 569M249 581Q325 612 401 581" strokeWidth=".8" />
          <path d="M325 589V609M316 603 325 610 334 603M293 598 297 602 293 606 289 602Z M357 598 361 602 357 606 353 602Z" strokeWidth=".65" />
        </g>
      </svg>
    </div>
  );
}
