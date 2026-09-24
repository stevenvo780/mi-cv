import { describe, expect, it } from 'vitest';
import { QualityGovernor, TIERS, initialTier, type Tier } from '@/graph/runtime/quality';

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

/** Frames con coste `workMs` y un intervalo entre frames `intervalMs` (el reloj avanza por el intervalo). */
const feedFrames = (g: QualityGovernor, workMs: number, intervalMs: number, frames: number, start: number) => {
  let changed = null;
  let now = start;
  for (let i = 0; i < frames; i++) {
    now += intervalMs;
    const r = g.sample(workMs, now, intervalMs);
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
  it('a 60 Hz (intervalo de 16.7 ms) sube cuando el coste del frame es < 10 ms durante 5 s', () => {
    const g = new QualityGovernor(1, 2);
    expect(feedFrames(g, 4, 1000 / 60, 450, 0).changed).toBe(2);
  });
  it('baja por el intervalo aunque el coste en CPU sea bajo (GPU saturada) y entonces no sube', () => {
    const g = new QualityGovernor(3);
    expect(feedFrames(g, 3, 28, 90, 0).changed).toBe(2);
    expect(feedFrames(g, 3, 28, 90, 90 * 28).changed).toBe(1);
    const g2 = new QualityGovernor(1, 3);
    expect(feedFrames(g2, 3, 21, 900, 0).changed).toBe(null);
    expect(g2.tier).toBe(1);
  });
  it('la primera vuelta a un nivel espera 5 s y cada bajada posterior desde él duplica la espera (10 s, 20 s…)', () => {
    const g = new QualityGovernor(2);
    const slow = (start: number) => feedFrames(g, 3, 28, 90, start);
    const fast = (frames: number, start: number) => feedFrames(g, 4, 1000 / 60, frames, start);
    let r = slow(0);
    expect(r.changed).toBe(1);
    r = fast(450, r.now); // 7.5 s: primera vuelta, espera de 5 s
    expect(r.changed).toBe(2);
    r = slow(r.now);
    expect(r.changed).toBe(1);
    r = fast(450, r.now); // 7.5 s < 10 s: no vuelve todavía
    expect(r.changed).toBe(null);
    r = fast(450, r.now); // 15 s en total
    expect(r.changed).toBe(2);
    expect(g.tier).toBe(2);
  });
  /** Ciclos de bajada (frames de 28 ms) y vuelta (frames rápidos de 60 Hz): devuelve lo que tardó cada vuelta. */
  const cycles = (g: QualityGovernor, n: number, start = 0) => {
    const waits: number[] = [];
    let now = start;
    for (let i = 0; i < n; i++) {
      const slow = feedFrames(g, 3, 28, 90, now);
      expect(slow.changed, `bajada ${i + 1}`).toBe(1);
      now = slow.now;
      const t0 = now;
      let r: Tier | null = null;
      while (r === null && now - t0 < 700_000) {
        const f = feedFrames(g, 4, 1000 / 60, 90, now);
        r = f.changed;
        now = f.now;
      }
      expect(r, `vuelta ${i + 1}`).toBe(2);
      waits.push(now - t0);
    }
    return { waits, now };
  };
  /** La vuelta tarda la espera más lo que tardan en completarse las ventanas de 90 frames (1.5 s cada una). */
  const expectWait = (ms: number, hold: number) => {
    expect(ms).toBeGreaterThanOrEqual(hold);
    expect(ms).toBeLessThanOrEqual(hold + 3100);
  };

  it('la espera para volver a un nivel tiene un tope de 60 s', () => {
    const g = new QualityGovernor(2);
    const { waits } = cycles(g, 8);
    [5, 10, 20, 40, 60, 60, 60, 60].forEach((s, i) => expectWait(waits[i], s * 1000));
  });

  it('tras 60 s en un nivel sin bajar de él, olvida las bajadas desde ese nivel', () => {
    const g = new QualityGovernor(2);
    let { now } = cycles(g, 3); // tras otra bajada, la vuelta esperaría 40 s
    // 61.5 s (41 ventanas) en T2 sin bajar: intervalo de 60 Hz y coste de 12 ms (ni lento ni rápido).
    now = feedFrames(g, 12, 1000 / 60, 41 * 90, now).now;
    expect(g.tier).toBe(2);
    const { waits } = cycles(g, 1, now);
    expectWait(waits[0], 5000);
  });

  it('estar estable en el nivel de abajo no borra las bajadas del de arriba', () => {
    const g = new QualityGovernor(2);
    let { now } = cycles(g, 2);
    expect(feedFrames(g, 3, 28, 90, now).changed).toBe(1); // tercera bajada: la vuelta esperará 20 s
    now += 90 * 28;
    // 70.5 s (47 ventanas) en T1 sin poder subir (coste de 12 ms): T1 aguanta, pero eso no dice nada de T2.
    now = feedFrames(g, 12, 1000 / 60, 47 * 90, now).now;
    const t0 = now;
    let r: Tier | null = null;
    while (r === null) {
      const f = feedFrames(g, 4, 1000 / 60, 90, now);
      r = f.changed;
      now = f.now;
    }
    expectWait(now - t0, 20_000);
  });

  it('resetBackoff (un resize) olvida las bajadas', () => {
    const g = new QualityGovernor(2);
    const { now } = cycles(g, 3); // tras otra bajada, la vuelta esperaría 40 s
    g.resetBackoff();
    const { waits } = cycles(g, 1, now);
    expectWait(waits[0], 5000);
  });

  it('nunca baja de 1', () => {
    const g = new QualityGovernor(1);
    expect(feed(g, 60, 900, 0).changed).toBe(null);
    expect(g.tier).toBe(1);
  });
});
