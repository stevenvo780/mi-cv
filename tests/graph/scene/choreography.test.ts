import { describe, expect, it } from 'vitest';
import { SECTIONS, SECTION_POSE, frameAt, type FrameContext } from '@/graph/scene/choreography';

const ctx: FrameContext = {
  aspect: 1.6,
  clusterCenters: [
    [-0.5, 0.2, 0],
    [0.5, 0.3, -0.1],
    [0.3, -0.5, 0.3],
    [-0.2, -0.5, -0.4],
  ],
  helixSpan: [-0.8, 0.9],
};

describe('coreografía', () => {
  it('al inicio: forma red, sin mezcla y la pose del hero (= cámara del póster)', () => {
    const f = frameAt(0, ctx);
    expect(f.from).toBe('red');
    expect(f.to).toBe('hemisferios');
    expect(f.mix).toBe(0);
    expect(f.pose.distance).toBeCloseTo(SECTION_POSE.hero.distance);
    expect(f.pose.yaw).toBeCloseTo(SECTION_POSE.hero.yaw);
  });

  it('la mezcla hacia la siguiente forma empieza pasado el 55 % de la sección', () => {
    expect(frameAt(0.5, ctx).mix).toBe(0);
    expect(frameAt(0.8, ctx).mix).toBeGreaterThan(0);
    expect(frameAt(0.8, ctx).mix).toBeLessThan(1);
  });

  it('es continuo en las fronteras entre secciones', () => {
    for (let k = 1; k < SECTIONS.length; k++) {
      const before = frameAt(k - 1e-6, ctx);
      const after = frameAt(k, ctx);
      expect(before.to).toBe(after.from);
      expect(before.mix).toBeCloseTo(1, 4);
      expect(after.mix).toBe(0);
      expect(before.pose.distance).toBeCloseTo(after.pose.distance, 3);
      expect(before.pose.target[1]).toBeCloseTo(after.pose.target[1], 3);
    }
  });

  it('trayectoria: la cámara sube por la hélice con el progreso', () => {
    const k = SECTIONS.indexOf('trayectoria');
    expect(frameAt(k, ctx).pose.target[1]).toBeCloseTo(-0.8);
    expect(frameAt(k + 0.5, ctx).pose.target[1]).toBeCloseTo(0.05);
  });

  it('frentes: la cámara visita los 4 clusters en orden', () => {
    const k = SECTIONS.indexOf('frentes');
    expect(frameAt(k + 0.1, ctx).pose.target).toEqual(ctx.clusterCenters[0]);
    expect(frameAt(k + 0.3, ctx).pose.target).toEqual(ctx.clusterCenters[1]);
    expect(frameAt(k + 0.55, ctx).pose.target).toEqual(ctx.clusterCenters[2]);
  });

  it('en pantallas estrechas no desplaza el grafo a un lado', () => {
    const k = SECTIONS.indexOf('frentes');
    expect(frameAt(k + 0.2, ctx).pose.shiftX).toBeGreaterThan(0);
    expect(frameAt(k + 0.2, { ...ctx, aspect: 0.6 }).pose.shiftX).toBe(0);
  });

  it('la última sección termina en la lemniscata y no se sale de rango', () => {
    const f = frameAt(SECTIONS.length + 3, ctx);
    expect(f.from).toBe('lemniscata');
    expect(f.to).toBe('lemniscata');
    expect(frameAt(-2, ctx).from).toBe('red');
  });
});
