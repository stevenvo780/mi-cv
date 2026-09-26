import type { CSSProperties, ReactNode } from 'react';
import { type CatalogoKind, catalogoGrupos, catalogos } from '@/data/frentes';
import type { ArtProps } from './types';

// Daímon: un programa levanta el atlas. Colecciones, cifras y cuál es privado salen de data/frentes.ts.
const cat = catalogos.find((c) => c.id === 'stevenai');
const grupos = cat ? catalogoGrupos(cat) : [];
const total = grupos.reduce((n, g) => n + g.items.length, 0);
const inicio = grupos.map((_, r) => grupos.slice(0, r).reduce((n, g) => n + g.items.length, 0));
const v = (o: Record<string, number | string | undefined>) => o as CSSProperties;

// El color de cada área, como en el sitio: ámbar la infraestructura, menta la voz, papel las herramientas, lila la inferencia.
const COLOR: Partial<Record<CatalogoKind, string>> = {
  infraestructura: '#f1bb7c',
  asistentes: '#8ee9d4',
  herramientas: '#ebe3d1',
  inferencia: '#c8baff',
};

// El motivo de cada área en el sitio: bus con rombo, ondas de voz, documento con destello, barras.
const ICON: Partial<Record<CatalogoKind, ReactNode>> = {
  infraestructura: (
    <>
      <path d="M3 8h18v8H3zM8 8v8m8-8v8M12 4v16" />
      <path className="f" d="m12 9 3 3-3 3-3-3z" />
    </>
  ),
  asistentes: <path d="M2 9.5c3.3-4 6.7-4 10 0s6.7 4 10 0M2 15.5c3.3-4 6.7-4 10 0s6.7 4 10 0" />,
  herramientas: (
    <>
      <path d="M3 6h9l4 4v10H3zM12 6v4h4M6 14h7M6 17h5" />
      <path className="f" d="m19.5 1.5 1 2.5 2.5 1-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1z" />
    </>
  ),
  inferencia: <path d="M4 20v-7m4 7V7m4 13v-9m4 9V4m4 16v-6" />,
};

export default function Art({ locale }: ArtProps) {
  return (
    <div className="art art-stevenai" aria-hidden="true">
      <div className="sa-code">
        <p className="sa-bar">
          <b />
          <b />
          <b />
          atlas.ts
        </p>
        <ol className="sa-src">
          <li className="sa-x">
            <b>import</b> {'{ '}
            <i>spawn</i>
            {' }'} <b>from</b> <u>{"'./daimon'"}</u>;
          </li>
          <li>
            <b>const</b> atlas = <b>new</b> <i>Map</i>([
          </li>
          {grupos.map((g) => (
            <li key={g.kind} data-k={g.kind} style={v({ '--c': COLOR[g.kind] })}>
              {'  ['}
              <em>{`'${g.kind}'`}</em>, <em>{g.items.length}</em>],
            </li>
          ))}
          <li>]);</li>
          <li className="sa-x" />
          <li>
            <b>for</b> (<b>const</b> [k, n] <b>of</b> atlas)
          </li>
          <li>
            {'  '}
            <i>spawn</i>(k, n);
          </li>
        </ol>
        <p className="sa-run">
          <b>$</b> tsx atlas.ts<i />
        </p>
        <p className="sa-out">
          {grupos.map((g, r) =>
            g.items.map((_, i) => (
              <i key={`${g.kind}${i}`} data-k={g.kind} style={v({ '--j': inicio[r] + i, '--c': COLOR[g.kind] })}>
                ●
              </i>
            )),
          )}
          <em>
            {' → '}
            {total} {cat?.unidad[locale]}
          </em>
        </p>
      </div>
      <i className="sa-in" />
      <div className="sa-graph">
        <div className="sa-core">
          <svg viewBox="0 0 40 24">
            <path d="M2 14h9l3-7 5 12 5-14 3 9h11" />
            <path className="sa-beat" pathLength={100} d="M2 14h9l3-7 5 12 5-14 3 9h11" />
          </svg>
        </div>
        <ul className="sa-rows">
          {grupos.map((g, r) => (
            <li key={g.kind} data-k={g.kind} style={v({ '--r': r, '--c': COLOR[g.kind] })}>
              <svg viewBox="0 0 24 24">{ICON[g.kind]}</svg>
              <span>
                {g.items.map((it, i) => (
                  <i key={i} data-k={g.kind} data-p={it.url ? undefined : ''} style={v({ '--i': i })} />
                ))}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
