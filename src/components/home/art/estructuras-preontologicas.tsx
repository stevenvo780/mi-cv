import type { CSSProperties } from 'react';
import type { ArtProps } from './types';

/* Estructuras Pre-Ontológicas: el orden antes que los objetos. El sustrato son 16 subredes de puntos de periodo 4P
   (P = 6 en la caja de 160 × 100), una por cada sitio (a, b) de un bloque de 4 × 4. Movidas juntas, agrupan los
   puntos por bloques de 2 × 2 (escala media) y luego en el centro del bloque grande (escala gruesa): compresión en
   tres escalas. Encima, los bloques anidados de cada escala y, en el centro, el objeto que se estabiliza al final. */
const S = [-3, -1, 1, 3];
// Desfase de la vibración de cada subred (s): sin orden, para que el sustrato no marche al paso.
const D = [3.1, 7.4, 0.6, 5.2, 8.3, 1.9, 6.1, 4.4, 2.5, 5.8, 0.2, 7.9, 4.9, 1.3, 8.8, 3.6];
const ID = 'art-estructuras-preontologicas-';

/** Bloques de una escala: un cuadrado redondeado por celda, alineado con el centro de la caja (80, 50). */
function Blocks({ k, s, r }: { k: string; s: number; r: number }) {
  const m = (s - 2 * r) / 2;
  return (
    <svg className={`ep-${k}`} viewBox="0 0 160 100" preserveAspectRatio="xMidYMid slice">
      <defs>
        <pattern id={ID + k} width={s} height={s} x="68" y="38" patternUnits="userSpaceOnUse">
          <rect x={m} y={m} width={2 * r} height={2 * r} rx={r / 3.4} />
        </pattern>
      </defs>
      <rect width="160" height="100" fill={`url(#${ID + k})`} />
    </svg>
  );
}

export default function Art(_: ArtProps) {
  return (
    <div className="art art-estructuras-preontologicas" aria-hidden="true">
      {S.flatMap((b, j) => S.map((a, i) => <i key={`${a},${b}`} style={{ '--a': a, '--b': b, '--d': D[j * 4 + i] } as CSSProperties} />))}
      <Blocks k="m" s={12} r={4.6} />
      <Blocks k="c" s={24} r={11.4} />
      <b className="ep-nm" />
      <b className="ep-nc" />
      <b className="ep-obj" />
      <b className="ep-v" />
    </div>
  );
}
