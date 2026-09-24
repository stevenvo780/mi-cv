import { describe, expect, it } from 'vitest';
import { DAMPED_KEYS, damp, settling, type Damped } from '@/graph/scene/damping';

const ALL = ['s', 'distance', 'yaw', 'pitch', 'tx', 'ty', 'tz', 'shiftX', 'dim', 'hoverActive', 'parallaxX', 'parallaxY'];

const state = (): Damped => ({ s: 1.5, distance: 4.4, yaw: 0.6, pitch: -0.25, tx: 0.1, ty: -0.2, tz: 0.3, shiftX: 0.55, dim: 0.9, hoverActive: 1, parallaxX: 0.2, parallaxY: -0.4 });

describe('amortiguación de la cámara', () => {
  it('damp se acerca al objetivo como 1 − exp(−λ·dt) y no se mueve con dt = 0', () => {
    expect(damp(0, 1, 5, 0)).toBe(0);
    expect(damp(0, 1, 5, 0.1)).toBeCloseTo(1 - Math.exp(-0.5), 10);
    expect(damp(2, 2, 5, 0.1)).toBe(2);
  });

  it('comprueba todas las magnitudes amortiguadas', () => {
    expect([...DAMPED_KEYS].sort()).toEqual([...ALL].sort());
  });

  it('con todo en su objetivo ha convergido; por debajo de 1e-3 también', () => {
    expect(settling(state(), state())).toBe(false);
    for (const k of ALL) {
      const cur = state();
      cur[k as keyof Damped] += 5e-4;
      expect(settling(cur, state()), k).toBe(false);
    }
  });

  it('sigue en movimiento mientras cualquiera de ellas, sola, esté a más de 1e-3', () => {
    for (const k of ALL) {
      for (const d of [2e-3, -2e-3]) {
        const cur = state();
        cur[k as keyof Damped] += d;
        expect(settling(cur, state()), `${k} ${d}`).toBe(true);
      }
    }
  });
});
