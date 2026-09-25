import { normalizeSearch } from '@/lib/text';

/** Hay un solo buscador en la home: un id fijo ahorra `useId` en el JS de la home (presupuesto de la spec §5.1). */
const INPUT_ID = 'buscar-productos';
const EMPTY_ID = 'buscar-vacio';

/** Filtra en el DOM las tarjetas renderizadas por el servidor. Devuelve cuántas quedan visibles. */
export function applySearchFilter(root: ParentNode, query: string): number {
  const tokens = normalizeSearch(query.trim()).split(/\s+/).filter(Boolean);
  let visible = 0;
  root.querySelectorAll<HTMLElement>('[data-search]').forEach((el) => {
    const hay = el.dataset.search ?? '';
    const match = tokens.every((t) => hay.includes(t));
    el.hidden = !match;
    if (match) visible++;
  });
  root.querySelectorAll<HTMLElement>('[data-front]').forEach((front) => {
    front.hidden = tokens.length > 0 && !front.querySelector('[data-search]:not([hidden])');
  });
  return visible;
}

/**
 * Boot del buscador sin isla React: mismo contrato que applySearchFilter, como script `type="module"`
 * (igual que el menú en HomeHeader). Así el filtro no entra en el chunk cliente ni en la hidratación
 * de la home (TBT / unused-JS; spec §5.1).
 */
function searchBootScript(targetId: string, noResults: string): string {
  return `(()=>{const tid=${JSON.stringify(targetId)},msg=${JSON.stringify(noResults)},input=document.getElementById(${JSON.stringify(INPUT_ID)}),empty=document.getElementById(${JSON.stringify(EMPTY_ID)});if(!input)return;const norm=t=>t.toLowerCase().normalize("NFD").replace(/[\\u0300-\\u036f]/g,"");const apply=(root,query)=>{const tokens=norm(query.trim()).split(/\\s+/).filter(Boolean);let n=0;root.querySelectorAll("[data-search]").forEach(el=>{const ok=tokens.every(t=>(el.dataset.search??"").includes(t));el.hidden=!ok;if(ok)n++});root.querySelectorAll("[data-front]").forEach(f=>{f.hidden=tokens.length>0&&!f.querySelector("[data-search]:not([hidden])")});return n};input.addEventListener("input",()=>{const root=document.getElementById(tid);if(!root)return;const n=apply(root,input.value);if(empty)empty.textContent=input.value.trim()&&n===0?msg:""})})()`;
}

/**
 * Buscador del catálogo: HTML del servidor + módulo inline. Sin 'use client' — no hidrata React
 * above/below-fold y no suma al presupuesto de JS cliente de la página.
 */
export default function ProductSearch({
  targetId,
  label,
  placeholder,
  noResults,
}: {
  targetId: string;
  label: string;
  placeholder: string;
  noResults: string;
}) {
  return (
    <div className="search" role="search">
      <label htmlFor={INPUT_ID} className="search-label">
        {label}
      </label>
      <input id={INPUT_ID} type="search" placeholder={placeholder} autoComplete="off" />
      <p id={EMPTY_ID} className="search-empty" aria-live="polite" />
      {/* type="module": diferido, sin bloquear el parser (mismo patrón que HomeHeader). */}
      <script type="module" dangerouslySetInnerHTML={{ __html: searchBootScript(targetId, noResults) }} />
    </div>
  );
}
