import type { CSSProperties } from 'react';

// Deméter: la espiga suelta sus granos por el tallo, y el tallo se vuelve la ruta (paradas en orden de entrega, el
// camión) que sube hasta la tirilla con el sello DIAN. Coordenadas en cqh: la caja 16:10 mide 160 × 100 (el viewBox).

const v = (o: Record<string, number | string>) => o as CSSProperties;
// Granos por el tallo: desfase (s) en el ciclo de reposo; sin movimiento, fija su lugar en la ruta.
const FLUJO = [0, 1.2, 2.1, 3.4, 4.3, 5.6, 6.3];
// Paradas a 20, 50 y 80 % de la ruta: [x, y, desfase (s) del salto en el ciclo activo de 4 s: sube cuando llega la
// cabina y baja cuando la cola ya pasó]. La escena baja 5 unidades (viewBox) para asentarse en la caja.
const PARADAS = [
  [51.7, 77.6, 1.52],
  [76.2, 65.8, 2.81],
  [102, 57.1, 0.08],
];

export default function Art() {
  return (
    <div className="art art-demeter" aria-hidden="true">
      {/* Las paradas van antes del SVG: el camión pasa por delante de ellas. */}
      {PARADAS.map(([x, y, t], i) => (
        <b key={i} className="pn" style={v({ left: `${x}cqh`, top: `${y}cqh`, '--dl': `${t}s` })}>
          {i + 1}
        </b>
      ))}
      <svg viewBox="0 -5 160 100" width="100%" height="100%">
        <linearGradient id="art-demeter-t" x1="22" x2="56" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#f0c46a" />
          <stop offset="1" stopColor="#22c55e" />
        </linearGradient>
        <path fill="#16a34a" stroke="#4ade80" strokeWidth=".3" d="M22 67c-7-1-13-7-15.5-15.5 7 2 12.5 7.5 15.5 15.5Zm0-4c6-2 11-7 15-15-8 2-13 7-15 15Z" />
        <g fill="none" stroke="url(#art-demeter-t)" strokeLinecap="round">
          <path strokeWidth="3.6" opacity=".22" d="M22 58v6q0 12 12 12c28 0 40-24 86-26" />
          <path d="M22 58v6q0 12 12 12c28 0 40-24 86-26" />
        </g>
        <g fill="#ffe39a" stroke="#f0c46a55" strokeWidth="1.2">
          {FLUJO.map((d, i) => (
            <ellipse key={i} className="gr" rx="1.6" ry=".9" style={v({ '--d': d })} />
          ))}
        </g>
        {/* El camión: estacionado (en el 65 % de la ruta) y, al activar, su copia en marcha (la anima el CSS). */}
        <defs>
          <g id="art-demeter-k" fill="#06140c" stroke="#4ade80" strokeWidth=".6" strokeLinejoin="round">
            <rect x="-8.5" y="-9.4" width="10.8" height="7.6" rx="1" fill="#16a34a" />
            <path d="M2.3-7.4H6l2.8 3v2.5H2.3z" />
            <circle cx="-4.8" cy="-1.6" r="1.6" />
            <circle cx="5.3" cy="-1.6" r="1.6" />
            <ellipse cx="-3.1" cy="-5.6" rx="1.1" ry="2" fill="#f0c46a" stroke="none" />
          </g>
        </defs>
        <use href="#art-demeter-k" className="tk" transform="translate(88.8 55.6) rotate(-18.8)" />
        <use href="#art-demeter-k" className="td" />
      </svg>
      <div className="ea">
        {Array.from({ length: 11 }, (_, i) => (
          <i key={i} style={v({ '--i': i, '--s': i > 9 ? 0 : i % 2 ? 1 : -1 })} />
        ))}
      </div>
      <div className="tl">
        {Array.from({ length: 5 }, (_, i) => (
          <i key={i} style={v({ '--i': i })} />
        ))}
        <b style={v({ '--i': 5 })} />
      </div>
      <b className="st">DIAN</b>
    </div>
  );
}
