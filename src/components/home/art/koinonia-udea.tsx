import type { CSSProperties } from 'react';
import type { ArtProps } from './types';

// Koinonía: el icono del sitio (dos anillos que se cruzan) hecho de gente. Cada punto es una voz en el arco exterior de
// su anillo; en la lente donde los dos coinciden espera el sello de la decisión. Unidades del viewBox (160 × 100) con
// el origen en el sello; la proporción es la del icono (radio 88, centros a 120 → radio 33, centros a 44).
const D = 22;
const R = 33;
const VAIVEN = [0, 1.7, -1.3, 0.9, -0.5];
const TALLA = [1.7, 1.25, 1.5, 2, 1.35];
const f = (n: number) => Math.round(n * 10) / 10;

// [ángulo, distancia, radio] de cada voz vista desde el sello: --a y --r la ubican, y al activarse baja por su hilo.
const VOCES = [-1, 1].flatMap((s) =>
  Array.from({ length: 13 }, (_, k) => {
    const t = ((57 + k * 20.5) * Math.PI) / 180;
    const rr = R + VAIVEN[(k + (s > 0 ? 2 : 0)) % 5];
    const x = s * (D - rr * Math.cos(t));
    const y = rr * Math.sin(t);
    return [f((Math.atan2(y, x) * 180) / Math.PI), f(Math.hypot(x, y)), TALLA[(k * 3 + (s > 0 ? 1 : 0)) % 5]] as const;
  }),
);

// Los argumentos: un hilo por voz, de la voz al borde del sello.
const HILOS = VOCES.map(([a, r]) => {
  const c = Math.cos((a * Math.PI) / 180);
  const s = Math.sin((a * Math.PI) / 180);
  return `M${f(c * (r - 2.8))} ${f(s * (r - 2.8))}L${f(c * 13.5)} ${f(s * 13.5)}`;
}).join('');

const v = (o: Record<string, number>) => o as CSSProperties;

/** Koinonía UdeA: la deliberación de dos anillos de voces converge en una decisión sellada y verificable. */
export default function Art(_: ArtProps) {
  return (
    <div className="art art-koinonia-udea" aria-hidden="true">
      <svg viewBox="0 0 160 100">
        <g transform="translate(80 50)">
          <circle className="o" cx={-D} r={R} style={v({ '--s': 1 })} />
          <circle className="o" cx={D} r={R} style={v({ '--s': -1 })} />
          <path className="sp" d={HILOS} />
          <g className="vs">
            {VOCES.map(([a, r, z], i) => (
              <circle key={i} r={z} style={v({ '--a': a, '--r': r })} />
            ))}
          </g>
          <circle className="w" r="11.5" />
          <g className="s">
            <circle className="e" r="11.5" pathLength={60} />
            <circle className="c" r="8.8" />
            <path className="v" pathLength={1} d="M-4.2.2-1.3 3.1 4.4-3.2" />
          </g>
        </g>
      </svg>
    </div>
  );
}
