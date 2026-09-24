import { describe, expect, it } from 'vitest';
import { EMPRESAS } from '@/graph/relations';
import { buildTimeline, formatRange } from '@/content/timeline';

describe('línea de tiempo', () => {
  const entries = buildTimeline();
  it('sigue el orden canónico de experience.json', () => {
    expect(entries.map((e) => e.key)).toEqual([...EMPRESAS]);
  });
  it('Critertec incluye Soy Digital/INDOTEL como logro', () => {
    const critertec = entries.find((e) => e.key === 'critertec')!;
    expect(critertec.achievements.some((a) => a.es.includes('INDOTEL'))).toBe(true);
    expect(critertec.start).toBe('2024-11');
  });
  it('Indie Level Studio termina en 2025/09', () => {
    expect(entries.find((e) => e.key === 'indieLevels')!.dates.es).toContain('2025/09');
  });
  // <time dateTime> no afirma una precisión que la fuente no tiene: "2022 - Actualidad" no es enero de 2022.
  it('el dateTime solo lleva el mes si la fuente lo trae', () => {
    const start = Object.fromEntries(entries.map((e) => [e.key, e.start]));
    expect(start.humanizar).toBe('2022');
    expect(start.appsWeb).toBe('2018');
    expect(start.infraestructura).toBe('2014-02');
    for (const e of entries) expect(e.start).toMatch(/^\d{4}(-(0[1-9]|1[0-2]))?$/);
  });
  it('las fechas van con raya y sin palabras en mayúsculas sostenidas', () => {
    expect(formatRange('2014/02 - ACTUALIDAD')).toBe('2014/02 — Actualidad');
    expect(formatRange('2018 - Present')).toBe('2018 — Present');
    for (const e of entries) {
      for (const d of [e.dates.es, e.dates.en]) {
        expect(d).not.toMatch(/\p{Lu}{2,}/u);
        expect(d).toMatch(/^\d{4}(\/\d{2})? — /);
      }
    }
    expect(entries.find((e) => e.key === 'infraestructura')!.dates.es).toBe('2014/02 — Actualidad');
  });
});
