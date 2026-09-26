import type { CSSProperties } from 'react';

/* Graf: plano nocturno de una ciudad en vista inclinada. Del despacho salen rutas por las calles; aparece el pin del
   pedido en la puerta, el domiciliario recorre la última milla y cae un ✓ donde estaba el pin.
   Suelo en coordenadas (u, v): manzanas de 20 × 14; P() las proyecta al plano inclinado de la caja (160 × 100). */
const TH = (28 * Math.PI) / 180;
const [C, S, K] = [Math.cos(TH), Math.sin(TH), 0.56];
const P = (u: number, v: number) => [Math.round(80 + u * C - v * S), Math.round(52 + K * (u * S + v * C))];

const HUB = [-20, 14];
/* Rutas del despacho a la puerta: la primera es la del reposo; las demás salen al activar. En la pose fija, p es el
   avance del domiciliario (0: pedido recién hecho, 1: entregado). */
const ORDERS = [
  { r: [HUB, [-20, -14], [40, -14], [40, -35]], p: 0.7, d: 0 },
  { r: [HUB, [20, 14], [20, 28], [70, 28]], p: 1, d: 0 },
  { r: [HUB, [-40, 14], [-40, -42], [-30, -42]], p: 0.4, d: 0.3 },
  { r: [HUB, [-60, 14], [-60, -7]], p: 0, d: 0.6 },
].map(({ r, p, d }) => {
  const pts = r.map(([u, v]) => P(u, v));
  const l = pts.slice(1).reduce((s, [x, y], i) => s + Math.hypot(x - pts[i][0], y - pts[i][1]), 0);
  // l: largo en pantalla, para que la luz y el domiciliario avancen juntos por la ruta.
  const v: Record<`--${string}`, string | number> = { '--p': p, '--l': Math.round(l) };
  if (d) v['--d'] = `${d}s`;
  return { d: 'M' + pts.map((q) => q.join(' ')).join('L'), end: pts[pts.length - 1], style: v as CSSProperties };
});

export default function Art() {
  const [hx, hy] = P(HUB[0], HUB[1]);
  return (
    <div className="art art-graf" aria-hidden="true">
      <svg viewBox="0 0 160 100">
        <defs>
          <pattern id="art-graf-b" width="20" height="14" patternUnits="userSpaceOnUse">
            <rect x="2" y="2" width="16" height="10" rx=".8" />
          </pattern>
          {/* Cada 3 × 3 manzanas: un parque, callejones y ventanas encendidas. */}
          <pattern id="art-graf-w" width="60" height="42" patternUnits="userSpaceOnUse">
            <rect x="22" y="16" width="16" height="10" />
            <path className="y" d="M10 2v10M42 7h16M50 16v10M2 35h16" />
            <path className="l" d="M5 5h1v1H5zM25 4h1v1h-1zM34 9h1v1h-1zM54 10h1v1h-1zM6 20h1v1H6zM45 22h1v1h-1zM14 32h1v1h-1zM27 33h1v1h-1zM35 38h1v1h-1zM53 37h1v1h-1z" />
          </pattern>
          <radialGradient id="art-graf-g" cx=".35" cy=".3" r=".8">
            <stop offset="0" stopColor="#1fa89f" />
            <stop offset="1" stopColor="#1B3862" />
          </radialGradient>
          <g id="art-graf-m">
            <ellipse className="rg" rx="4.4" ry="2.5" />
            <path className="pn" d="M0 0C-.8-2.4-3.4-4-3.4-6.4a3.4 3.4 0 1 1 6.8 0C3.4-4 .8-2.4 0 0ZM0-7.7a1.3 1.3 0 1 0 0 2.6 1.3 1.3 0 1 0 0-2.6Z" />
            <g className="ck">
              <circle cy="-6.4" r="3.4" />
              <path d="M-1.5-6.4l1 1.1 2.1-2.3" />
            </g>
          </g>
        </defs>
        {/* La ciudad se dibuja dos veces: la copia oscura y desplazada hace de muros bajo los techos. */}
        <use href="#art-graf-c" y="1.6" className="sd" />
        <g id="art-graf-c" transform="translate(80 52) scale(1 .56) rotate(28)">
          <rect className="rf" x="-150" y="-150" width="300" height="300" />
          <rect className="lt" x="-150" y="-150" width="300" height="300" />
          <g className="rv">
            <path id="art-graf-v" d="M-150 54C-80 40-40 60 10 50S90 42 150 58" />
          </g>
          <use href="#art-graf-v" className="fl" />
          <g className="av">
            <path id="art-graf-a" d="M-150-42H150M-150 42H150M-60-150V150M0-150V150M60-150V150" />
          </g>
          <use href="#art-graf-a" className="lp" />
        </g>
      </svg>
      {/* Encima de la niebla: rutas, pedidos y despacho. */}
      <svg viewBox="0 0 160 100">
        {ORDERS.map((o, i) => (
          <g key={i} className={i ? 'x' : undefined} style={o.style}>
            <path className="rb" d={o.d} />
            <path className="rt" d={o.d} />
            <path className="cr" d={o.d} />
            <use href="#art-graf-m" x={o.end[0]} y={o.end[1]} />
          </g>
        ))}
        <g transform={`translate(${hx} ${hy})`}>
          <ellipse className="hp" rx="5.5" ry="3.1" />
          <path className="hs" d="M0 0v-5" />
          <circle cy="-10.6" r="5.6" fill="url(#art-graf-g)" />
          <ellipse className="ob" cy="-10.6" rx="8.6" ry="2.4" />
          <path className="bag" d="M-2.5-12.2h5l.5 4.5h-6zM-1.3-12.2v-.7a1.3 1.3 0 0 1 2.6 0v.7" />
        </g>
      </svg>
    </div>
  );
}
