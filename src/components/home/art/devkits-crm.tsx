import type { CSSProperties } from 'react';

/* Etapas abiertas del pipeline de negocios de Xenía, con la probabilidad y el color que les da la app
   (Prospección, Calificación, Propuesta, Negociación, Cierre). s: franja; e: borde tenue. n: tarjetas de la
   columna, un embudo. t: momento del ciclo activo en que el negocio viajero cruza la columna (la enciende). */
const ETAPAS = [
  { p: 10, n: 4, s: '#6c8388', e: '#9db0b53d', t: 0.64 },
  { p: 25, n: 3, s: '#2a7a6e', e: '#2a7a6e80', t: 0.74 },
  { p: 50, n: 3, s: '#43b5a6', e: '#43b5a666', t: 0.84 },
  { p: 70, n: 2, s: '#b98535', e: '#9a671299', t: 0.07 },
  { p: 90, n: 1, s: '#e0a85e', e: '#e0a85e73', t: 0.14 },
];

const css = (o: Record<string, string | number>) => o as CSSProperties;

/** Xenía: el pipeline kanban lleva un negocio de columna en columna hasta la puerta abierta de la casa (ganado ✓). */
export default function Art() {
  return (
    <div className="art art-devkits-crm" aria-hidden="true">
      {ETAPAS.map((e, i) => (
        <div key={e.p} className="xc" style={css({ '--i': i, '--p': e.p, '--s': e.s, '--e': e.e, '--t': e.t })}>
          <b>{e.p}%</b>
          {Array.from({ length: e.n }, (_, j) => (
            <i key={j} style={css({ '--j': j })} />
          ))}
        </div>
      ))}
      {/* La puerta de la casa, con su hoja abierta hacia dentro. */}
      <div className="xr">
        <span />
      </div>
      {/* Clave del arco: el isotipo de Xenía (cuatro anillos y un núcleo violeta), con las medidas de su icon.svg. */}
      <svg className="xs" viewBox="0 0 100 100" fill="none" stroke="#43b5a6" strokeWidth="4">
        <circle cx="50.6" cy="68" r="20" />
        <circle cx="32" cy="50.6" r="20" />
        <circle cx="49.4" cy="32" r="20" />
        <circle cx="68" cy="49.4" r="20" />
        <circle cx="50" cy="50" r="6" fill="#8d7cc0" stroke="none" />
      </svg>
      <div className="xp" />
      <div className="xd" />
      <div className="xo">
        <svg viewBox="0 0 24 24">
          <path d="m6 12.5 4 4 8-9" fill="none" stroke="#0b1417" strokeWidth="3.4" />
        </svg>
      </div>
    </div>
  );
}
