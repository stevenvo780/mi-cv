import type { HomeCopy } from '@/content/home';
import {
  type Catalogo,
  catalogoGrupos,
  catalogoKinds,
  catalogos,
  esCatalogo,
  frenteLinks,
  frenteOrder,
  frentesMeta,
  nombreItem,
  productTags,
  productos,
} from '@/data/frentes';
import { nodeId } from '@/graph/sources';
import type { Locale } from '@/lib/site';
import { normalizeSearch } from '@/lib/text';
import ProductSearch from './ProductSearch';
import SectionHead from './SectionHead';

const catalogAnchor = (id: string) => `catalogo-${id}`;

/**
 * Un catálogo (Humanizar, Paideía, Kósmos, Daímon) reúne otros sitios. Va en la banda «Catálogos»,
 * al principio del catálogo, como una tarjeta grande con hojas apiladas detrás, su rótulo «Catálogo · N …» y la
 * lista entera de lo que contiene, agrupada por colección. Todo es HTML del servidor y CSS (spec §5.1: sin JS nuevo).
 */
function CatalogTile({ c, locale, t }: { c: Catalogo; locale: Locale; t: HomeCopy }) {
  const meta = frentesMeta[c.frente];
  const grupos = catalogoGrupos(c);
  const count = c.incluye.length;
  return (
    <li
      id={catalogAnchor(c.id)}
      className="cat reveal"
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
        <div className="cat-id">
          <p className="cat-front">
            § {meta.secNo} · {meta.nombre[locale]}
          </p>
          <p className="cat-label">{t.catalogs.label(count, c.unidad[locale])}</p>
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
        </div>
        <div className="cat-wall">
          {grupos.map((g) => (
            <div key={g.kind} className="cat-group">
              <p className="cat-group-name">
                <span>{catalogoKinds[g.kind][locale]}</span> <span className="cat-group-n">{g.items.length}</span>
              </p>
              <ul>
                {g.items.map((i) => {
                  const nombre = nombreItem(i, locale);
                  return (
                    <li key={nombre}>
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
            </div>
          ))}
        </div>
      </div>
    </li>
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
          {/* data-front: el buscador oculta la banda entera cuando ningún catálogo coincide (applySearchFilter). */}
          <article className="cats" data-front="catalogos" aria-label={t.catalogs.eyebrow}>
            <ul className="cats-list">
              {catalogos.map((c) => (
                <CatalogTile key={c.id} c={c} locale={locale} t={t} />
              ))}
            </ul>
          </article>
          {frenteOrder.map((fid) => {
            const meta = frentesMeta[fid];
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
                <ul className="cards">
                  {productos
                    .filter((p) => p.frente === fid && !esCatalogo(p))
                    .map((p) => (
                      <li
                        key={p.id}
                        className="card"
                        data-node={nodeId.producto(p.id)}
                        data-search={normalizeSearch(
                          [p.nombre, p.subtitulo?.[locale] ?? '', p.descripcion[locale], p.badge?.[locale] ?? '', meta.nombre[locale], ...(productTags[p.id] ?? [])].join(' '),
                        )}
                      >
                        <p className="card-kicker">{p.subtitulo?.[locale] ?? meta.nombre[locale]}</p>
                        <h4>{p.nombre}</h4>
                        <p className="card-desc">{p.descripcion[locale]}</p>
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
                    ))}
                </ul>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
