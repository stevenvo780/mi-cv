import type { CSSProperties } from 'react';

// Colores de sintaxis del editor del sitio: o operador, b llave; las claves (k), los átomos (v) y la puntuación (u) van
// en etiquetas sin estilo propio que la hoja colorea: pesan menos que un style por ficha.
const C = { o: '#22d3ee', b: '#fbbf24' } as const;
const T = { k: 'bdi', v: 'data', u: 'time' } as const;
type Tok = readonly [cls: keyof typeof C | keyof typeof T | '', text: string];

// Las líneas 2–4 del programa de «Motor ST — Pruébalo en vivo» en agora.elenxos.com (la 1 fija la lógica); sin clase, identificador.
const LINES: readonly (readonly Tok[])[] = [
  [['k', 'axiom'], ['', ' a1 '], ['u', ':'], ['', ' '], ['v', 'P'], ['', ' '], ['o', '->'], ['', ' '], ['v', 'Q']],
  [['k', 'axiom'], ['', ' a2 '], ['u', ':'], ['', ' '], ['v', 'P']],
  [['k', 'derive'], ['', ' '], ['v', 'Q'], ['', ' '], ['k', 'from'], ['', ' '], ['b', '{'], ['', 'a1'], ['u', ','], ['', ' a2'], ['b', '}']],
];

const tok = (l: readonly Tok[]) =>
  l.map(([c, t], i) => {
    if (!c) return t;
    if (c in T) {
      const Tag = T[c as keyof typeof T];
      return <Tag key={i}>{t}</Tag>;
    }
    return (
      <span key={i} style={{ color: C[c as keyof typeof C] }}>
        {t}
      </span>
    );
  });
// --d: turno de cada pieza del árbol (cuando la ejecución llega a su línea); la hoja reconoce las piezas por él.
const at = (d: number) => ({ '--d': d }) as CSSProperties;

/** Ágora: un mini editor de ST (la lógica formal ejecutable de Elenxos) escribe un modus ponens y lo demuestra. */
export default function Art() {
  return (
    <div className="art art-agora" aria-hidden="true">
      <div className="ed">
        <div className="tb">
          <span className="run" style={at(0)}>
            ▶
          </span>
          <span style={{ color: '#34d399' }}>{'</>'}</span> ST
        </div>
        <div className="gut">{'1\n2\n3\n4'}</div>
        <div className="code">
          <i className="hl" />
          <p>{tok(LINES[0])}</p>
          <p>{tok(LINES[1])}</p>
          <p>
            {tok(LINES[2])}
            <i className="cur" />
          </p>
        </div>
      </div>
      {/* La salida: la derivación como árbol de deducción natural (𝑃 → 𝑄, 𝑃 ⊢ 𝑄 por modus ponens). */}
      <div className="pf">
        <p className="pr">
          <span style={at(0)}>
            𝑃<span style={{ color: C.o }}> → </span>𝑄
          </span>
          <span style={at(1)}>𝑃</span>
        </p>
        <p className="rule">
          <i style={at(2)} />
          <b style={at(2.4)}>MP</b>
        </p>
        <p className="cq" style={at(2.4)}>
          𝑄
        </p>
        <i className="ok" style={at(2.8)} />
      </div>
    </div>
  );
}
