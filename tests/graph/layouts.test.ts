import { describe, expect, it } from 'vitest';
import { buildGraphModel } from '@/graph/sources';
import { CLUSTER_CENTERS, LAYOUT_NAMES, clusterOf, computeLayouts, hemisphereSide, layoutLemniscata } from '@/graph/layouts';

const model = buildGraphModel();
const layouts = computeLayouts(model);
const N = model.nodes.length;
const at = (p: Float32Array, i: number) => [p[i * 3], p[i * 3 + 1], p[i * 3 + 2]] as const;
const radius = (p: Float32Array, i: number) => Math.hypot(...at(p, i));

describe('computeLayouts', () => {
  it('genera las 5 formas con N×3 valores finitos dentro de la esfera unidad', () => {
    expect(Object.keys(layouts)).toEqual([...LAYOUT_NAMES]);
    for (const name of LAYOUT_NAMES) {
      const p = layouts[name];
      expect(p.length).toBe(N * 3);
      expect(p.every(Number.isFinite)).toBe(true);
      let max = 0;
      for (let i = 0; i < N; i++) max = Math.max(max, radius(p, i));
      expect(max).toBeLessThanOrEqual(1 + 1e-5);
      expect(max).toBeGreaterThan(0.9);
    }
  });

  it('es determinista', () => {
    const again = computeLayouts(model);
    for (const name of LAYOUT_NAMES) expect(Array.from(again[name])).toEqual(Array.from(layouts[name]));
  });

  it('hemisferios: lógica a la izquierda, ingeniería a la derecha, puentes al centro', () => {
    const p = layouts.hemisferios;
    let minSided = Infinity;
    let maxBridge = 0;
    model.nodes.forEach((node, i) => {
      const side = hemisphereSide(node);
      const x = p[i * 3];
      if (side === -1) expect(x, node.id).toBeLessThan(0);
      if (side === 1) expect(x, node.id).toBeGreaterThan(0);
      if (side === 0 && node.kind === 'producto') maxBridge = Math.max(maxBridge, Math.abs(x));
      if (side !== 0) minSided = Math.min(minSided, Math.abs(x));
    });
    expect(maxBridge).toBeLessThan(minSided);
  });

  it('hélice: las empresas suben con su fecha de inicio', () => {
    const p = layouts.helice;
    const empresas = model.nodes
      .map((n, i) => ({ n, i }))
      .filter(({ n }) => n.kind === 'empresa')
      .sort((a, b) => a.n.year! + ((a.n.month ?? 1) - 1) / 12 - (b.n.year! + ((b.n.month ?? 1) - 1) / 12));
    for (let k = 1; k < empresas.length; k++) {
      expect(p[empresas[k].i * 3 + 1]).toBeGreaterThanOrEqual(p[empresas[k - 1].i * 3 + 1]);
    }
  });

  it('clusters: cada nodo queda más cerca del centroide de su frente que de los demás', () => {
    const p = layouts.clusters;
    const assigned = clusterOf(model);
    const centroids = new Map<string, number[]>();
    const counts = new Map<string, number>();
    model.nodes.forEach((node, i) => {
      if (node.kind === 'self') return;
      const c = centroids.get(assigned[i]) ?? [0, 0, 0];
      at(p, i).forEach((v, k) => (c[k] += v));
      centroids.set(assigned[i], c);
      counts.set(assigned[i], (counts.get(assigned[i]) ?? 0) + 1);
    });
    for (const [f, c] of centroids) centroids.set(f, c.map((v) => v / counts.get(f)!));
    expect(centroids.size).toBe(Object.keys(CLUSTER_CENTERS).length);
    model.nodes.forEach((node, i) => {
      if (node.kind === 'self') return;
      const [x, y, z] = at(p, i);
      const dist = (c: number[]) => Math.hypot(x - c[0], y - c[1], z - c[2]);
      const own = dist(centroids.get(assigned[i])!);
      for (const [f, c] of centroids) if (f !== assigned[i]) expect(own, node.id).toBeLessThan(dist(c));
    });
  });

  it('lemniscata: sin grosor, los puntos cumplen (x²+y²)² = x²−y²', () => {
    const p = layoutLemniscata(model, 0);
    for (let i = 0; i < N; i++) {
      const [x, y, z] = at(p, i);
      expect(z).toBeCloseTo(0, 5);
      expect(Math.abs((x * x + y * y) ** 2 - (x * x - y * y))).toBeLessThan(1e-4);
    }
  });
});
