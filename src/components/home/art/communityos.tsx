import type { CSSProperties } from 'react';
import type { ArtProps } from './types';

const css = (o: Record<string, string | number>) => o as CSSProperties;

interface Isla {
  c: string;
  n: number;
  f: number;
  v: number;
  pos: string;
  t?: string;
  e?: number;
}

/* Tres comunidades en la misma instancia, aisladas por tenantId: Cafetería del Caos (la comunidad sembrada del demo),
   Koinonía al centro con su isotipo y una por crear (el «+» con el que Discord añade un servidor).
   c: color; n: miembros del anillo; f: XP del nivel en curso (%); v: quien habla en voz; e: desde aquí, puestos libres;
   pos: centro (x, y) y escala de la isla. */
const ISLAS: Isla[] = [
  { c: '#8d7cc0', n: 6, f: 62, v: 4, pos: '18.5 29.5 .7', t: 'CdC' },
  { c: '#43b5a6', n: 8, f: 44, v: 1, pos: '50 28 1' },
  { c: '#5865f2', n: 6, f: 22, v: 0, pos: '81.5 29.5 .7', t: '+', e: 3 },
];

/* Top de usuarios con los degradados del sitio. p: puesto en reposo; q: tras subir de nivel (el de Koinonía, #3 → #1). */
const PODIO = ['#ffd700 30%,#ffc400', '#c0c0c0 30%,#a9a9a9', '#cd7f32 30%,#b87333'];
const TOP = [
  { c: '#5865f2', p: 0, q: 1 },
  { c: '#8d7cc0', p: 1, q: 2 },
  { c: '#43b5a6', p: 2, q: 0 },
];

/** Koinonía: islas de miembros con su anillo de XP, la voz que salta entre comunidades y el ranking que se reordena. */
export default function Art(_: ArtProps) {
  return (
    <div className="art art-communityos" aria-hidden="true">
      {ISLAS.map((s, k) => {
        const [x, y, z] = s.pos.split(' ');
        return (
          <div key={s.c} className="t" style={css({ '--c': s.c, '--n': s.n, '--f': s.f, '--d': `${k * 2.5}s`, left: `${x}cqw`, top: `${y}cqw`, scale: z })}>
            <b style={s.t === '+' ? { fontSize: '8cqw', fontWeight: 300 } : undefined}>{s.t}</b>
            <svg viewBox="-16 -16 32 32">
              <circle r="15" strokeWidth=".8" opacity=".18" />
              <circle
                className="k"
                r="15"
                pathLength={100}
                transform="rotate(-90)"
                strokeWidth="1"
                strokeLinecap="round"
                strokeDasharray="100"
                style={{ filter: `drop-shadow(0 0 .8px ${s.c})` }}
              />
              {/* Isotipo de Koinonía: cuatro anillos en comunión y su núcleo. */}
              {k === 1 ? (
                <>
                  <circle cy="-1.9" r="2.2" />
                  <circle cx="1.9" r="2.2" />
                  <circle cy="1.9" r="2.2" />
                  <circle cx="-1.9" r="2.2" />
                  <circle r=".7" fill="#6fd3c4" stroke="none" />
                </>
              ) : null}
            </svg>
            {Array.from({ length: s.n }, (_, i) => (
              <i key={i} className={i === s.v ? 'v' : s.e !== undefined && i >= s.e ? 'e' : undefined} style={css({ '--i': i })} />
            ))}
            <u style={css({ '--i': s.v })} />
            {k === 1 ? (
              <>
                <s>+XP</s>
                {[0, 1, 2, 3, 4, 5].map((a) => (
                  <em key={a} style={css({ '--a': `${a * 60 + 30}deg` })} />
                ))}
              </>
            ) : null}
          </div>
        );
      })}
      <div className="lb">
        {PODIO.map((g, p) => (
          <b key={g} style={css({ '--p': p, background: `linear-gradient(45deg,${g} 90%)` })}>
            #{p + 1}
          </b>
        ))}
        {TOP.map((m) => (
          <i key={m.c} className={m.q < m.p ? 'up' : undefined} style={css({ '--c': m.c, '--p': m.p, '--q': m.q })} />
        ))}
      </div>
    </div>
  );
}
