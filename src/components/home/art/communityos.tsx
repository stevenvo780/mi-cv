import type { CSSProperties } from 'react';
import type { ArtProps } from './types';

const css = (o: Record<string, string | number>) => o as CSSProperties;

interface Isla {
  c: string;
  n: number;
  f: number;
  v: number;
  pos: string;
  e?: number;
}

/* Tres comunidades en la misma instancia, aisladas por tenantId: Cafetería del Caos (la comunidad sembrada del demo,
   con su taza), Koinonía al centro con su isotipo y una por crear (el «+» con el que Discord añade un servidor).
   c: color; n: miembros del anillo; f: XP del nivel en curso (%); v: quien habla en voz; e: desde aquí, puestos libres;
   pos: centro (x, y) y escala de la isla. */
const ISLAS: Isla[] = [
  { c: 'var(--violet)', n: 6, f: 62, v: 4, pos: '18.5 33 .7' },
  { c: 'var(--teal)', n: 8, f: 44, v: 1, pos: '50 28 1' },
  { c: 'var(--bl)', n: 6, f: 22, v: 0, pos: '81.5 33 .7', e: 3 },
];

/* Top de usuarios de Koinonía, dentro de su propio muro: podio con el oro, la plata y el bronce del sitio.
   p: puesto en reposo; q: tras la subida de nivel (el tercero pasa a primero). */
const PODIO = ['au', 'ag', 'cu'];
const TOP = [
  [0, 1],
  [1, 2],
  [2, 0],
];

/** Koinonía: islas de miembros con su anillo de XP, la voz en cada comunidad y el ranking que se reordena. */
export default function Art(_: ArtProps) {
  return (
    <div className="art art-communityos" aria-hidden="true">
      {ISLAS.map((s, k) => {
        const [x, y, z] = s.pos.split(' ');
        return (
          <div key={s.c} className="t" style={css({ ...(k === 2 ? { '--k': 'var(--g)' } : {}), '--c': s.c, '--n': s.n, '--f': s.f, '--d': `${k * 2.5}s`, left: `${x}cqw`, top: `${y}cqw`, scale: z })}>
            <b>{k === 2 ? '+' : null}</b>
            <svg viewBox="-16 -16 32 32">
              <circle r="15" strokeWidth=".8" opacity=".18" />
              <circle className="k" r="15" pathLength={100} transform="rotate(-90)" strokeWidth="1" strokeDasharray="100" />
              {/* Taza de la Cafetería del Caos; isotipo de Koinonía: cuatro anillos en comunión y su núcleo. */}
              {k === 0 ? (
                <>
                  <path d="M-2.5-.6h3.8V1a1.9 1.9 0 0 1-3.8 0z" fill="currentColor" />
                  <path d="M1.3-.1a1.2 1.2 0 0 1 0 2.4M-1.5-1.6q.6-.6 0-1.3M.1-1.6q.6-.6 0-1.3" strokeWidth=".7" />
                </>
              ) : k === 1 ? (
                <>
                  <circle cy="-1.9" r="2.2" />
                  <circle cx="1.9" r="2.2" />
                  <circle cy="1.9" r="2.2" />
                  <circle cx="-1.9" r="2.2" />
                  <circle r=".7" fill="currentColor" />
                </>
              ) : null}
            </svg>
            {Array.from({ length: s.n }, (_, i) => (
              <i key={i} className={i === s.v ? 'v' : s.e !== undefined && i >= s.e ? 'e' : undefined} style={css({ '--i': i })} />
            ))}
            <u style={css({ '--i': s.v })} />
            {k === 1 ? (
              <>
                <kbd>+XP</kbd>
                {[-72, -40, 40, 72].map((a) => (
                  <em key={a} style={css({ '--a': `${a}deg` })} />
                ))}
              </>
            ) : null}
          </div>
        );
      })}
      <div className="lb">
        {PODIO.map((g, p) => (
          <b key={g} style={css({ '--p': p, '--pc': `var(--${g})` })}>
            #{p + 1}
          </b>
        ))}
        {TOP.map(([p, q]) => (
          <i key={p} className={q < p ? 'up' : undefined} style={css({ '--p': p, '--q': q })} />
        ))}
      </div>
    </div>
  );
}
