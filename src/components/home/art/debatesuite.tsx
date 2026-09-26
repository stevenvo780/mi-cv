import type { CSSProperties } from 'react';

/* Los dos bandos, con los escudos de participante del sitio (degradado 135° de --o a --c; --h, su halo). Cada uno
   alza su bandera con un tanto del reglamento de Cafetería del Caos: +2 «falacia efectiva» y -3 «no responder». */
const BANDOS = [
  { k: 'sa', l: 'A', p: '+2', v: { '--c': '#cd853f', '--o': '#7a3a14', '--h': '#cd853f6b', '--f': '#daa520', '--p': '#a3c94c' } },
  { k: 'sb', l: 'B', p: '-3', v: { '--c': '#8c6ad5', '--o': '#3b3448', '--h': '#8c6ad56b', '--f': '#c8321f', '--p': '#ff6a55' } },
];

const css = (o: Record<string, string | number>) => o as CSSProperties;

/** Agón: dos oradores en sus atriles y, en medio, el reloj del turno que se agota y cede la palabra. */
export default function Art() {
  return (
    <div className="art art-debatesuite" aria-hidden="true">
      {/* La arena (suelo y pie) y el reloj: 60 marcas y 12 mayores, la pista, el arco que se consume (uno por bando),
          su punta y la flecha que señala quién tiene la palabra. Origen en el centro del reloj. */}
      <svg className="rg" viewBox="-50 -50 100 100" fill="none" stroke="#e8e0d4">
        <ellipse cy="87" rx="130" ry="24" fill="#e8e0d4" fillOpacity=".03" strokeOpacity=".1" strokeWidth=".5" />
        <path d="M0 46v37" strokeWidth="2.2" strokeOpacity=".12" />
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
        0:0<em>9876543210</em>
      </p>
      {BANDOS.map((b) => (
        <div key={b.k} className={`sd ${b.k}`} style={css(b.v)}>
          <div className="sp">
            {[0, 1, 2].map((i) => (
              <i key={i} style={css({ '--i': i })} />
            ))}
          </div>
          <div className="fx">
            <div />
          </div>
          <div className="hd" />
          <div className="bd" />
          <div className="mc" />
          <div className="lc" />
          <div className="lt" />
          <b className="cr">{b.l}</b>
          <b className="pt">{b.p}</b>
        </div>
      ))}
    </div>
  );
}
