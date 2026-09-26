import type { CSSProperties } from 'react';
import type { ArtProps } from './types';

// Áporía: un tribar de Penrose hecho de hojas de manuscrito sobre su retícula isométrica de construcción. En reposo, las
// últimas hojas flotan junto a la esquina imposible sin llegar a cerrarla (la obra en curso, el atasco); activo, se
// posan, el lazo imposible se cierra y la figura gira sobre sí misma de 120° en 120°, que la deja idéntica.
// Geometría: cubos unitarios de un tribar de lado 5 en proyección isométrica girada −90° (x sube a la derecha, y baja a
// la derecha, z va a la izquierda). El orden del pintor Xb → Y → Z → Xa (Xa: el tramo de X junto a Z) cierra el ciclo.

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
const at = (x: number, y: number, z: number) => [O[0] + L * (0.5 * x + 0.5 * y - z), O[1] + L * H * (y - x)];

/** La hoja de la celda cuyo origen es (x, y, z) en el plano p. */
function hoja(p: Plano, x: number, y: number, z: number) {
  const [a, b] = PLANO[p];
  const m = (1 - K) / 2;
  const u = EJE[a].map((c) => c * L * K);
  const v = EJE[b].map((c) => c * L * K);
  const [ox, oy] = at(x, y, z);
  const [sx, sy] = [ox + (EJE[a][0] + EJE[b][0]) * L * m, oy + (EJE[a][1] + EJE[b][1]) * L * m];
  return `M${r(sx)} ${r(sy)}l${r(u[0])} ${r(u[1])} ${r(v[0])} ${r(v[1])} ${r(-u[0])} ${r(-u[1])}z`;
}
const hojas = (p: Plano, cs: number[][]) => cs.map(([x, y, z]) => hoja(p, x, y, z)).join('');

// El tramo que cierra el lazo (Xa) flota en vista despiezada, alzado en z (hacia la izquierda en pantalla):
// [plano, celda, distancia].
const SUELTAS: [Plano, number[], number][] = [
  ['t', [0, 0, 1], 15],
  ['t', [1, 0, 1], 11.5],
  ['y', [0, 1, 0], 16.5],
  ['y', [1, 1, 0], 13],
];
const suelta = (i: number) => {
  const [p, [x, y, z], d] = SUELTAS[i];
  return <path className="f" style={{ '--i': i, '--d': d } as CSSProperties} d={hoja(p, x, y, z)} />;
};

// Retícula triangular de lado L; la tesela empieza media fila por encima de O para que ninguna línea caiga en su borde.
const G = r(L * H);
const RET = `M0 ${G / 2}h${L}M0 ${1.5 * G}h${L}M${-L / 4} 0l${L} ${2 * G}M${0.75 * L} 0l${L} ${2 * G}M${1.25 * L} 0l${-L} ${2 * G}M${L / 4} 0l${-L} ${2 * G}`;
// Texto de una hoja en su cuadrado unidad: título y cuatro renglones.
const TXT = 'M.2 .28h.36M.2 .44h.6M.2 .56h.54M.2 .68h.6M.2 .8h.3';

// Cada plano lleva su papel: una tesela por celda, con los renglones en horizontal en las caras x e y, y a lo largo de
// x en las t. La tesela (u, v) sale de O, así que cae justo sobre las celdas.
const TESELA: Record<Plano, number[][]> = { t: [EJE.x, EJE.y], x: [[1, 0], EJE.y], y: [[1, 0], EJE.x.map((c) => -c)] };
const patron = (p: Plano) => {
  const [u, v] = TESELA[p];
  const m = [u[0] * L, u[1] * L, v[0] * L, v[1] * L, O[0], O[1]].map(r).join(' ');
  return (
    <pattern id={`art-aporia-${p}`} patternUnits="userSpaceOnUse" width="1" height="1" patternTransform={`matrix(${m})`}>
      <rect width="1" height="1" />
      <path d={TXT} />
    </pattern>
  );
};

export default function Art(_: ArtProps) {
  return (
    <div className="art art-aporia" aria-hidden="true">
      <svg viewBox="0 0 160 100">
        <defs>
          {patron('t')}
          {patron('x')}
          {patron('y')}
          <pattern id="art-aporia-g" patternUnits="userSpaceOnUse" width={L} height={2 * G} x={r(O[0])} y={r(O[1] - G / 2)}>
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
          <path className="t" d={hojas('t', [[2, 0, 1], [3, 0, 1], [4, 0, 1]])} />
          <path className="y" d={hojas('y', [[2, 1, 0], [3, 1, 0]])} />
          <path className="x" d={hojas('x', [[5, 0, 0], [5, 1, 0], [5, 2, 0], [5, 3, 0], [5, 4, 0]])} />
          <path className="t" d={hojas('t', [[4, 1, 1], [4, 2, 1], [4, 3, 1]])} />
          <path className="x" d={hojas('x', [[5, 4, 1], [5, 4, 2], [5, 4, 3]])} />
          <path className="y" d={hojas('y', [[4, 5, 0], [4, 5, 1], [4, 5, 2], [4, 5, 3]])} />
          <path className="s" d={SUELTAS.map(([p, [x, y, z]]) => hoja(p, x, y, z)).join('')} />
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
