import { describe, expect, it } from 'vitest';
import { sectionProgress } from '@/components/home/useSectionProgress';

/**
 * Scroll continuo de la coreografía (spec §4.5): s = índice de la sección que tiene debajo el centro de la pantalla +
 * progreso dentro de ella, en [0, 1). Las cajas van en el orden de SECTIONS; null = sección que no está en el DOM.
 */
const box = (top: number, height: number) => ({ top, height });

describe('sectionProgress', () => {
  it('con el hero arriba del todo, s es la fracción del hero que ya pasó por el centro', () => {
    expect(sectionProgress([box(0, 900), box(900, 1200)], 450)).toBeCloseTo(0.5);
    expect(sectionProgress([box(0, 900), box(900, 1200)], 0)).toBe(0);
  });

  it('en mitad de la tercera sección, s = 2 + progreso', () => {
    expect(sectionProgress([box(-2000, 900), box(-1100, 1000), box(-100, 1100), box(1000, 900)], 450)).toBeCloseTo(2.5);
  });

  it('nunca llega al índice siguiente dentro de una sección (el progreso se queda por debajo de 1)', () => {
    const s = sectionProgress([box(-2000, 900), box(600, 900)], 450);
    expect(s).toBeLessThan(1);
    expect(s).toBeGreaterThan(0.999);
  });

  it('salta las secciones que faltan sin perder el índice de las demás', () => {
    expect(sectionProgress([box(-900, 900), null, box(0, 900)], 450)).toBeCloseTo(2.5);
  });

  it('antes de que ninguna sección llegue al centro, s = 0', () => {
    expect(sectionProgress([box(600, 900), box(1500, 900)], 450)).toBe(0);
    expect(sectionProgress([], 450)).toBe(0);
  });

  it('una sección de alto 0 no divide por cero', () => {
    expect(Number.isFinite(sectionProgress([box(-10, 0)], 450))).toBe(true);
  });
});
