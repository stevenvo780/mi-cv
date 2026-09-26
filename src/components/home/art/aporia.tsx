import type { CSSProperties } from 'react';

// Áporía: un tribar de Penrose hecho de hojas de manuscrito sobre su retícula isométrica de construcción. En reposo, el
// tramo que cierra el lazo flota despiezado junto a la esquina imposible y se acerca sin llegar a posarse (la obra en
// curso, el atasco); activo, se posa, el lazo imposible se cierra y la figura gira de 120° en 120°, que la deja igual.
// Geometría: cubos unitarios de un tribar de lado 5 en proyección isométrica girada −90° (x sube a la derecha, y baja a
// la derecha, z va a la izquierda). Cada hoja es la cara visible de un cubo; el orden del pintor Xb → Y → Z → Xa (Xa:
// el tramo de X que toca a Z) es el que hace imposible la figura.

type Eje = 'x' | 'y' | 'z';
type Plano = 't' | 'x' | 'y';

const L = 15; // lado de una hoja en unidades del viewBox
const K = 0.9; // la hoja deja una junta: por ella asoma la retícula
const H = Math.sqrt(3) / 2;
// Centro de giro (el de la simetría de orden 3; aporia.css lo repite en transform-origin) y el punto (0,0,0).
const C = [82, 58.7];
const O = [C[0] - 2 * L, C[1] + (2 * L) / Math.sqrt(3)];
const EJE: Record<Eje, number[]> = { x: [0.5, -H], y: [0.5, H], z: [-1, 0] };
// Los dos ejes de cada plano: t (caras de arriba, normal z), x (normal x), y (normal y).
const PLANO: Record<Plano, [Eje, Eje]> = { t: ['x', 'y'], x: ['y', 'z'], y: ['x', 'z'] };

const r = (n: number) => +n.toFixed(1);
// Números de un trazado: sin espacio delante de un signo menos.
const ns = (...v: number[]) => v.map(r).join(' ').replace(/ -/g, '-');
const at = (x: number, y: number, z: number) => [O[0] + L * (0.5 * x + 0.5 * y - z), O[1] + L * H * (y - x)];

/** La hoja de la celda «xyz» (origen de su cuadrado unidad) en el plano p. */
function hoja(p: Plano, c: string) {
  const [x, y, z] = [...c].map(Number);
  const [a, b] = PLANO[p];
  const m = ((1 - K) / 2) * L;
  const u = EJE[a].map((k) => k * L * K);
  const v = EJE[b].map((k) => k * L * K);
  const [ox, oy] = at(x, y, z);
  const s = ns(ox + (EJE[a][0] + EJE[b][0]) * m, oy + (EJE[a][1] + EJE[b][1]) * m);
  return `M${s}l${ns(u[0], u[1], v[0], v[1], -u[0], -u[1])}z`;
}
const hojas = (p: Plano, cs: string) =>
  cs
    .split(' ')
    .map((c) => hoja(p, c))
    .join('');

// Lo que está en su sitio, en el orden del pintor: X (sin su arranque), Y y Z, cada uno con sus dos caras visibles.
const TRIBAR: [Plano, string][] = [
  ['t', '201 301 401'],
  ['y', '210 310'],
  ['x', '500 510 520 530 540'],
  ['t', '411 421 431'],
  ['x', '541 542 543'],
  ['y', '450 451 452 453'],
];
// El tramo Xa, despiezado y alzado en z (a la izquierda en pantalla): [plano, celda, distancia]. Va lo último.
const SUELTAS: [Plano, string, number][] = [
  ['t', '001', 15],
  ['t', '101', 11.5],
  ['y', '010', 16.5],
  ['y', '110', 13],
];
const suelta = (i: number) => {
  const [p, c, d] = SUELTAS[i];
  return <path className="f" style={{ '--i': i, '--d': d } as CSSProperties} d={hoja(p, c)} />;
};

// Retícula triangular de lado L; la tesela empieza media fila por encima de O para que ninguna línea caiga en su borde.
const G = r(L * H);
const RET = `M0 ${G / 2}h${L}M0 ${1.5 * G}h${L}M${-L / 4} 0l${L} ${2 * G}M${0.75 * L} 0l${L} ${2 * G}M${1.25 * L} 0l${-L} ${2 * G}M${L / 4} 0l${-L} ${2 * G}`;
// Texto de una hoja en su cuadrado unidad: título y cuatro renglones.
const TXT = 'M.2 .28h.36M.2 .44h.6M.2 .56h.54M.2 .68h.6M.2 .8h.3';

// Cada plano lleva su papel: una tesela por celda, con los renglones en horizontal en las caras x e y, y a lo largo de
// x en las t. La tesela (u, v) sale de O, así que cae justo sobre las celdas.
const TESELA: Record<Plano, number[][]> = { t: [EJE.x, EJE.y], x: [[1, 0], EJE.y], y: [[1, 0], EJE.x.map((k) => -k)] };
const patron = (p: Plano) => {
  const [u, v] = TESELA[p];
  const m = [u[0] * L, u[1] * L, v[0] * L, v[1] * L, O[0], O[1]].map(r).join(' ');
  return (
    <pattern
      id={`art-aporia-${p}`}
      patternUnits="userSpaceOnUse"
      width="1"
      height="1"
      patternTransform={`matrix(${m})`}
    >
      <rect width="1" height="1" />
      <path d={TXT} />
    </pattern>
  );
};

export default function Art() {
  return (
    <div className="art art-aporia" aria-hidden="true">
      <svg viewBox="0 0 160 100">
        <defs>
          {patron('t')}
          {patron('x')}
          {patron('y')}
          <pattern
            id="art-aporia-g"
            patternUnits="userSpaceOnUse"
            width={L}
            height={2 * G}
            x={r(O[0])}
            y={r(O[1] - G / 2)}
          >
            <path d={RET} />
          </pattern>
          <radialGradient id="art-aporia-r" cy=".56" r=".62">
            <stop offset=".35" />
            <stop offset="1" />
          </radialGradient>
          <mask id="art-aporia-m">
            <rect className="v" />
          </mask>
        </defs>
        <rect className="v g" />
        <g className="fig">
          {TRIBAR.map(([p, cs]) => (
            <path key={cs} className={p} d={hojas(p, cs)} />
          ))}
          <path className="s" d={SUELTAS.map(([p, c]) => hoja(p, c)).join('')} />
          <g className="t">
            {suelta(0)}
            {suelta(1)}
          </g>
          <g className="y">
            {suelta(2)}
            {suelta(3)}
          </g>
        </g>
      </svg>
    </div>
  );
}
