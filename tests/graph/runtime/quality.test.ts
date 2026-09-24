import { describe, expect, it } from 'vitest';
import { QualityGovernor, TIERS, initialTier } from '@/graph/runtime/quality';

const feed = (g: QualityGovernor, ms: number, frames: number, start: number) => {
  let changed = null;
  let now = start;
  for (let i = 0; i < frames; i++) {
    now += ms;
    const r = g.sample(ms, now);
    if (r !== null) changed = r;
  }
  return { changed, now };
};

describe('calidad', () => {
  it('los niveles crecen en coste', () => {
    expect(TIERS[1].decor).toBeLessThan(TIERS[2].decor);
    expect(TIERS[2].decor).toBeLessThan(TIERS[3].decor);
    expect(TIERS[1].bloom).toBe(false);
  });
  it('nivel inicial por dispositivo', () => {
    expect(initialTier({ width: 390, mobile: true, cores: 8 })).toBe(1);
    expect(initialTier({ width: 1440, mobile: false, cores: 12 })).toBe(3);
    expect(initialTier({ width: 1100, mobile: false, cores: 4 })).toBe(2);
  });
  it('baja de nivel con frames lentos (mediana > 20 ms)', () => {
    const g = new QualityGovernor(3);
    expect(feed(g, 28, 90, 0).changed).toBe(2);
    expect(g.tier).toBe(2);
  });
  it('sube solo tras 5 s sostenidos por debajo de 10 ms y nunca por encima del techo', () => {
    const g = new QualityGovernor(2, 3);
    const first = feed(g, 8, 300, 0);
    expect(first.changed).toBe(null);
    const second = feed(g, 8, 450, first.now);
    expect(second.changed).toBe(3);
    expect(feed(g, 8, 1200, second.now).changed).toBe(null);
    expect(g.tier).toBe(3);
  });
  it('nunca baja de 1', () => {
    const g = new QualityGovernor(1);
    expect(feed(g, 60, 900, 0).changed).toBe(null);
    expect(g.tier).toBe(1);
  });
});
