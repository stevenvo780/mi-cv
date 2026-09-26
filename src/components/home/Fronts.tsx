import type { HomeCopy } from '@/content/home';
import { catalogos, frenteLinks, frenteOrder, frentesMeta, tarjetasDeFrente } from '@/data/frentes';
import { nodeId } from '@/graph/sources';
import type { Locale } from '@/lib/site';
import ArtStyles from './art/ArtStyles';
import { ART_CSS } from './art/generated';
import CatalogTile from './CatalogTile';
import ProductCard from './ProductCard';
import ProductSearch from './ProductSearch';
import SectionHead from './SectionHead';

export default function Fronts({ locale, t }: { locale: Locale; t: HomeCopy }) {
  const f = t.fronts;
  return (
    <section id="frentes" className="sec sec-fronts" aria-labelledby="frentes-title" data-section="frentes">
      <div className="sec-inner">
        <SectionHead id="frentes" eyebrow={f.eyebrow} title={f.title} lead={f.lead} />
        <ProductSearch targetId="frentes-list" label={f.searchLabel} placeholder={f.searchPlaceholder} noResults={f.noResults} />
        {/* El arte (escenas y emblemas) va en su propia hoja. En producción la pide ArtStyles al hidratar: un <link> en el
            cuerpo detiene el análisis del documento, y precargada desde <head> competía con el hero por la red. */}
        {process.env.NODE_ENV === 'production' ? <ArtStyles href={ART_CSS} /> : <link rel="stylesheet" href={ART_CSS} />}
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
                    {tarjetas.map((p) => (
                      <ProductCard key={p.id} p={p} locale={locale} t={t} />
                    ))}
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
