import type { HomeCopy } from '@/content/home';
import { type Catalogo, catalogoGrupos, catalogoKinds, frentesMeta, nombreItem, productTags, productos } from '@/data/frentes';
import { nodeId } from '@/graph/sources';
import type { Locale } from '@/lib/site';
import { normalizeSearch } from '@/lib/text';
import { ART } from './art';

export const catalogAnchor = (id: string) => `catalogo-${id}`;

/**
 * Un catálogo (Humanizar, Paideía, Kósmos, Daímon) es un sitio que reúne otros. Abre su frente con una escena propia
 * (art/<id>: código en Daímon, cosmos griego en Paideía, ecuaciones en Kósmos, operación en Humanizar) que es a la vez el
 * enlace al catálogo: la escena dice cuánto reúne y de qué colecciones, no el nombre de cada obra, para que la invitación
 * sea entrar. La leyenda de colecciones enciende sus elementos en la escena. Los títulos de lo que reúne siguen en
 * data-search: el buscador de la home encuentra el catálogo por su contenido. Todo es HTML del servidor y CSS.
 */
export default function CatalogTile({ c, locale, t }: { c: Catalogo; locale: Locale; t: HomeCopy }) {
  const meta = frentesMeta[c.frente];
  const grupos = catalogoGrupos(c);
  const count = c.incluye.length;
  const Art = ART[c.id];
  const vista = productos.find((p) => p.vistaDe?.catalogo === c.id);
  return (
    <div
      id={catalogAnchor(c.id)}
      className="cat"
      data-cat={c.id}
      data-node={nodeId.producto(c.id)}
      data-search={normalizeSearch(
        [
          c.nombre,
          c.subtitulo?.[locale] ?? '',
          c.descripcion[locale],
          c.badge?.[locale] ?? '',
          meta.nombre[locale],
          t.catalogs.eyebrow,
          ...(productTags[c.id] ?? []),
          ...grupos.map((g) => catalogoKinds[g.kind][locale]),
          ...c.incluye.map((i) => nombreItem(i, locale)),
        ].join(' '),
      )}
    >
      <div className="cat-face">
        <div className="cat-head">
          <p className="cat-label">{t.catalogs.label(count, c.unidad[locale])}</p>
          <div className="cat-title">
            <h4>{c.nombre}</h4>
            <span className="cat-count" aria-hidden="true">
              {count}
            </span>
          </div>
          {c.badge ? <p className="cat-tagline">{c.badge[locale]}</p> : null}
          <p className="cat-desc">{c.descripcion[locale]}</p>
        </div>
        {c.url ? (
          <a className="cat-scene art-host" href={c.url} rel="noopener" target="_blank">
            {Art ? <Art locale={locale} /> : null}
            <span className="cat-enter">
              {t.catalogs.enter}
              <span className="sr-only"> {c.nombre}</span> ↗
            </span>
          </a>
        ) : null}
        <ul className="cat-kinds">
          {grupos.map((g) => (
            <li key={g.kind} data-k={g.kind}>
              <span>{catalogoKinds[g.kind][locale]}</span> <span className="cat-kind-n">{g.items.length}</span>
            </li>
          ))}
        </ul>
        <p className="cat-actions">
          {c.repo ? (
            <a className="card-link" href={c.repo} rel="noopener" target="_blank">
              {t.fronts.code}
              <span className="sr-only"> {c.nombre}</span>
            </a>
          ) : null}
          {vista?.vistaDe && vista.url ? (
            <span className="cat-view">
              {vista.vistaDe.texto[locale]}{' '}
              <a href={vista.url} rel="noopener" target="_blank">
                {vista.nombre} ↗
              </a>
            </span>
          ) : null}
        </p>
      </div>
    </div>
  );
}
