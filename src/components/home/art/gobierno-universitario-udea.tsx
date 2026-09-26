import type { CSSProperties } from 'react';

const NA = '#e67e22';
// Papel (#f3ece2): el color por defecto del asiento en la hoja.
const PAPEL = '';
// La mesa del Consejo Superior (Ley 30 de 1992, art. 64): nueve asientos con voto y el Rector, con voz y sin voto
// (silueta hueca, índice 5). [ángulo en la elipse (0° a la derecha, sentido horario), color]: en naranja el
// Gobernador (preside, arriba) y los delegados del Ministerio y de la Presidencia; en amarillo el sector productivo; en
// gris un exrector; en papel el Rector, los estudiantes, los profesores, los egresados y las directivas académicas.
const SEATS: [number, string][] = [
  [-90, NA],
  [-54, NA],
  [-18, NA],
  [18, '#f1c40f'],
  [54, '#bdc3c7'],
  [90, PAPEL],
  [126, PAPEL],
  [162, PAPEL],
  [198, PAPEL],
  [234, PAPEL],
];
// Distribución de funciones del CSU 2010-2013 (el anillo del sitio, en %): financieras, otras, gestión y
// administración, dirección y gobierno, normativas y académicas, de investigación y extensión.
const FN: [number, string][] = [
  [51.9, NA],
  [15.1, '#f39c12'],
  [10.8, '#f1c40f'],
  [10.4, '#bdc3c7'],
  [8, '#95a5a6'],
  [3.8, '#7f8c8d'],
];
// Tensiones entre asientos: estudiantes–Gobernador (la que late en reposo), profesores–Presidencia,
// egresados–sector productivo, estudiantes–Rector y profesores–Ministerio.
const T = [
  [6, 0],
  [7, 2],
  [8, 3],
  [6, 5],
  [7, 1],
];

// Unidades del viewBox (160 × 100): la mesa, centrada en (80, 50), es una elipse de 59 × 23,5 bajo los asientos.
const f = (n: number) => Math.round(n * 10) / 10;
const rad = (a: number) => (a * Math.PI) / 180;
const P = SEATS.map(([a]) => [f(80 + 59 * Math.cos(rad(a))), f(50 + 23.5 * Math.sin(rad(a)))]);
// Cada tramo del anillo (radio 47): largo y desfase en unidades del trazo, con una ranura entre tramos.
const C = (2 * Math.PI * 47) / 100;
const RING = FN.map(([v, c], i) => [Math.round((v - 0.9) * C), c, Math.round(FN.slice(0, i).reduce((s, [w]) => s + w, 0) * C)] as const);
const css = (o: Record<string, string | number | undefined>) => o as CSSProperties;
const line = (i: number) => `M${P[T[i][0]]} ${P[T[i][1]]}`;
// Índice para escalonar las animaciones (sin él, 0).
const idx = (i: number) => (i ? css({ '--i': i }) : undefined);

function Seat({ i }: { i: number }) {
  return <i className={i === 5 ? 's r' : 's'} style={css({ '--x': P[i][0], '--y': P[i][1], '--c': SEATS[i][1] || undefined })} />;
}

/** Gobierno Universitario UdeA: el Consejo Superior como una mesa de actores cruzada por tensiones, 2010-2013. */
export default function Art() {
  // Del fondo al frente: los de atrás quedan tras el tablero; los de delante, sobre él.
  const order = SEATS.map((_, i) => i).sort((a, b) => P[a][1] - P[b][1]);
  const far = order.filter((i) => P[i][1] < 50);
  const near = order.filter((i) => P[i][1] >= 50);
  return (
    <div className="art art-gobierno-universitario-udea" aria-hidden="true">
      {far.map((i) => (
        <Seat key={i} i={i} />
      ))}
      <b className="tb" />
      <svg viewBox="0 0 160 100" fill="none" strokeLinecap="round">
        <g className="dn" strokeWidth="8.5" transform="translate(80 50) scale(1 .411) rotate(-90)">
          {RING.map(([w, c, s]) => (
            <circle key={c} r="47" stroke={c} strokeDasharray={`${w} 300`} strokeDashoffset={s ? -s : undefined} />
          ))}
        </g>
        {T.map((_, i) => (
          <path key={i} className={i ? 't' : 't m'} d={line(i)} style={idx(i)} />
        ))}
        {T.map((_, i) => (
          <path key={i} className={i ? 'k' : 'k m'} d={line(i)} pathLength={1} style={idx(i)} />
        ))}
        {/* El periodo analizado: la línea naranja del sitio, un hito por año y el cursor que la recorre. */}
        <path d="M30 87H130" stroke={NA} strokeWidth=".4" opacity=".7" />
        <path d="M30 87h0M63.3 87h0M96.7 87h0M130 87h0" stroke={NA} strokeWidth="1.6" />
        <circle className="d" cx="30" cy="87" r="1.3" fill="#ffe3c6" />
        {[2010, 2011, 2012, 2013].map((y, i) => (
          <text key={y} x={f(30 + (i * 100) / 3)} y="94.6" style={idx(i)}>
            {y}
          </text>
        ))}
      </svg>
      {near.map((i) => (
        <Seat key={i} i={i} />
      ))}
    </div>
  );
}
