import type { CSSProperties } from 'react';

// Áporía: un tribar de Penrose hecho de hojas de manuscrito sobre su retícula isométrica de construcción. En reposo, el
// tramo que cierra el lazo flota despiezado junto a la esquina imposible y se acerca sin llegar a posarse (la obra en
// curso, el atasco); activo, se posa, el lazo imposible se cierra y se enciende, la figura gira 120° (que la deja igual)
// y tres luces recorren sin fin su arista media.
// Geometría: cubos unitarios de un tribar de lado 5 en proyección isométrica girada −90° (x sube a la derecha, y baja a
// la derecha, z va a la izquierda). Cada hoja es la cara visible de un cubo; el orden del pintor Xb → Y → Z → Xa (Xa:
// el tramo de X que toca a Z) es el que hace imposible la figura.

type Eje = 'x' | 'y' | 'z';
type Plano = 't' | 'x' | 'y';

const L = 14; // lado de una hoja en unidades del viewBox: al girar, la figura cabe justa en la caja (radio 3.2 L)
const K = 0.9; // la hoja deja una junta (aporia.css la dibuja en la tesela): por ella asoma la retícula
const S3 = Math.sqrt(3);
const H = S3 / 2;
// Centro de giro (el de la simetría de orden 3; aporia.css lo repite en transform-origin) y el punto (0,0,0).
const C = [82, 54.5];
const O = [C[0] - 2 * L, C[1] + (2 * L) / S3];
const EJE: Record<Eje, number[]> = { x: [0.5, -H], y: [0.5, H], z: [-1, 0] };
// Los dos ejes de cada plano: t (caras de arriba, normal z), x (normal x), y (normal y).
const PLANO: Record<Plano, [Eje, Eje]> = { t: ['x', 'y'], x: ['y', 'z'], y: ['x', 'z'] };

const r = (n: number) => +n.toFixed(1);
// Números de un trazado: sin espacio delante de un signo menos.
const ns = (...v: number[]) => v.map(r).join(' ').replace(/ -/g, '-');
const at = (x: number, y: number, z: number) => [O[0] + L * (0.5 * x + 0.5 * y - z), O[1] + L * H * (y - x)];

/** Las hojas de las celdas «xyz» (origen de su cuadrado unidad) del plano p, en fila: un solo paralelogramo, porque la
 *  junta entre hojas ya la deja el papel (su tesela es una hoja con margen). Con k < 1, el contorno de una hoja. */
function hoja(p: Plano, cs: string, k = 1) {
  const cel = cs.split(' ').map((c) => [...c].map(Number));
  const o = [0, 1, 2].map((j) => Math.min(...cel.map((c) => c[j])));
  const [a, b] = PLANO[p];
  const lado = (e: Eje) => {
    const j = 'xyz'.indexOf(e);
    return EJE[e].map((q) => q * L * (Math.max(...cel.map((c) => c[j])) - o[j] + k));
  };
  const m = ((1 - k) / 2) * L;
  const [u, v] = [lado(a), lado(b)];
  const [ox, oy] = at(o[0], o[1], o[2]);
  const s = ns(ox + (EJE[a][0] + EJE[b][0]) * m, oy + (EJE[a][1] + EJE[b][1]) * m);
  return `M${s}l${ns(u[0], u[1], v[0], v[1], -u[0], -u[1])}z`;
}

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
const G = +(L * H).toFixed(2);
const RET = `M0 ${G / 2}h${L}M0 ${1.5 * G}h${L}M${-L / 4} 0l${L} ${2 * G}M${0.75 * L} 0l${L} ${2 * G}M${1.25 * L} 0l${-L} ${2 * G}M${L / 4} 0l${-L} ${2 * G}`;
// Texto de una hoja en su cuadrado unidad: título y cuatro renglones (una vez; los otros papeles lo reusan).
const TXT = 'M.2 .28h.36M.2 .44h.6M.2 .56h.54M.2 .68h.6M.2 .8h.3';
// Trazado cerrado por puntos (x, y) relativos a C, en L y L/√3: el primero absoluto; los demás, relativos.
const trazo = (...p: number[][]) => {
  const a = p.map(([x, y]) => [r(C[0] + x * L), r(C[1] + (y * L) / S3)]);
  return `M${ns(...a[0])}l${ns(...a.slice(1).flatMap(([x, y], i) => [x - a[i][0], y - a[i][1]]))}z`;
};
// Silueta del tribar entero para el halo: el hexágono exterior en un sentido y el hueco en el contrario, para que el
// relleno (nonzero) lo deje vacío. Y su arista media (el triángulo de lado 4L que pasa por O): su luz va detrás de las
// hojas y solo asoma por la junta entre las dos caras de cada barra; encima, su resplandor.
const SILUETA =
  trazo([-0.5, -5.5], [0.5, -5.5], [3, 2], [2.5, 3.5], [-2.5, 3.5], [-3, 2]) + trazo([-0.5, 0.5], [0.5, 0.5], [0, -1]);
const ARISTA = trazo([-2, 2], [2, 2], [0, -4]);

// Cada plano lleva su papel: una tesela por celda, con los renglones en horizontal en las caras x e y, y a lo largo de
// x en las t. La tesela (u, v) sale de O, así que cae justo sobre las celdas.
const TESELA: Record<Plano, number[][]> = { t: [EJE.x, EJE.y], x: [[1, 0], EJE.y], y: [[1, 0], EJE.x.map((k) => -k)] };
const patron = (p: Plano) => {
  const [u, v] = TESELA[p];
  const m = [u[0] * L, u[1] * L, v[0] * L, v[1] * L, O[0], O[1]].map(r).join(' ');
  // Las de x e y toman de la t (href) sus unidades y su tamaño, y reusan sus renglones.
  return p === 't' ? (
    <pattern id="art-aporia-t" patternUnits="userSpaceOnUse" width="1" height="1" patternTransform={`matrix(${m})`}>
      <rect />
      <path id="art-aporia-l" d={TXT} />
    </pattern>
  ) : (
    <pattern id={`art-aporia-${p}`} href="#art-aporia-t" patternTransform={`matrix(${m})`}>
      <rect />
      <use href="#art-aporia-l" />
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
          <path className="h" d={SILUETA} />
          <path className="l" d={ARISTA} pathLength={1} />
          {TRIBAR.map(([p, cs]) => (
            <path key={cs} className={p} d={hoja(p, cs)} />
          ))}
          <path className="s" d={SUELTAS.map(([p, c]) => hoja(p, c, K)).join('')} />
          <g className="t">
            {suelta(0)}
            {suelta(1)}
          </g>
          <g className="y">
            {suelta(2)}
            {suelta(3)}
          </g>
          <path className="l w" d={ARISTA} pathLength={1} />
        </g>
      </svg>
    </div>
  );
}
