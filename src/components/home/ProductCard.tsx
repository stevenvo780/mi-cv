import type { HomeCopy } from '@/content/home';
import { type Producto, catalogosDe, frentesMeta, productTags } from '@/data/frentes';
import { nodeId } from '@/graph/sources';
import type { Locale } from '@/lib/site';
import { normalizeSearch } from '@/lib/text';
import ArtBox from './art/ArtBox';

/**
 * Tarjeta de un proyecto con sitio propio: su emblema animado (art/<id>) manda, y el texto se reduce al antetítulo, el
 * nombre y los enlaces. Lo que es el proyecto está en .card-info, siempre en el HTML (lo lee el buscador de Google y el
 * lector de pantalla): con puntero se revela sobre el emblema al pasar o al enfocar un enlace; en táctil lo abre
 * «¿Qué es?» como una hoja (popover nativo). Sin JS nuevo (spec §5.1).
 */
export default function ProductCard({ p, locale, t }: { p: Producto; locale: Locale; t: HomeCopy }) {
  const f = t.fronts;
  const meta = frentesMeta[p.frente];
  const en = catalogosDe(p).map((c) => c.nombre);
  const info = `info-${p.id}`;
  return (
    <li
      className="card art-host"
      data-node={nodeId.producto(p.id)}
      data-search={normalizeSearch(
        [p.nombre, p.subtitulo?.[locale] ?? '', p.descripcion[locale], p.badge?.[locale] ?? '', meta.nombre[locale], ...en, ...(productTags[p.id] ?? [])].join(' '),
      )}
    >
      <ArtBox id={p.id} locale={locale} className="card-art" />
      <p className="card-kicker">{p.subtitulo?.[locale] ?? meta.nombre[locale]}</p>
      <h4>{p.nombre}</h4>
      {en.length ? <p className="card-in">{f.alsoIn(en)}</p> : null}
      <div className="card-info" id={info} popover="auto">
        <p className="card-info-name">{p.nombre}</p>
        <p className="card-desc">{p.descripcion[locale]}</p>
        {p.badge && (p.url || p.badge[locale] !== f.soon) ? (
          <p className="card-badge">
            <span className="chip">{p.badge[locale]}</span>
          </p>
        ) : null}
        <button type="button" className="card-close" popoverTarget={info} popoverTargetAction="hide">
          {f.close}
        </button>
      </div>
      <p className="card-foot">
        <button type="button" className="card-more" popoverTarget={info}>
          {f.more}
          <span className="sr-only"> {p.nombre}</span>
        </button>
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
}
