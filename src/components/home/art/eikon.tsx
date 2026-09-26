import type { CSSProperties } from 'react';

// Eikón: un isotipo que se genera con primitivas (anillo, órbitas, núcleo, triángulo) sobre su lienzo de construcción.
// En reposo es el átomo de eikon.humanizar.cloud; activo, regenera en orden las marcas que Eikón fabrica para el
// ecosistema (Mouseion, Pinakothḗke, Prizma, con las semillas de su web) y la paleta se reordena con el primario de
// cada una. Geometría de sus SVG (viewBox 200, radio 82 → 27). Contraste WCAG real de cada primario sobre #0b1417.

const SEMILLAS: [string, string][] = [
  ['EIKON', '#43b5a6'],
  ['MOUSEION', '#43b5a6'],
  ['PINAKOTHEKE', '#e0a85e'],
  ['PRIZMA', '#8d7cc0'],
];
const RATIOS = ['7.45:1', '7.45:1', '8.82:1', '5.13:1'];
// Color y casilla (0–4) en cada fase (eikon, mouseion, pinakotheke, prizma): el primario va primero.
const PALETA: [string, number, number, number, number][] = [
  ['#43b5a6', 0, 0, 3, 3],
  ['#e0a85e', 1, 3, 0, 4],
  ['#8d7cc0', 2, 4, 4, 0],
  ['#d1d5db', 3, 2, 2, 2],
  ['#0b1417', 4, 1, 1, 1],
];

const v = (o: Record<string, number | string>) => o as CSSProperties;
// Paso de 10,5 unidades entre casillas de la paleta.
const casillas = (...f: number[]) => v(Object.fromEntries(f.map((n, i) => [`--${'abcd'[i]}`, `${n * 10.5}px`])));
// La fase 0 no necesita --i (vale 0 por defecto en la hoja).
const fase = (i: number) => (i ? v({ '--i': i }) : undefined);

export default function Art() {
  return (
    <div className="art art-eikon" aria-hidden="true">
      <svg viewBox="0 0 160 100">
        <g transform="translate(80 46)">
          <path className="cx" d="M-80 0h160M0-46v92" />
          <circle className="pl" r="31" />
          <circle className="gu" r="36" />
          <g className="bx">
            <path d="M-33-33h66v66h-66z" />
            <path className="hd" d="M-34.5-34.5h3v3h-3zm66 0h3v3h-3zm0 66h3v3h-3zm-66 0h3v3h-3z" />
          </g>
          <g className="m">
            <circle className="r" r="27" pathLength={1} />
            <g className="ea">
              <ellipse rx="27" ry="9.88" />
              <g className="ox">
                <circle className="d" r="2" />
              </g>
            </g>
            <ellipse className="eb" rx="27" ry="9.88" />
            <circle className="c" r="13.8" />
            <circle className="h" r="6.6" />
            <polygon className="p" points="0,-25.7 26.3,23 -26.3,23" pathLength={1} />
            <polygon className="q" points="0,-7.2 14.5,17.1 -14.5,17.1" />
          </g>
        </g>
        <text x="9" y="10">
          SEED ·
        </text>
        <g transform="translate(30 10)">
          {SEMILLAS.map(([s, c], i) => (
            <text key={s} className="n" fill={c} style={fase(i)}>
              {s}
            </text>
          ))}
        </g>
        <circle cx="140" cy="8.6" r="1.3" fill="#43b5a6" />
        <circle cx="145" cy="8.6" r="1.3" fill="#e0a85e" />
        <circle cx="150" cy="8.6" r="1.3" fill="#8d7cc0" />
        <g transform="translate(35 84)">
          {PALETA.map(([c, a, b, cc, d]) => (
            <rect key={c} className="sw" fill={c} style={casillas(a, b, cc, d)} />
          ))}
          <rect className="pr" x="-1.2" y="-1.2" width="11.4" height="8.9" rx="2.2" />
        </g>
        <rect className="bd" x="91" y="84" width="14.6" height="6.5" rx="3.25" />
        <path className="ck" d="M93 87.3l1.2 1.2 2.3-2.5" />
        <text className="aa" x="97.5" y="88.7">
          AA
        </text>
        <g transform="translate(108.6 88.7)">
          {RATIOS.map((r, i) => (
            <text key={i} className="n" style={fase(i)}>
              {r}
            </text>
          ))}
        </g>
      </svg>
    </div>
  );
}
