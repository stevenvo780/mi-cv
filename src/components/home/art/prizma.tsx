import type { CSSProperties } from 'react';
import type { ArtProps } from './types';

/* Prizma: el haz blanco (lo que entra al negocio: un pedido, un pago) cruza el prisma de cristal —Nous, el hub de
   eventos— y se abre en el espectro de la marca; cada rayo llega a un módulo. Orden físico del espectro: el rojo se
   desvía menos y va arriba. Caja 160 × 100; E y X son la entrada y la salida del haz en el prisma. */
const E = [46.6, 50];
const X = [73.4, 50];
const B = [0, 61];
const deg = 180 / Math.PI;
const r1 = (n: number) => Math.round(n * 10) / 10;

/* Color del sitio de cada módulo e icono en rejilla de 24 (el CSS lo escala a la baldosa). */
const MOD: [string, string][] = [
  // Talaria: reparto de última milla
  ['#ff5a2b', 'M1.5 5.5h12V16h-12zM13.5 9H18l3.5 3.5V16h-8M3.5 18a2 2 0 1 0 4 0 2 2 0 1 0-4 0M15 18a2 2 0 1 0 4 0 2 2 0 1 0-4 0'],
  // Pistis: tarjeta de crédito
  ['#e0a85e', 'M4 5h16q2 0 2 2v10q0 2-2 2H4q-2 0-2-2V7q0-2 2-2zM2 10h20M6 15h4'],
  // Hermes: carrito del comercio por WhatsApp
  ['#22a45a', 'M2 3h3l2.6 11.5h10.6L20.5 7H6M8.5 19.5a1.5 1.5 0 0 0 3 0 1.5 1.5 0 0 0-3 0M16 19.5a1.5 1.5 0 0 0 3 0 1.5 1.5 0 0 0-3 0'],
  // Iris: megáfono (difusión masiva)
  ['#2dcbd1', 'M3 9.5v5h3.5l7.5 4.5V5l-7.5 4.5zM6.5 14.5l1.5 5h2.5M17.5 9a4 4 0 0 1 0 6M20 6.5a7.5 7.5 0 0 1 0 11'],
  // Talanton: tiquete del POS con factura DIAN
  ['#67e2e6', 'M5 2h14v20l-2.3-1.5-2.4 1.5-2.3-1.5-2.3 1.5-2.4-1.5L5 22zM9 7h6M9 11h6M9 15h3.5'],
  // CRM: cliente
  ['#8b7cf6', 'M8 7.5a4 4 0 0 0 8 0 4 4 0 0 0-8 0M4 21c0-4.5 3.6-7 8-7s8 2.5 8 7'],
];

/* Módulos en un arco alrededor de la salida del prisma: cada rayo gira hacia su nodo y la baldosa se endereza. */
const RAYS = MOD.map(([c, d], i) => {
  const t = (-52 + 20.8 * i) / deg;
  const [dx, dy] = [66 * Math.cos(t), 50 * Math.sin(t)];
  const a = r1(Math.atan2(dy, dx) * deg);
  const l = r1(Math.hypot(dx, dy));
  return { c, d, a, l: r1(l - 5), n: `translate(${l}) rotate(${-a})` };
});
const BEAM = { a: r1(Math.atan2(E[1] - B[1], E[0] - B[0]) * deg), l: r1(Math.hypot(E[0] - B[0], E[1] - B[1])) };

const v = (o: Record<string, string | number>) => o as CSSProperties;

export default function Art(_: ArtProps) {
  return (
    <div className="art art-prizma" aria-hidden="true">
      <svg viewBox="0 0 160 100">
        <defs>
          <radialGradient id="art-prizma-g" cx=".46" r=".42">
            <stop offset="0" />
            <stop offset=".7" stopColor="#fff" />
          </radialGradient>
          <mask id="art-prizma-m">
            <rect />
          </mask>
        </defs>
        <g className="h" transform={`translate(${B}) rotate(${BEAM.a})`} style={v({ '--l': BEAM.l })}>
          <line className="w" x2={BEAM.l} />
          <line x2={BEAM.l} />
          <circle className="p" />
        </g>
        <path className="in" d={`M${E}L${X[0]} 48.4V51.6Z`} />
        <g mask="url(#art-prizma-m)">
          {RAYS.map((r, i) => (
            <g key={i} className="r" transform={`translate(${X}) rotate(${r.a})`} style={v({ '--c': r.c, '--l': r.l, '--i': i })}>
              <line className="w" x2={r.l} />
              <line x2={r.l} />
              <circle className="p" />
              <g className="n" transform={r.n}>
                <rect />
                <path d={r.d} />
              </g>
            </g>
          ))}
        </g>
      </svg>
      {/* Prisma de cristal: tapa trasera, tres caras (base, izquierda, derecha) y tapa delantera. */}
      <div className="pz">
        <div className="q">
          <i />
          <i />
          <i />
          <i />
          <i />
        </div>
      </div>
    </div>
  );
}
