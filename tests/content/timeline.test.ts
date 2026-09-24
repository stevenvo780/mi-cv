import { describe, expect, it } from 'vitest';
import { EMPRESAS } from '@/graph/relations';
import { buildTimeline } from '@/content/timeline';

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
});
