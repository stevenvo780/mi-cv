import { POSTER_ASSET } from '@/graph/generated/stats';

/**
 * Capa fija durante todo el scroll. El Plan 2 monta aquí el canvas WebGL encima del póster.
 *
 * El póster es un archivo con hash en /graph (caché immutable), no SVG inline: inline viajaba dos veces en el HTML
 * (marcado y payload RSC, ~10 KB gz). Con <img> y fetchpriority="low" no compite con lo crítico, y Chrome no lo
 * toma como candidato a LCP porque cubre todo el viewport (el LCP sigue siendo el nombre del h1; spec §5.2).
 */
export default function Stage() {
  return (
    <div className="stage" data-stage aria-hidden="true">
      <div className="stage-poster">
        {/* eslint-disable-next-line @next/next/no-img-element -- SVG estático: next/image no aporta nada y añade JS */}
        <img src={POSTER_ASSET} alt="" width={1600} height={1000} decoding="async" fetchPriority="low" />
      </div>
    </div>
  );
}
