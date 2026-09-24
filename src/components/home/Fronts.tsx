import type { HomeCopy } from '@/content/home';
import { frenteLinks, frenteOrder, frentesMeta, productTags, productos } from '@/data/frentes';
import { nodeId } from '@/graph/sources';
import type { Locale } from '@/lib/site';
import { normalizeSearch } from '@/lib/text';
import ProductSearch from './ProductSearch';
import SectionHead from './SectionHead';

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
                    .filter((p) => p.frente === fid)
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
