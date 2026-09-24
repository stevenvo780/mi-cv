import GraphStageLazy from '@/components/graph/GraphStageLazy';
import type { HomeCopy } from '@/content/home';
import { POSTER_ASSET } from '@/graph/generated/stats';
import type { Locale } from '@/lib/site';

/**
 * Capa fija durante todo el scroll. El póster lo pinta el servidor; al lado va la puerta GraphStageLazy, que monta la
 * escena WebGL encima cuando procede (spec §4.4). `.stage` conserva aria-hidden: los controles y el tooltip del grafo
 * van por portal a `.home` (§4.8).
 *
 * El póster es un archivo con hash en /graph (caché immutable), no SVG inline: inline viajaba dos veces en el HTML
 * (marcado y payload RSC, ~10 KB gz). Con <img> y fetchpriority="low" no compite con lo crítico, y Chrome no lo
 * toma como candidato a LCP porque cubre todo el viewport (el LCP sigue siendo el nombre del h1; spec §5.2).
 */
export default function Stage({ locale, t }: { locale: Locale; t: HomeCopy }) {
  return (
    <div className="stage" data-stage aria-hidden="true">
      <div className="stage-poster">
        {/* eslint-disable-next-line @next/next/no-img-element -- SVG estático: next/image no aporta nada y añade JS */}
        <img src={POSTER_ASSET} alt="" width={1600} height={1000} decoding="async" fetchPriority="low" />
      </div>
      <GraphStageLazy locale={locale} t={t.graph} />
    </div>
  );
}
