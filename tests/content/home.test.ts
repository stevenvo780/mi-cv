import { describe, expect, it } from 'vitest';
import { HOME, countWord } from '@/content/home';
import { frenteOrder, productos } from '@/data/frentes';
import { KINDS } from '@/graph/codec';

// Tabla independiente de la implementación para el numeral (no reutiliza COUNT_WORDS).
const COUNT_TODAY: Record<'es' | 'en', Record<number, string>> = {
  es: { 3: 'Tres', 4: 'Cuatro', 5: 'Cinco', 6: 'Seis' },
  en: { 3: 'Three', 4: 'Four', 5: 'Five', 6: 'Six' },
};

describe('copy de la home', () => {
  for (const locale of ['es', 'en'] as const) {
    it(`${locale}: título ≤ 60 y descripción ≤ 155, sin cifras sueltas`, () => {
      const { meta } = HOME[locale];
      expect(meta.title.length).toBeLessThanOrEqual(60);
      expect(meta.description.length).toBeLessThanOrEqual(155);
      expect(meta.description).not.toMatch(/\d/);
    });
  }

  // «Cuatro frentes · N trabajos» son cifras: salen de frenteOrder y de productos, y no se escriben a mano (M24).
  it('la entradilla del catálogo cuenta los frentes y los trabajos de los datos', () => {
    expect(HOME.es.fronts.eyebrow).toBe(`${countWord('es', frenteOrder.length)} frentes · ${productos.length} trabajos`);
    expect(HOME.en.fronts.eyebrow).toBe(`${countWord('en', frenteOrder.length)} fronts · ${productos.length} works`);
    // Con los cuatro frentes de hoy: «Cuatro frentes» / «Four fronts». Si cambia frenteOrder, cambia la entradilla.
    expect(HOME.es.fronts.eyebrow.split(' ')[0]).toBe(COUNT_TODAY.es[frenteOrder.length]);
    expect(HOME.en.fronts.eyebrow.split(' ')[0]).toBe(COUNT_TODAY.en[frenteOrder.length]);
  });
  it('la home es un catálogo: el copy no escribe ninguna cifra a mano', () => {
    for (const locale of ['es', 'en'] as const) {
      const { fronts, hero, contact, nav, meta } = HOME[locale];
      const derived = new Set([fronts.eyebrow]);
      const texts = [meta.title, meta.description, meta.person, ...Object.values(nav), ...Object.values(fronts), ...Object.values(contact)];
      texts.push(...Object.values(hero).filter((v): v is string => typeof v === 'string'));
      for (const text of texts) if (!derived.has(text)) expect(text, `${locale}: ${text}`).not.toMatch(/\d/);
      expect(fronts.title).toBe(locale === 'es' ? 'Catálogo · todos mis trabajos' : 'Catalog · all my work');
    }
  });
  it('countWord da el numeral de cada idioma y no inventa fuera de 2–10', () => {
    expect([countWord('es', 5), countWord('en', 5)]).toEqual(['Cinco', 'Five']);
    expect([countWord('es', 3), countWord('en', 10)]).toEqual(['Tres', 'Ten']);
    expect(() => countWord('es', 1)).toThrow();
    expect(() => countWord('en', 11)).toThrow();
  });

  // Controles y tooltip del grafo 3D (Plan 2, Tarea 4): cada tipo de nodo del binario tiene su nombre en los dos idiomas.
  it('el bloque graph trae los controles y un nombre por cada tipo de nodo, en los dos idiomas', () => {
    for (const locale of ['es', 'en'] as const) {
      const { graph } = HOME[locale];
      for (const text of [graph.pause, graph.explore, graph.openHint, graph.present]) expect(text.trim(), locale).not.toBe('');
      expect(Object.keys(graph.kinds).sort(), locale).toEqual([...KINDS].sort());
      for (const kind of KINDS) expect(graph.kinds[kind].trim(), `${locale}: ${kind}`).not.toBe('');
    }
    expect(HOME.es.graph.pause).toBe('Pausar la animación del grafo');
    expect(HOME.en.graph.explore).toBe('Explore the graph in 3D');
  });
});
