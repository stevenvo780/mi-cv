import type { CSSProperties } from 'react';
import type { HomeCopy } from '@/content/home';
import {
  type Catalogo,
  type CatalogoItem,
  catalogoGrupos,
  catalogoKinds,
  catalogos,
  catalogosDe,
  frenteLinks,
  frenteOrder,
  frentesMeta,
  nombreItem,
  productTags,
  productoDeItem,
  productos,
  tarjetasDeFrente,
} from '@/data/frentes';
import { nodeId } from '@/graph/sources';
import { MAP, layoutCatalogMap } from '@/lib/catalogMap';
import type { Locale } from '@/lib/site';
import { normalizeSearch } from '@/lib/text';
import ProductSearch from './ProductSearch';
import SectionHead from './SectionHead';

const catalogAnchor = (id: string) => `catalogo-${id}`;
const vars = (v: Record<string, number>) => v as CSSProperties;

/**
 * Un catálogo (Humanizar, Paideía, Kósmos, Daímon) es un sitio que reúne otros. Abre su frente como un mapa: el
 * catálogo en el centro, sus colecciones a los lados y cada ítem enlazado, unidos por aristas (lib/catalogMap.ts).
 * Los ítems que además tienen tarjeta en la página llevan el nodo hueco. En una tarjeta estrecha, el mapa se pliega en
 * un árbol por colección. Todo es HTML del servidor y CSS (spec §5.1: sin JS nuevo).
 */
