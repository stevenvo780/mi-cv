import type { CSSProperties } from 'react';

/* Nóesis: el perceptrón multicapa de su laboratorio «Espirales entrelazadas» (2 → 5 → 5 → 4 → 1), en la tinta y los
   colores del sitio. Cada neurona es un cuadrito rojo/azul (su respuesta sobre el plano, como en el laboratorio); los
   pesos son corrientes de partículas, azules si son positivos y rojos si son negativos. La salida es el mapa de
   decisión de las dos espirales, con sus datos. Reposo: un pulso cruza la red capa por capa. Activa: la activación cae
   en cascada y la salida se enciende. Caja de 160 × 100. */

// Pesos con semilla: los mismos en cada render.
let seed = 11;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) * 2 - 1;
const tidy = (d: string) => d.replace(/ -/g, '-');

const X = [16, 42, 68, 94];
const N = [2, 5, 5, 4];
const col = (l: number) => Array.from({ length: N[l] }, (_, j) => 48 + (j - (N[l] - 1) / 2) * 14);

// Capas: el cuadrito (rojo) y la mitad azul de su respuesta, con cortes distintos ([esquina x, esquina y, trazo]).
const CUT: [number, number, string][] = [
  [0, 0, 'h6l-6 6z'],
  [0, 0, 'h6v6z'],
  [6, 0, 'v6h-6z'],
  [0, 0, 'v6h6z'],
  [0, 0, 'h3v6h-3z'],
  [0, 3, 'h6v3h-6z'],
];
const LAYERS = X.map((x, l) => {
  let q = '';
  let h = '';
  for (const y of col(l)) {
    const [cx, cy, cut] = CUT[Math.floor((rnd() + 1) * 3)];
    q += `M${x - 3} ${y - 3}h6v6h-6z`;
    h += `M${x - 3 + cx} ${y - 3 + cy}${cut}`;
  }
  return { q, h };
});

// Pesos: capa b-1 → b (la última va al mapa de salida). Solo se dibujan los de |w| > 0,4.
const EDGES = [1, 2, 3, 4].map((b) => {
  const from = col(b - 1).map((y) => [X[b - 1] + 3, y]);
  const to = b < 4 ? col(b).map((y) => [X[b] - 3, y]) : [[117, 48]];
  const d = ['', ''];
  for (const [x1, y1] of from)
    for (const [x2, y2] of to) {
      const w = rnd();
      if (Math.abs(w) < 0.4) continue;
      const [dx, dy] = [x2 - x1, y2 - y1];
      d[w > 0 ? 0 : 1] += `M${x1} ${y1}c${dx / 2} 0 ${dx / 2} ${dy} ${dx} ${dy}`;
    }
  return d.map(tidy);
});

/* Espirales entrelazadas: dos brazos de semicírculos (centros ±2) que se alternan cada media vuelta; la región azul va
   de un brazo al otro. Los datos siguen la línea media de cada banda. */
const MAP = 'M0 0A2 2 0 0 0 4 0A6 6 0 0 0-8 0A10 10 0 0 0 12 0A14 14 0 0 0-16 0A16 16 0 0 0 16 0A14 14 0 0 1-12 0A10 10 0 0 1 8 0A6 6 0 0 1-4 0A2 2 0 0 1 0 0Z';
const DATA = 'M-2 0A4 4 0 0 0 6 0A8 8 0 0 0-10 0A12 12 0 0 0 14 0M2 0A4 4 0 0 0-6 0A8 8 0 0 0 10 0A12 12 0 0 0-14 0';

// Marcas de registro en las esquinas, como en el sitio (arriba a la izquierda va su ∞): cruz y anillo de un solo arco.
const MARKS = [
  [154, 6],
  [6, 94],
  [154, 94],
]
  .map(([x, y]) => `M${x - 3} ${y}h6M${x} ${y - 3}v6m1.5-3a1.5 1.5 0 1 0 0 .1`)
  .join('');

const t = (v: number) => ({ '--t': v }) as CSSProperties;

export default function Art() {
  return (
    <div className="art art-noesis-lab" aria-hidden="true">
      <svg viewBox="0 0 160 100">
        <path className="mk" d={MARKS} />
        {/* El ∞ de su logo. */}
        <path className="lg" d="M20 8c-2-3-6-3-6 0s4 3 6 0 6-3 6 0-4 3-6 0" />
        {EDGES.map(([p, m], i) => (
          <g key={i} className="b" style={t(2 * i + 1)}>
            <path d={p} />
            <path d={m} />
          </g>
        ))}
        {LAYERS.map(({ q, h }, l) => (
          <g key={l} className="l" style={t(2 * l)}>
            <path d={q} />
            <path d={h} />
          </g>
        ))}
        {/* Salida: el mapa sobre su sombra de papel; el marco pinta el rojo y el azul va encima. */}
        <g className="o" style={t(8)}>
          <path className="os" d="M119.5 34.5h32v32h-32z" />
          <path className="ob" d="M117 32h32v32h-32z" />
          <svg x="118" y="33" width="30" height="30" viewBox="-12 -12 24 24">
            <g className="sp">
              <path className="mb" d={MAP} />
              <path className="d" d={DATA} />
            </g>
          </svg>
        </g>
        {/* Pie de la figura: la capa oculta en una línea. */}
        <text className="f" x="80" y="92">
          ℎ = tanh(𝑊𝑥 + 𝑏)
        </text>
      </svg>
    </div>
  );
}
