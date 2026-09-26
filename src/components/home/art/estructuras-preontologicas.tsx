import type { CSSProperties } from 'react';

/* Estructuras Pre-Ontológicas: el orden antes que los objetos. El sustrato son 16 subredes de puntos de periodo 4P
   (P = 6 en la caja de 160 × 100), una por cada sitio (a, b) de un bloque de 4 × 4. Movidas juntas, agrupan los
   puntos por bloques de 2 × 2 (escala media) y luego en el centro del bloque grande (escala gruesa): compresión en
   tres escalas. Encima, los bloques anidados de cada escala y, en el centro, el objeto que se estabiliza al final. */
const S = [-3, -1, 1, 3];
const ID = 'art-estructuras-preontologicas-';

/** Bloques de una escala: un cuadrado redondeado por celda, alineado con el centro de la caja (80, 50). */
function Blocks({ k, s, r }: { k: string; s: number; r: number }) {
  const m = +(s / 2 - r).toFixed(1);
  // La caja es 16:10 como el viewBox: 1 unidad = 1cqmin, la medida de los puntos.
  return (
    <svg className={`ep-${k}`} viewBox="0 0 160 100">
      <pattern id={ID + k} width={s} height={s} x="68" y="38" patternUnits="userSpaceOnUse">
        <rect x={m} y={m} width={2 * r} height={2 * r} rx={+(r / 3.4).toFixed(1)} />
      </pattern>
      <rect width="160" height="100" fill={`url(#${ID + k})`} />
    </svg>
  );
}

export default function Art() {
  return (
    <div className="art art-estructuras-preontologicas" aria-hidden="true">
      {S.flatMap((b) => S.map((a) => <i key={`${a},${b}`} style={{ '--a': a, '--b': b } as CSSProperties} />))}
      <Blocks k="m" s={12} r={4.6} />
      <Blocks k="c" s={24} r={11.4} />
      <b className="ep-nm" />
      <b className="ep-nc" />
      <b className="ep-f" />
      <b className="ep-obj" />
    </div>
  );
}
