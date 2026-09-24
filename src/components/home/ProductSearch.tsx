'use client';

import { useId, useState } from 'react';
import { normalizeSearch } from '@/lib/text';

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
  const id = useId();
  const [query, setQuery] = useState('');
  const [empty, setEmpty] = useState(false);
  const onChange = (value: string) => {
    setQuery(value);
    const root = document.getElementById(targetId);
    if (!root) return;
    const count = applySearchFilter(root, value);
    setEmpty(value.trim() !== '' && count === 0);
  };
  return (
    <div className="search" role="search">
      <label htmlFor={id} className="search-label">
        {label}
      </label>
      <input id={id} type="search" value={query} placeholder={placeholder} autoComplete="off" onChange={(e) => onChange(e.target.value)} />
      <p className="search-empty" aria-live="polite">
        {empty ? noResults : ''}
      </p>
    </div>
  );
}
