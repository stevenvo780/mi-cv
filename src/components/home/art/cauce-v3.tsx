import type { CSSProperties } from 'react';

// Cauce V3: el director (el núcleo del bus, con su anillo de orquestación) despacha a la flota que fluye por el cauce.
// Coordenadas en cqh: la caja es 16:10, así que mide 160 × 100 (lo mismo que el viewBox). Z = 14: los agentes del
// inventario canónico, como en el átomo de cauce.humanizar.tech.

// [x, y] en reposo (tres carriles: Claude Code, Codex, OpenClaw) → [X, Y] en la formación ›› al despachar;
// t = fracción del ciclo en que el agente recibe la entrega (traspaso por los brazos hasta el fan-in en la punta).
const FLOTA: [number, number, number, number, number][] = [
  [64, 48.8, 111, 39.5, 0.5],
  [82, 46.5, 118, 29, 0.26],
  [101, 41.7, 125, 34.25, 0.38],
  [120, 36.6, 132, 39.5, 0.5],
  [140, 31.8, 139, 44.75, 0.62],
  [72, 54, 118, 44.75, 0.62],
  [92, 52.6, 118, 55.25, 0.62],
  [112, 50.2, 125, 50, 0.74],
  [133, 47.6, 146, 50, 0.74],
  [60, 57.4, 111, 60.5, 0.5],
  [78, 60.4, 118, 71, 0.26],
  [97, 61.3, 125, 65.75, 0.38],
  [116, 61.6, 132, 60.5, 0.5],
  [137, 62.3, 139, 55.25, 0.62],
];

// Contratos que saltan de agente en agente por cada brazo: [x, y, giro, visible]; los del brazo corto salen a mitad.
const SALTOS: [number, number, number, number][] = [
  [118, 29, 36.87, 1],
  [118, 71, -36.87, 1],
  [97, 29, 36.87, 0],
  [97, 71, -36.87, 0],
];

const css = (o: Record<string, number | string>) => o as CSSProperties;
const ORBITA = { cx: 32, cy: 50, rx: 24, ry: 7.2 };

export default function Art() {
  return (
    <div className="art art-cauce-v3" aria-hidden="true">
      <svg viewBox="0 0 160 100">
        <defs>
          <linearGradient id="art-cauce-v3-g" x1="36" x2="160" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#35e3f0" stopOpacity=".04" />
            <stop offset=".4" stopColor="#5b82ff" stopOpacity=".3" />
            <stop offset="1" stopColor="#8b6cff" stopOpacity=".1" />
          </linearGradient>
        </defs>
        <path fill="url(#art-cauce-v3-g)" opacity=".8" d="M38 45.5C58 45 66 43 80 39S134 18 166 9V85C134 74 98 70 80 67S54 58 38 54.5Z" />
        <path stroke="#9db6ff" strokeOpacity=".33" strokeWidth=".4" d="M38 45.5C58 45 66 43 80 39S134 18 166 9M38 54.5C54 58 62 64 80 67S134 74 166 85" />
        <path
          className="cu"
          stroke="#35e3f0"
          strokeOpacity=".45"
          strokeWidth=".5"
          strokeLinecap="round"
          strokeDasharray=".1 2.4 1.5 3 .1 4.9"
          d="M44 46.8C62 47 74 45 92 40.3S136 26 160 20.5M48 49C62 50 76 49.4 92 46.5S140 36 160 34M41 50.3C60 53 76 54 92 52.6S140 47 160 47M46 53C60 56 76 58.5 92 58.8S140 58 160 60M43 54.1C60 59 76 63 92 64.9S140 69 160 73.5"
        />
        <circle cx="32" cy="50" r="25.8" stroke="#9db6ff" strokeOpacity=".45" strokeWidth="1.7" strokeDasharray=".35 3.03" />
        <g className="ob" stroke="#9db6ff" strokeOpacity=".55" strokeWidth=".45" strokeDasharray="0 1.15" strokeLinecap="round">
          <ellipse {...ORBITA} />
          <ellipse {...ORBITA} transform="rotate(60 32 50)" />
          <ellipse {...ORBITA} transform="rotate(-60 32 50)" />
        </g>
      </svg>
      <b className="sw" />
      <b className="pg" />
      <b className="co" />
      <div className="f">
        {FLOTA.map(([x, y, X, Y, t], i) => (
          <i key={i} style={css({ '--x': x, '--y': y, '--X': X, '--Y': Y, '--t': t })} />
        ))}
      </div>
      <b className="bm" style={css({ '--r': '-13.7deg' })} />
      <b className="bm" style={css({ '--r': '13.7deg' })} />
      {SALTOS.map(([x, y, r, v], i) => (
        <b key={i} className="pk" style={css({ '--x': x, '--y': y, '--r': `${r}deg`, '--v': v })} />
      ))}
      <b className="dp" />
      <span className="z">Z = 14</span>
      <span className="ok">done</span>
    </div>
  );
}
