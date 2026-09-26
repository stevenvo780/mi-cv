import type { CSSProperties } from 'react';
import { type CatalogoKind, catalogoGrupos, catalogos } from '@/data/frentes';
import type { ArtProps } from './types';

/*
 * Paideía: una bóveda celeste griega. En el centro, una esfera armilar con el dodecaedro del Timeo (el sólido que el dios
 * usó para el todo); alrededor, cada obra del catálogo es una estrella y cada colección, una constelación con su nombre
 * griego. En el limbo gira la inscripción de la Academia que el sitio pone en su umbral.
 */

type Vars = CSSProperties & Record<`--${string}`, string | number>;

interface Figura {
  /** Nombre griego: [singular, plural]. */
  nombre: [string, string];
  color: string;
  /** Marco de la figura (w × h) y sus estrellas; se toman tantas como obras tenga la colección. */
  w: number;
  h: number;
  p: [number, number][];
  /** Caja en la escena: [left cqw, top cqh, width cqw] apaisada y luego vertical. */
  caja: [number, number, number, number, number, number];
  /** Centro del nombre: [x cqw, y cqh] apaisado y luego vertical. */
  rotulo: [number, number, number, number];
  /** En vertical la figura se tiende (λόγοι corre bajo la esfera). */
  tendida?: boolean;
}

const FIGURA: Partial<Record<CatalogoKind, Figura>> = {
  curso: {
    nombre: ['μάθημα', 'μαθήματα'],
    color: '#7fdccd',
    w: 100,
    h: 60,
    p: [[10, 44], [50, 11], [88, 40], [66, 55], [30, 54]],
    caja: [3.5, 8, 19, 3, 2, 26],
    rotulo: [13, 31, 11, 16.5],
  },
  ponencia: {
    nombre: ['λόγος', 'λόγοι'],
    color: '#f0c887',
    w: 100,
    h: 160,
    p: [[68, 8], [36, 22], [58, 45], [24, 63], [42, 88], [78, 100], [58, 126], [26, 150], [70, 146], [88, 70]],
    caja: [4, 40, 16, 14, 58.6, 20],
    rotulo: [12.5, 89, 12, 60.5],
    tendida: true,
  },
  tesis: {
    nombre: ['θέσις', 'θέσεις'],
    color: '#ffe6bd',
    w: 40,
    h: 40,
    p: [[20, 20], [8, 8], [32, 10]],
    caja: [83, 8, 11, 76, 1.5, 18],
    rotulo: [88.5, 31, 85, 20.5],
  },
  ensayo: {
    nombre: ['δοκίμιον', 'δοκίμια'],
    color: '#b9a9f0',
    w: 100,
    h: 60,
    p: [[8, 20], [46, 46], [90, 26], [72, 6], [28, 6]],
    caja: [78, 47, 19, 60, 66, 30],
    rotulo: [87.5, 70, 75, 63],
  },
};

// Brillo relativo de cada estrella, por orden.
const BRILLO = [1.2, 0.85, 1.05, 0.8, 1.15, 0.9, 1, 0.75, 1.1, 0.9];

// Dodecaedro: 12 pentágonos (cara superior, anillo alto, anillo bajo, cara inferior) y 20 vértices en cuatro anillos.
const CARAS: [string, number][] = [
  ['f0', 0],
  ...[0, 72, 144, 216, 288].map((y): [string, number] => ['f1', y]),
  ...[36, 108, 180, 252, 324].map((y): [string, number] => ['f2', y]),
  ['f3', 0],
];
const VERTICES: [string, number][] = [0, 72, 144, 216, 288].flatMap((y): [string, number][] => [
  ['v1', y + 36],
  ['v2', y + 36],
  ['v3', y],
  ['v4', y],
]);

// «Que no entre nadie que no sepa geometría»: la puerta de la Academia, que Paideía pone en su umbral.
const LEMA = 'ΑΓΕΩΜΕΤΡΗΤΟΣ ΜΗΔΕΙΣ ΕΙΣΙΤΩ · ΠΑΙΔΕΙΑ · ';

