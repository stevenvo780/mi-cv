import { describe, expect, it } from 'vitest';
import { applySearchFilter } from '@/components/home/ProductSearch';

function fakeRoot() {
  const make = (search: string) => ({ dataset: { search }, hidden: false });
  const cards = [make('organon logica formal sat solver'), make('kosmos sistemas complejos'), make('prizma dian microservicios')];
  const fronts = [
    { hidden: false, cards: cards.slice(0, 2) },
    { hidden: false, cards: cards.slice(2) },
  ];
  return {
    cards,
    fronts,
    querySelectorAll(selector: string) {
      return (selector === '[data-search]' ? cards : fronts) as unknown as NodeListOf<HTMLElement>;
    },
  };
}

describe('applySearchFilter', () => {
  it('oculta tarjetas que no contienen todos los términos, sin tildes ni mayúsculas', () => {
    const root = fakeRoot();
    root.fronts.forEach((f) => Object.assign(f, { querySelector: () => (f.cards.some((c) => !c.hidden) ? {} : null) }));
    expect(applySearchFilter(root as unknown as ParentNode, 'Lógica SAT')).toBe(1);
    expect(root.cards.map((c) => c.hidden)).toEqual([false, true, true]);
    expect(root.fronts.map((f) => f.hidden)).toEqual([false, true]);
  });
  it('una consulta vacía muestra todo', () => {
    const root = fakeRoot();
    root.fronts.forEach((f) => Object.assign(f, { querySelector: () => ({}) }));
    expect(applySearchFilter(root as unknown as ParentNode, '   ')).toBe(3);
    expect(root.cards.every((c) => !c.hidden)).toBe(true);
  });
  // Tras una búsqueda sin resultados, borrarla devuelve todo el portafolio (tarjetas y frentes).
  it('borrar la consulta restaura la vista', () => {
    const root = fakeRoot();
    root.fronts.forEach((f) => Object.assign(f, { querySelector: () => (f.cards.some((c) => !c.hidden) ? {} : null) }));
    expect(applySearchFilter(root as unknown as ParentNode, 'zzz')).toBe(0);
    expect(root.cards.every((c) => c.hidden)).toBe(true);
    expect(root.fronts.every((f) => f.hidden)).toBe(true);
    expect(applySearchFilter(root as unknown as ParentNode, '')).toBe(3);
    expect(root.cards.every((c) => !c.hidden)).toBe(true);
    expect(root.fronts.every((f) => !f.hidden)).toBe(true);
  });
});
