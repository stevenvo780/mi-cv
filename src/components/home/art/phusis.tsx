
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

// Celdas vivas en tramos: «M x y h n» abre la primera fila, «m dx dy h n» salta a la siguiente y «m hueco 0 h n» sigue
// en ella (todo relativo, sin ceros a la izquierda); el trazo punteado de la hoja parte cada tramo en cuadritos.
const num = (n: number) => String(n).replace(/^(-?)0\./, '$1.');
function runs(rows: number[][], x0: number, y0: number): string {
  let d = '';
  let x = 0;
  let y = 0;
  rows.forEach((r, i) => {
    for (let j = 0; j < r.length; j++) {
      if (!r[j] || r[j - 1]) continue;
      let k = j;
      while (r[k]) k++;
      d += d ? `m${num(x0 + j - x)} ${num(i + 0.5 - y)}` : `M${num(x0 + j)} ${num(y0 + i + 0.5)}`;
      d += `h${k - j}`;
      x = x0 + k;
      y = i + 0.5;
    }
  });
  return d;
}

// La columna central (la secuencia de la regla 30), en tramos verticales: «m0 hueco v n».
let MID = '';
for (let i = 0, y = 0; i < ROWS; i++) {
  if (!CA[i][ROWS - 1] || CA[i - 1]?.[ROWS - 1]) continue;
  let k = i;
  while (CA[k]?.[ROWS - 1]) k++;
  MID += `${MID ? 'm0 ' + (i - y) : 'M0 ' + (i + 5)}v${k - i}`;
  y = k;
}

// La tabla de la regla en dos filas de cuatro iconos: el vecindario p = 7 … 0 (tres celdas) y, bajo su centro, la
// salida, el bit p de 30. Cada icono da tres celdas arriba y tres abajo; entre iconos van dos de separación. Las
// celdas apagadas son el patrón art-phusis-p (un icono vacío cada 5 × 3) bajo las encendidas.
type Cells = (p: number) => number[];
const table = (top: Cells, bottom: Cells) =>
  [
    [7, 6, 5, 4],
    [3, 2, 1, 0],
  ].flatMap((ps, i) => [...(i ? [[]] : []), ...[top, bottom].map((f) => ps.flatMap((p) => [...f(p), 0, 0]))]);
const NONE: Cells = () => [0, 0, 0];
const IN = table((p) => [(p >> 2) & 1, (p >> 1) & 1, p & 1], NONE);
const OUT = table(NONE, (p) => [0, (RULE >> p) & 1, 0]);

export default function Art() {
  return (
    <div className="art art-phusis" aria-hidden="true">
      <svg viewBox="-24 0 48 30">
        <defs>
          <linearGradient id="art-phusis-g" x2="0" y2="1">
            <stop className="g0" />
            <stop offset=".5" className="g1" />
            <stop offset="1" className="g2" />
          </linearGradient>
          <linearGradient id="art-phusis-s" x2="0" y2="1">
            <stop className="s0" />
            <stop offset=".75" className="s1" />
            <stop offset="1" className="s0" />
          </linearGradient>
          {/* Icono apagado de la tabla: solo el borde de sus cuatro celdas, como en los de Wolfram. */}
          <pattern id="art-phusis-p" x="3.5" y="1.2" width="5" height="3" patternUnits="userSpaceOnUse">
            <path d="M.15 .15h.7v.7h-.7zm1 0h.7v.7h-.7zm1 0h.7v.7h-.7zm-1 1h.7v.7h-.7z" />
          </pattern>
          <path id="art-phusis-c" d={runs(CA, -ROWS + 0.5, 5)} />
          <clipPath id="art-phusis-k">
            <rect className="k" x="-25" y="5" width="50" height={ROWS} />
          </clipPath>
          <clipPath id="art-phusis-f">
            <rect className="f" x="-25" y="5" width="50" height="1" />
          </clipPath>
        </defs>
        <text className="cd" x="-21.4" y="3.2">
          <tspan className="fn">wolframStep</tspan>(<tspan className="ar">row</tspan>, <tspan className="n">30</tspan>)
          <tspan className="ct">|</tspan>
        </text>
        <rect className="r0" x="3.5" y="1.2" width="18" height="5" />
        <path className="r1" d={runs(IN, 3.5, 1.2)} />
        <use href="#art-phusis-c" className="gh" />
        {/* Lo que se funde al soltar: las salidas de la tabla, la banda, la cascada y su frente. */}
        <g className="w">
          <path className="r2" d={runs(OUT, 3.5, 1.2)} />
          <rect className="sc" x="-25" y="2" width="50" height="4.6" />
          <g className="on">
            <use href="#art-phusis-c" />
            <path className="md" d={MID} />
          </g>
          <use href="#art-phusis-c" className="fr" />
        </g>
      </svg>
    </div>
  );
}
