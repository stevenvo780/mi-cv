import type { CSSProperties } from 'react';

// Cauce V3: el director (el núcleo del bus, con su anillo de orquestación) despacha a la flota que fluye por el cauce.
// Coordenadas en cqh: la caja es 16:10, así que mide 160 × 100 (lo mismo que el viewBox). Z = 14: los agentes del
// inventario canónico, como en el átomo de cauce.humanizar.tech.

// [x, y] en reposo (tres carriles paralelos por el cauce; los colores de los tres harness, mezclados en cada uno) →
// [X, Y] en la formación ›› al despachar (una punta afilada: brazos de paso 8 × 5, a 32°); t = fracción del ciclo en
// que el agente recibe la entrega (traspaso por los brazos hasta el fan-in en la punta).
const FLOTA: [number, number, number, number, number][] = [
  [68, 41, 98, 40, 0.5],
  [88, 40, 114, 30, 0.26],
  [108, 39, 122, 35, 0.38],
  [128, 38, 130, 40, 0.5],
  [148, 36, 138, 45, 0.62],
  [78, 50, 106, 45, 0.62],
  [98, 50, 106, 55, 0.62],
  [118, 50, 114, 50, 0.74],
  [138, 50, 146, 50, 0.74],
  [72, 60, 98, 60, 0.5],
  [92, 60, 114, 70, 0.26],
  [112, 61, 122, 65, 0.38],
  [132, 62, 130, 60, 0.5],
  [152, 65, 138, 55, 0.62],
];

// Contratos que saltan de agente en agente por cada brazo: [x, y, giro, visible]; los del brazo corto salen a mitad.
const SALTOS: [number, number, number, number][] = [
  [114, 30, 32, 1],
  [114, 70, -32, 1],
  [82, 30, 32, 0],
  [82, 70, -32, 0],
];

const css = (o: Record<string, number | string>) => o as CSSProperties;
const ORBITA = { cx: 32, cy: 50, rx: 24, ry: 7.2 };
// Orillas del cauce: se abren desde el director, corren casi paralelas y se ensanchan en la boca.
const ORILLAS = 'M38 45.5C56 45 58 31 78 31S112 28 126 27S152 18 166 6';

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
        <path fill="url(#art-cauce-v3-g)" opacity=".8" d={`${ORILLAS}V94C152 82 140 74 126 73S98 69 78 69S56 55 38 54.5Z`} />
        <path stroke="#9db6ff" strokeOpacity=".33" strokeWidth=".4" d={`${ORILLAS}M38 54.5C56 55 58 69 78 69S112 72 126 73S152 82 166 94`} />
        <path
          className="cu"
          stroke="#35e3f0"
          strokeOpacity=".45"
          strokeWidth=".5"
          strokeLinecap="round"
          strokeDasharray=".1 2.4 1.5 3 .1 4.9"
          d="M38 47C56 46.5 58 36.5 78 36.5S112 34 126 33.5S152 27 166 18.5M38 48.5C56 48 58 43 78 43S112 42 126 41.5S152 38.5 166 34M38 51.5C56 52 58 57 78 57S112 58 126 58.5S152 61.5 166 66M38 53C56 53.5 58 63.5 78 63.5S112 66 126 66.5S152 73 166 81.5M38 50H160"
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
      <b className="bm" style={css({ '--r': '-12.8deg' })} />
      <b className="bm" style={css({ '--r': '12.8deg' })} />
      {SALTOS.map(([x, y, r, v], i) => (
        <b key={i} className="pk" style={css({ '--x': x, '--y': y, '--r': `${r}deg`, '--v': v })} />
      ))}
      <b className="dp" />
      <span className="z">Z = 14</span>
      <span className="ok">done</span>
    </div>
  );
}
