import type { CSSProperties } from 'react';

/* Los dos bandos (sus colores, en el CSS: los escudos de participante del sitio). Cada uno alza su bandera con un
   tanto del reglamento de Cafetería del Caos: +2 «falacia efectiva» y -3 «no responder la cuestión planteada» (B habla,
   pero la esquiva). */
const BANDOS = [
  ['sa', 'A', '+2'],
  ['sb', 'B', '-3'],
];

const css = (o: Record<string, string | number>) => o as CSSProperties;

/** Agón: dos oradores en sus atriles y, en medio, el reloj del turno que se agota y cede la palabra. */
export default function Art() {
  return (
    <div className="art art-debatesuite" aria-hidden="true">
      {/* La arena y el reloj: 60 marcas y 12 mayores, la pista, el arco que se consume (uno por bando), su punta y la
          flecha que señala quién tiene la palabra. Origen en el centro del reloj. */}
      <svg className="rg" viewBox="-50 -50 100 100" fill="none" stroke="#e8e0d4">
        <ellipse cy="87" rx="130" ry="24" fill="#e8e0d4" fillOpacity=".03" strokeOpacity=".1" strokeWidth=".5" />
        <circle r="44" pathLength="60" strokeWidth="3" strokeDasharray=".1 .9" opacity=".22" />
        <circle r="44" pathLength="12" strokeWidth="6" strokeDasharray=".03 .97" opacity=".55" />
        <circle r="35" fill="#141312" strokeWidth="7" strokeOpacity=".07" />
        <g transform="rotate(-90)" strokeWidth="7" strokeLinecap="round" strokeDasharray="100 200">
          <circle className="a1" r="35" pathLength="100" style={css({ '--c': '#cd853f' })} />
          <circle className="a1 a2" r="35" pathLength="100" style={css({ '--c': '#8c6ad5' })} />
        </g>
        <circle className="sk" cy="-35" r="3.6" fill="#fff6ea" stroke="none" />
        <path className="pn" d="M-49.5 0l6-5v10z" fill="#f0e6d6" stroke="none" />
      </svg>
      <p className="dg">
        0:0<em>3210</em>
      </p>
      {BANDOS.map(([k, l, p]) => (
        <div key={k} className={`sd ${k}`}>
          <div className="sp">
            {[0, 1, 2].map((i) => (
              <i key={i} style={i ? css({ '--i': i }) : undefined} />
            ))}
          </div>
          <div className="fx">
            <div />
          </div>
          <div className="hd" />
          <div className="bd" />
          <div className="lc" />
          <div className="lt" />
          <b className="cr">{l}</b>
          <b className="pt">{p}</b>
        </div>
      ))}
    </div>
  );
}
