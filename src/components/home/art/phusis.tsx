import type { ArtProps } from './types';

/* Phúsis: la regla 30 de Wolfram crece fila a fila desde una sola celda, bajo la línea de código que la produce
   (wolframStep(row, 30), la función que se escribe en su lección «Reglas elementales 30 y 110») y junto a su tabla:
   los ocho vecindarios 111 … 000 con su salida, 00011110 = 30. Las celdas llevan el degradado de ciencia del sitio
   (teal → violeta) sobre la retícula vacía; la columna central, la secuencia pseudoaleatoria de la regla 30, va en
   oro. Reposo: las filas se calculan despacio sobre su propio fantasma. Activa: la cascada se recalcula rápido y se
   enciende. Caja de 48 × 30 (una celda = 1). */

const RULE = 30;
const ROWS = 25;

// Fila siguiente: el vecindario (izquierda, centro, derecha) leído como número 0–7 elige el bit de la regla.
const step = (row: number[]) =>
  row.map((c, j) => (RULE >> (((row[j - 1] ?? 0) << 2) | (c << 1) | (row[j + 1] ?? 0))) & 1);

const CA: number[][] = [Array.from({ length: 2 * ROWS - 1 }, (_, j) => +(j === ROWS - 1))];
while (CA.length < ROWS) CA.push(step(CA[CA.length - 1]));

// Celdas vivas en tramos: «M x y h n» abre la fila y «m hueco 0 h n» sigue en ella; el trazo punteado de la hoja
// parte cada tramo en cuadritos.
function runs(rows: number[][], x0: number): string {
  let d = '';
  rows.forEach((r, i) => {
    let end: number | null = null;
    for (let j = 0; j < r.length; j++) {
      if (!r[j] || r[j - 1]) continue;
      let k = j;
      while (r[k]) k++;
      d += end === null ? `M${x0 + j} ${i + 0.5}` : `m${j - end} 0`;
      d += `h${k - j}`;
      end = k;
    }
  });
  return d;
}

// La tabla de la regla en dos filas de cuatro iconos: el vecindario p = 7 … 0 (tres celdas) y, bajo su centro, la
// salida, el bit p de 30. Cada icono da tres celdas arriba y tres abajo; entre iconos van dos de separación.
type Cells = (p: number) => number[];
const table = (top: Cells, bottom: Cells) =>
  [
    [7, 6, 5, 4],
    [3, 2, 1, 0],
  ].flatMap((ps, i) => [...(i ? [[]] : []), ...[top, bottom].map((f) => ps.flatMap((p) => [...f(p), 0, 0]))]);
const FULL: Cells = () => [1, 1, 1];
const MID: Cells = () => [0, 1, 0];
const NONE: Cells = () => [0, 0, 0];
const ALL = table(FULL, MID);
const IN = table((p) => [(p >> 2) & 1, (p >> 1) & 1, p & 1], NONE);
const OUT = table(NONE, (p) => [0, (RULE >> p) & 1, 0]);

export default function Art(_: ArtProps) {
  return (
    <div className="art art-phusis" aria-hidden="true">
      <svg viewBox="-24 0 48 30">
        <defs>
          <linearGradient id="art-phusis-g" gradientUnits="userSpaceOnUse" x2="0" y2="25">
            <stop offset="0" className="g0" />
            <stop offset=".5" className="g1" />
            <stop offset="1" className="g2" />
          </linearGradient>
          <linearGradient id="art-phusis-s" x2="0" y2="1">
            <stop offset="0" className="s0" />
            <stop offset=".75" className="s1" />
            <stop offset="1" className="s0" />
          </linearGradient>
          <pattern id="art-phusis-p" width="1" height="1" patternUnits="userSpaceOnUse">
            <circle cx=".5" cy=".5" r=".07" />
          </pattern>
          <path id="art-phusis-c" d={runs(CA, -ROWS + 0.5)} />
          <clipPath id="art-phusis-k">
            <rect className="k" x="-25" width="50" height={ROWS} />
          </clipPath>
          <clipPath id="art-phusis-f">
            <rect className="f" x="-25" width="50" height="1" />
          </clipPath>
          <clipPath id="art-phusis-m">
            <rect x="-.5" width="1" height={ROWS} />
          </clipPath>
        </defs>
        <rect className="lat" x="-24" width="48" height="30" />
        <text className="cd" x="-21.4" y="3.2">
          <tspan className="fn">wolframStep</tspan>(<tspan className="ar">row</tspan>, <tspan className="n">30</tspan>)
        </text>
        <rect className="ct" x="-3" y="1.9" width=".14" height="1.7" />
        <g className="rl" transform="translate(8 1) scale(.75)">
          <path className="r0" d={runs(ALL, 0)} />
          <path className="r1" d={runs(IN, 0)} />
          <path className="r2" d={runs(OUT, 0)} />
        </g>
        <g transform="translate(0 5)">
          <rect className="sc" x="-25" y="-3" width="50" height="4.6" />
          <use href="#art-phusis-c" className="gh" />
          <g className="on">
            <use href="#art-phusis-c" />
            <use href="#art-phusis-c" className="md" />
          </g>
          <use href="#art-phusis-c" className="fr" />
        </g>
      </svg>
    </div>
  );
}
