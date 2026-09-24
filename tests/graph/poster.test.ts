import { gzipSync } from 'node:zlib';
import { describe, expect, it } from 'vitest';
import { buildGraphModel } from '@/graph/sources';
import { computeLayouts } from '@/graph/layouts';
import { POSTER_VIEWBOX, projectPoint, renderPosterSvg } from '@/graph/poster';

describe('póster', () => {
  const model = buildGraphModel();
  const svg = renderPosterSvg(model, computeLayouts(model).red);

  it('proyecta el origen al centro del lienzo', () => {
    const p = projectPoint([0, 0, 0]);
    expect(p.x).toBeCloseTo(POSTER_VIEWBOX.width / 2, 6);
    expect(p.y).toBeCloseTo(POSTER_VIEWBOX.height / 2, 6);
  });

  it('los puntos más cercanos a la cámara salen más grandes', () => {
    const near = projectPoint([0, 0, 0.8]);
    const far = projectPoint([0, 0, -0.8]);
    expect(near.scale).toBeGreaterThan(far.scale);
  });

  it('es un SVG decorativo con un círculo por nodo como mínimo', () => {
    expect(svg.startsWith('<svg')).toBe(true);
    expect(svg).toContain('viewBox="0 0 1600 1000"');
    expect(svg).toContain('aria-hidden="true"');
    expect((svg.match(/<circle/g) ?? []).length).toBeGreaterThanOrEqual(model.nodes.length);
    expect((svg.match(/<path/g) ?? []).length).toBe(model.edges.length);
  });

  it('cabe en el presupuesto (≤ 12 KB gz)', () => {
    expect(gzipSync(svg).length).toBeLessThanOrEqual(12 * 1024);
  });

  it('es determinista', () => {
    expect(renderPosterSvg(model, computeLayouts(model).red)).toBe(svg);
  });
});
