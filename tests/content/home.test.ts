import { describe, expect, it } from 'vitest';
import { HOME, countWord } from '@/content/home';
import { frenteOrder } from '@/data/frentes';

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

  // «Cuatro frentes» es una cifra: sale de frenteOrder, como las de Prueba, y no se escribe a mano (M24).
  it('el título de Frentes cuenta los frentes de los datos', () => {
    expect(HOME.es.fronts.title).toBe(`${countWord('es', frenteOrder.length)} frentes, un mismo criterio`);
    expect(HOME.en.fronts.title).toBe(`${countWord('en', frenteOrder.length)} fronts, one standard`);
    // Con los cuatro frentes de hoy: «Cuatro frentes» / «Four fronts». Si cambia frenteOrder, cambia el título.
    expect(HOME.es.fronts.title.split(' ')[0]).toBe(COUNT_TODAY.es[frenteOrder.length]);
    expect(HOME.en.fronts.title.split(' ')[0]).toBe(COUNT_TODAY.en[frenteOrder.length]);
  });
  it('countWord da el numeral de cada idioma y no inventa fuera de 2–10', () => {
    expect([countWord('es', 5), countWord('en', 5)]).toEqual(['Cinco', 'Five']);
    expect([countWord('es', 3), countWord('en', 10)]).toEqual(['Tres', 'Ten']);
    expect(() => countWord('es', 1)).toThrow();
    expect(() => countWord('en', 11)).toThrow();
  });

  // Erratas que la home muestra en primer plano (revisión final del Plan 1, M22).
  it('Método (about.json) escribe «simbólica» con tilde', () => {
    expect(HOME.es.method.paragraphs.join(' ')).toContain('La lógica simbólica');
    expect(HOME.es.method.paragraphs.join(' ')).not.toMatch(/simbolica/);
  });
  it('Trayectoria en inglés: «platforms that bill», con un verbo que no queda colgando', () => {
    expect(HOME.en.path.lead).toContain('platforms that bill,');
    expect(HOME.en.path.lead).not.toMatch(/invoice/);
  });
});