function CatalogTile({ c, locale, t }: { c: Catalogo; locale: Locale; t: HomeCopy }) {
  const meta = frentesMeta[c.frente];
  const grupos = catalogoGrupos(c);
  const count = c.incluye.length;
  const label = (i: CatalogoItem) => (i.url ? nombreItem(i, locale) : `${nombreItem(i, locale)} ${t.catalogs.private}`);
  const map = layoutCatalogMap(grupos.map((g) => ({ head: catalogoKinds[g.kind][locale], items: g.items.map(label) })));
  const vista = productos.find((p) => p.vistaDe?.catalogo === c.id);
  const conTarjeta = c.incluye.some((i) => productoDeItem(i));
  return (
    <div
      id={catalogAnchor(c.id)}
      className="cat"
      data-cat={c.id}
      data-node={nodeId.producto(c.id)}
      // El buscador también encuentra el catálogo por lo que contiene: títulos de sus ítems y nombres de sus colecciones.
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
        <p className="cat-label">{t.catalogs.label(count, c.unidad[locale])}</p>
        {/* En el mapa, el nombre es su centro: la cifra en contorno detrás y las aristas saliendo de él. */}
        <div className="cat-title">
          <h4>{c.nombre}</h4>
          <span className="cat-count" aria-hidden="true">
            {count}
          </span>
        </div>
        {c.badge ? <p className="cat-tagline">{c.badge[locale]}</p> : null}
        <p className="cat-desc">{c.descripcion[locale]}</p>
        <p className="cat-actions">
          {c.url ? (
            <a className="cat-enter" href={c.url} rel="noopener" target="_blank">
              {t.catalogs.enter}
              <span className="sr-only"> {c.nombre}</span> ↗
            </a>
          ) : null}
          {c.repo ? (
            <a className="card-link" href={c.repo} rel="noopener" target="_blank">
              {t.fronts.code}
              <span className="sr-only"> {c.nombre}</span>
            </a>
          ) : null}
        </p>
        {vista?.vistaDe && vista.url ? (
          <p className="cat-view">
            {vista.vistaDe.texto[locale]}{' '}
            <a href={vista.url} rel="noopener" target="_blank">
              {vista.nombre} ↗
            </a>
          </p>
        ) : null}
        <div className="cg" style={vars({ '--rows': map.rows, '--xi': MAP.itemX, '--xg': MAP.groupX })}>
          <svg className="cg-edges" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" focusable="false">
            <g className="cg-base">
              {map.edges.map((d, gi) => (
                <path key={gi} d={d} pathLength={1} />
              ))}
            </g>
            <g className="cg-flow">
              {map.edges.map((d, gi) => (
                <path key={gi} d={d} pathLength={1} />
              ))}
            </g>
          </svg>
          <ul className="cg-groups">
            {grupos.map((g, gi) => (
              <li key={g.kind} className="cg-g" data-side={map.groups[gi].side} style={vars({ '--hy': map.groups[gi].headY })}>
                <p className="cg-head">
                  <span>{catalogoKinds[g.kind][locale]}</span> <span className="cg-n">{g.items.length}</span>
                </p>
                <ul>
                  {g.items.map((i, ii) => {
                    const nombre = nombreItem(i, locale);
                    return (
                      <li key={nombre} className={productoDeItem(i) ? 'cg-own' : undefined} style={vars({ '--y': map.groups[gi].itemY[ii] })}>
                        {i.url ? (
                          <a href={i.url} rel="noopener" target="_blank">
                            {nombre}
                          </a>
                        ) : (
                          <span>
                            {nombre} <span className="cat-private">{t.catalogs.private}</span>
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </li>
            ))}
          </ul>
        </div>
        {conTarjeta ? <p className="cg-legend">{t.catalogs.ownCard}</p> : null}
      </div>
    </div>
  );
}

export default function Fronts({ locale, t }: { locale: Locale; t: HomeCopy }) {
  const f = t.fronts;
  return (
    <section id="frentes" className="sec sec-fronts" aria-labelledby="frentes-title" data-section="frentes">
      <div className="sec-inner">
        <SectionHead id="frentes" eyebrow={f.eyebrow} title={f.title} lead={f.lead} />
        <ProductSearch targetId="frentes-list" label={f.searchLabel} placeholder={f.searchPlaceholder} noResults={f.noResults} />
        <div id="frentes-list" className="fronts">
          {frenteOrder.map((fid) => {
            const meta = frentesMeta[fid];
            const tarjetas = tarjetasDeFrente(fid);
            return (
              <article key={fid} className="front reveal" data-front={fid} data-node={nodeId.frente(fid)} aria-labelledby={`front-${fid}`}>
                <header className="front-head">
                  <p className="eyebrow">§ {meta.secNo}</p>
                  <h3 id={`front-${fid}`}>{meta.nombre[locale]}</h3>
                  <p className="front-tagline">{meta.tagline[locale]}</p>
                  {/* <a> y no next/link: los frentes son del grupo (portal); ver la nota de page.tsx. */}
                  <a className="front-link" href={`/${locale}/${fid}`}>
                    {f.openFront} →
                  </a>
                  {/* Sitios del frente que no son productos (CV, blog, servicios): también forman parte del catálogo. */}
                  {frenteLinks[fid] ? (
                    <ul className="front-sites">
                      {frenteLinks[fid].map((l) => (
                        <li key={l.url}>
                          <a href={l.url} rel="noopener" target="_blank">
                            {l.label[locale]} <span aria-hidden="true">↗</span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </header>
                <div className="front-body">
                  {/* El catálogo es un trabajo más del frente, uno que reúne otros: abre el frente con su mapa. En una
                      banda aparte, encima de los frentes y rotulado con su § y su nombre, se leía como el resumen de cada
                      frente y el frente como su detalle, cuando lo que reúne no está en las tarjetas (spec §4.10). */}
                  {catalogos
                    .filter((c) => c.frente === fid)
                    .map((c) => (
                      <CatalogTile key={c.id} c={c} locale={locale} t={t} />
                    ))}
                  <p className="cards-divider" id={`sitios-${fid}`}>
                    {f.ownSites(tarjetas.length)}
                  </p>
                  <ul className="cards" aria-labelledby={`sitios-${fid}`}>
                    {tarjetas.map((p) => {
                      const en = catalogosDe(p).map((c) => c.nombre);
                      return (
                        <li
                          key={p.id}
                          className="card"
                          data-node={nodeId.producto(p.id)}
                          data-search={normalizeSearch(
                            [p.nombre, p.subtitulo?.[locale] ?? '', p.descripcion[locale], p.badge?.[locale] ?? '', meta.nombre[locale], ...en, ...(productTags[p.id] ?? [])].join(' '),
                          )}
                        >
                          <p className="card-kicker">{p.subtitulo?.[locale] ?? meta.nombre[locale]}</p>
                          <h4>{p.nombre}</h4>
                          <p className="card-desc">{p.descripcion[locale]}</p>
                          {en.length ? <p className="card-in">{f.alsoIn(en)}</p> : null}
                          <p className="card-foot">
                            {p.badge && (p.url || p.badge[locale] !== f.soon) ? <span className="chip">{p.badge[locale]}</span> : null}
                            {p.url ? (
                              <a className="card-link" href={p.url} rel="noopener" target="_blank">
                                {f.visit}
                                <span className="sr-only"> {p.nombre}</span> ↗
                              </a>
                            ) : (
                              <span className="chip chip-soon">{f.soon}</span>
                            )}
                            {p.repo ? (
                              <a className="card-link" href={p.repo} rel="noopener" target="_blank">
                                {f.code}
                                <span className="sr-only"> {p.nombre}</span>
                              </a>
                            ) : null}
                          </p>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
