import { POSTER_SVG } from '@/graph/generated/poster';

/** Capa fija durante todo el scroll. El Plan 2 monta aquí el canvas WebGL encima del póster. */
export default function Stage() {
  return (
    <div className="stage" data-stage aria-hidden="true">
      <div className="stage-poster" dangerouslySetInnerHTML={{ __html: POSTER_SVG }} />
    </div>
  );
}