export default function Art(_: ArtProps) {
  const cat = catalogos.find((x) => x.id === 'clavis');
  const grupos = (cat ? catalogoGrupos(cat) : []).flatMap(({ kind, items }) => {
    const f = FIGURA[kind];
    return f ? [{ kind, n: items.length, f }] : [];
  });
  return (
    <div className="art art-clavis" aria-hidden="true">
      <i className="sky">
        <i className="d1" />
        <i className="d2" />
      </i>
      <i className="glow" />
      <svg className="rim" viewBox="-50 -50 100 100">
        <defs>
          <path id="art-clavis-o" d="M0-37.6a37.6 37.6 0 1 1 0 75.2a37.6 37.6 0 1 1 0-75.2" />
          <polygon id="art-clavis-p" points="0,-1 .951,-.309 .588,.809 -.588,.809 -.951,-.309" />
        </defs>
        <circle className="r1" r="47.5" />
        <circle className="tk" r="45.4" />
        <circle className="tk2" r="45.4" />
        <circle className="r1" r="43.2" />
        <circle className="r2" r="35.2" />
        <text fontSize="3.3">
          <textPath href="#art-clavis-o" textLength="234">
            {LEMA + LEMA}
          </textPath>
        </text>
      </svg>
      <div className="arm">
        <div className="w">
          <div className="sph">
            <div className="sp">
              <div className="sp2">
                <i className="rg eq" />
                <i className="rg ec" />
                <i className="rg co" />
                <i className="rg co2" />
              </div>
            </div>
            <i className="ax" />
          </div>
          <div className="dod">
            <div className="dsp">
              <div className="dx">
                {CARAS.map(([k, y], n) => (
                  <svg key={`f${n}`} className={`f ${k}`} viewBox="-1 -1 2 2" style={{ '--ry': y } as Vars}>
                    <use href="#art-clavis-p" />
                  </svg>
                ))}
                {VERTICES.map(([k, y], n) => (
                  <b key={`v${n}`} className={`v ${k}`} style={{ '--ry': y } as Vars} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      {grupos.map(({ kind, n, f }, g) => {
        // Si la colección crece más que su figura, las estrellas de más reflejan las primeras.
        const pts = Array.from({ length: n }, (_x, i): [number, number] => {
          const q = f.p[i % f.p.length];
          return i < f.p.length ? q : [f.w - q[0], f.h - q[1]];
        });
        const traza = (kind === 'curso' && n > 2 ? [...pts, pts[0]] : pts).map((q) => q.join(',')).join(' ');
        const [l, t, w, pl, pt, pw] = f.caja;
        return (
          <div
            key={kind}
            className="c"
            data-k={kind}
            style={
              {
                '--cc': f.color,
                '--ar': `${f.w}/${f.h}`,
                '--d': g,
                '--l': l,
                '--t': t,
                '--w': w,
                '--pl': pl,
                '--pt': pt,
                '--pw': pw,
                ...(f.tendida ? { '--pr': '-90deg' } : {}),
              } as Vars
            }
          >
            <svg viewBox={`0 0 ${f.w} ${f.h}`}>
              {n === 1 ? (
                <>
                  <circle className="b" cx={pts[0][0]} cy={pts[0][1]} r="13" />
                  <circle className="ln" cx={pts[0][0]} cy={pts[0][1]} r="13" pathLength={1} />
                </>
              ) : (
                <>
                  <polyline className="b" points={traza} />
                  <polyline className="ln" points={traza} pathLength={1} />
                </>
              )}
            </svg>
            {pts.map(([x, y], i) => (
              <i
                key={`s${i}`}
                className="s"
                data-k={kind}
                style={
                  {
                    '--x': `${+((x / f.w) * 100).toFixed(1)}%`,
                    '--y': `${+((y / f.h) * 100).toFixed(1)}%`,
                    '--s': n === 1 ? 2.1 : BRILLO[i % BRILLO.length],
                    '--i': g * 3 + i,
                  } as Vars
                }
              />
            ))}
          </div>
        );
      })}
      {grupos.map(({ kind, n, f }) => (
        <b
          key={`t${kind}`}
          className="t"
          data-k={kind}
          style={{ '--cc': f.color, '--l': f.rotulo[0], '--t': f.rotulo[1], '--pl': f.rotulo[2], '--pt': f.rotulo[3] } as Vars}
        >
          {f.nombre[n === 1 ? 0 : 1]}
        </b>
      ))}
    </div>
  );
}
