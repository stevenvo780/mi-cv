import { describe, expect, it } from 'vitest';
import { runInNewContext } from 'node:vm';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ProductSearch, { applySearchFilter } from '@/components/home/ProductSearch';

function fakeRoot() {
  const make = (search: string) => ({ dataset: { search }, hidden: false });
  const cards = [make('organon logica formal sat solver'), make('kosmos sistemas complejos'), make('prizma dian microservicios')];
  const fronts = [cards.slice(0, 2), cards.slice(2)].map((group) => ({
    hidden: false,
    querySelector: () => group.find((card) => !card.hidden) ?? null,
  }));
  return {
    cards,
    fronts,
    querySelectorAll(selector: string) {
      return (selector === '[data-search]' ? cards : fronts) as unknown as NodeListOf<HTMLElement>;
    },
  };
}

const queries: [string, boolean[]][] = [
  ['SAT Lógica', [false, true, true]],
  ['LÓGICA\tSAT', [false, true, true]],
  ['formal\nsat', [false, true, true]],
  ['  LÓGICA \t SAT\r\n ', [false, true, true]],
  ['ÓRGANON', [false, true, true]],
  ['sistemas', [true, false, true]],
  ['s', [false, false, false]],
  ['ss', [true, true, true]],
  ['sss', [true, true, true]],
  ['organon inexistente', [true, true, true]],
  ['', [false, false, false]],
  [' \t\r\n ', [false, false, false]],
];

describe('applySearchFilter', () => {
  it.each(queries)('filtra la consulta %j', (query, hidden) => {
    const root = fakeRoot();
    expect(applySearchFilter(root as unknown as ParentNode, query)).toBe(hidden.filter((value) => !value).length);
    expect(root.cards.map((card) => card.hidden)).toEqual(hidden);
    expect(root.fronts.map((front) => front.hidden)).toEqual([hidden[0] && hidden[1], hidden[2]]);
  });

  it('oculta tarjetas que no contienen todos los términos, sin tildes ni mayúsculas', () => {
    const root = fakeRoot();
    expect(applySearchFilter(root as unknown as ParentNode, 'Lógica SAT')).toBe(1);
    expect(root.cards.map((c) => c.hidden)).toEqual([false, true, true]);
    expect(root.fronts.map((f) => f.hidden)).toEqual([false, true]);
  });
  it('una consulta vacía muestra todo', () => {
    const root = fakeRoot();
    expect(applySearchFilter(root as unknown as ParentNode, '   ')).toBe(3);
    expect(root.cards.every((c) => !c.hidden)).toBe(true);
  });
  // Tras una búsqueda sin resultados, borrarla devuelve todo el portafolio (tarjetas y frentes).
  it('borrar la consulta restaura la vista', () => {
    const root = fakeRoot();
    expect(applySearchFilter(root as unknown as ParentNode, 'zzz')).toBe(0);
    expect(root.cards.every((c) => c.hidden)).toBe(true);
    expect(root.fronts.every((f) => f.hidden)).toBe(true);
    expect(applySearchFilter(root as unknown as ParentNode, '')).toBe(3);
    expect(root.cards.every((c) => !c.hidden)).toBe(true);
    expect(root.fronts.every((f) => !f.hidden)).toBe(true);
  });
});

// Ejecuta el script emitido por React con un DOM simulado: no basta probar el helper,
// porque el template literal puede consumir escapes antes de llegar al navegador.
function bootSearch(noResults = 'Sin resultados', targetId = 'catalogo') {
  const html = renderToStaticMarkup(createElement(ProductSearch, {
    targetId, label: 'Buscar productos', placeholder: 'Buscar', noResults,
  }));
  const script = html.match(/<script type="module">([\s\S]*?)<\/script>/)?.[1];
  expect(script).toBeDefined();
  const root = fakeRoot();
  const input = Object.assign(new EventTarget(), { value: '', dataset: {} });
  const empty = { textContent: '' };
  const document = Object.assign(new EventTarget(), {
    readyState: 'loading',
    getElementById: (id: string) => {
      if (id === 'buscar-productos') return input;
      if (id === 'buscar-vacio') return empty;
      return id === targetId ? root : null;
    },
  });
  runInNewContext(script!, {
    document, window: {}, addEventListener: () => {}, Event,
  });
  input.dispatchEvent(new Event('focus'));
  return {
    root, input, empty, html,
    search(query: string) {
      input.value = query;
      input.dispatchEvent(new Event('input'));
    },
  };
}

describe('script emitido de ProductSearch', () => {
  it.each(queries)('filtra la consulta %j y anuncia cuando no hay resultados', (query, hidden) => {
    const { root, empty, search } = bootSearch();
    search(query);
    expect(root.cards.map((card) => card.hidden)).toEqual(hidden);
    expect(root.fronts.map((front) => front.hidden)).toEqual([hidden[0] && hidden[1], hidden[2]]);
    expect(empty.textContent).toBe(query.trim() && hidden.every(Boolean) ? 'Sin resultados' : '');
  });

  it('borrar una búsqueda sin resultados restaura tarjetas, frentes y aviso', () => {
    const { root, empty, search } = bootSearch();
    search('ss');
    expect(root.cards.every((card) => card.hidden)).toBe(true);
    expect(root.fronts.every((front) => front.hidden)).toBe(true);
    expect(empty.textContent).toBe('Sin resultados');
    search('');
    expect(root.cards.every((card) => !card.hidden)).toBe(true);
    expect(root.fronts.every((front) => !front.hidden)).toBe(true);
    expect(empty.textContent).toBe('');
  });

  it('conserva los escapes de las propiedades y el anuncio accesible', () => {
    const noResults = 'Sin resultados: "otra búsqueda"\n\\';
    const { root, empty, html, search } = bootSearch(noResults, 'catalogo-"especial"');
    expect(html).toContain('role="search"');
    expect(html).toContain('for="buscar-productos"');
    expect(html).toContain('id="buscar-vacio" class="search-empty" aria-live="polite"');
    search('inexistente');
    expect(root.cards.every((card) => card.hidden)).toBe(true);
    expect(empty.textContent).toBe(noResults);
  });
});
