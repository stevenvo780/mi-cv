import type { CSSProperties } from 'react';
import type { ArtProps } from './types';

// Órganon: un argumento en lenguaje natural se formaliza dentro del instrumento (la roseta de cuatro círculos del
// isotipo del sitio, con su dial). Arriba, el texto: los átomos subrayados en verde azulado, los marcadores
// discursivos («Si», «Luego») en oro. Abajo, su fórmula y el veredicto de ST. Reposo: el cursor late y autologic
// relee el texto. Activa: cada palabra vuela a su símbolo, la fórmula se enciende y el veredicto se ilumina.
// En el SVG, px = unidades del viewBox (0 0 160 100): todo escala con la caja.
const v = (o: Record<string, number | string>) => o as CSSProperties;

type Tok = string | ['at' | 'mk', string];
interface Texto {
  l: [Tok[], Tok[]];
  // Subrayado de cada átomo o marcador, en orden de lectura: [x1, x2, renglón]. Medidos con Cormorant 500 a 8.
  u: [number, number, number][];
  fin: number;
  // Veredicto: palabra, x y ancho de la placa, x de la marca ✓ (trazada: ninguna letra del arte la trae).
  ok: [string, number, number, number];
}

// Frases comprobadas en el playground (organon.stevenvallejo.com): autologic detecta modus_ponens y ST responde
// DERIVABLE / VÁLIDO (LLUEVE -> CALLE_MOJA, LLUEVE ⊢ CALLE_MOJA).
const TXT: Record<ArtProps['locale'], Texto> = {
  es: {
    l: [
      [['mk', 'Si'], ' ', ['at', 'llueve'], ', ', ['at', 'la calle se moja'], '.'],
      [['at', 'Llueve'], '. ', ['mk', 'Luego'], ', ', ['at', 'la calle se moja'], '.'],
    ],
    u: [
      [41, 47.1, 0],
      [49, 67.2, 0],
      [70.8, 117.4, 0],
      [32.7, 53.1, 1],
      [56.6, 75.5, 1],
      [79.1, 125.7, 1],
    ],
    fin: 127.3,
    ok: ['VÁLIDO', 61, 38.2, 66.5],
  },
  en: {
    l: [
      [['mk', 'If'], ' ', ['at', 'it rains'], ', ', ['at', 'the street gets wet'], '.'],
      [['at', 'It rains'], '. ', ['mk', 'So'], ', ', ['at', 'the street gets wet'], '.'],
    ],
    u: [
      [34.6, 39.7, 0],
      [41.6, 63.5, 0],
      [67.2, 123.8, 0],
      [32.2, 54.6, 1],
      [58.1, 65.9, 1],
      [69.6, 126.2, 1],
    ],
    fin: 127.8,
    ok: ['VALID', 62.7, 34.6, 68.2],
  },
};

// Clase de cada subrayado (mismo orden en los dos idiomas): marcador u átomo.
const K = ['mk', 'at', 'at', 'at', 'mk', 'at'];
const RY = [20, 32]; // renglones del texto
const FY = 68; // renglón de la fórmula
// 𝑝 → 𝑞, 𝑝 ⊢ 𝑞 glifo a glifo: [símbolo, centro x, subrayado del que nace (−1: ninguno)].
const FORMULA: [string, number, number][] = [
  ['𝑝', 39.9, 1],
  ['→', 57, 0],
  ['𝑞', 73.5, 2],
  [',', 79.9, -1],
  ['𝑝', 91.1, 3],
  ['⊢', 106.3, 4],
  ['𝑞', 120.8, 5],
];

export default function Art({ locale }: ArtProps) {
  const t = TXT[locale];
  const ok = t.ok;
  return (
    <svg className="art art-nlp-to-logic" viewBox="0 0 160 100" aria-hidden="true">
      <defs>
        <radialGradient id="art-nlp-to-logic-h">
          <stop offset="0" stopColor="#43b5a6" stopOpacity=".2" />
          <stop offset="1" stopColor="#43b5a6" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="art-nlp-to-logic-c">
          <stop offset="0" stopColor="#b69ae6" stopOpacity=".55" />
          <stop offset="1" stopColor="#b69ae6" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle className="halo" cx="80" cy="64" r="36" />
      <g className="ins">
        <circle className="dial" cx="80" cy="64" r="26.5" />
        <circle className="rum" cx="80" cy="64" r="26.5" />
        <g className="ros">
          <circle cx="80" cy="49.6" r="16" />
          <circle cx="65.6" cy="64" r="16" />
          <circle cx="94.4" cy="64" r="16" />
          <circle cx="80" cy="78.4" r="16" />
        </g>
        <circle className="core" cx="80" cy="64" r="7.5" />
      </g>
      <g className="nl">
        {t.l.map((toks, r) => (
          <text key={r} x="80" y={RY[r]}>
            {toks.map((x, j) =>
              typeof x === 'string' ? (
                x
              ) : (
                <tspan key={j} className={x[0]}>
                  {x[1]}
                </tspan>
              ),
            )}
          </text>
        ))}
        {t.u.map(([a, b, r], i) => (
          <path key={i} className={`u ${K[i]}`} d={`M${a} ${RY[r] + 2.5}H${b}`} style={v({ '--i': i })} />
        ))}
        <rect className="car" x={t.fin + 1} y={RY[1] - 6.3} width=".75" height="8" />
      </g>
      <g className="fm">
        {FORMULA.map(([s, x, src], i) => {
          const u = src < 0 ? undefined : t.u[src];
          const o = u ? { '--dx': `${((u[0] + u[1]) / 2 - x).toFixed(1)}px`, '--dy': `${RY[u[2]] - FY}px`, '--i': src } : { '--dx': 0, '--dy': '-4px', '--i': 6 };
          return (
            <text key={i} className={`g ${K[src] ?? 'pn'}`} x={x} y={FY} style={v(o)}>
              {s}
            </text>
          );
        })}
      </g>
      <g className="vd">
        <rect className="vp" x={ok[1]} y="80" width={ok[2]} height="11" rx="2.4" />
        <rect x={ok[1]} y="80" width={ok[2]} height="11" rx="2.4" />
        <path className="ck" d={`M${ok[3]} 85.4l1.6 1.7 3.1-3.9`} />
        <text x={ok[3] + 6.8} y="87.4">
          {ok[0]}
        </text>
      </g>
    </svg>
  );
}
