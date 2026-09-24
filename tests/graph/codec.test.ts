import { describe, expect, it } from 'vitest';
import { buildGraphModel } from '@/graph/sources';
import { LAYOUT_NAMES, computeLayouts } from '@/graph/layouts';
import { FRENTES, KINDS, NO_FRENTE, RELS, decodeGraph, encodeGraph } from '@/graph/codec';

describe('codec', () => {
  const model = buildGraphModel();
  const layouts = computeLayouts(model);
  const { bin, meta } = encodeGraph(model, layouts);
  const buffer = bin.buffer.slice(bin.byteOffset, bin.byteOffset + bin.byteLength) as ArrayBuffer;
  const g = decodeGraph(buffer);

  it('conserva tamaños', () => {
    expect(g.nodeCount).toBe(model.nodes.length);
    expect(g.edgeCount).toBe(model.edges.length);
    expect(g.layouts).toHaveLength(LAYOUT_NAMES.length);
    expect(meta.nodes).toHaveLength(model.nodes.length);
    expect(meta.layouts).toEqual([...LAYOUT_NAMES]);
  });

  it('conserva posiciones, aristas y atributos', () => {
    LAYOUT_NAMES.forEach((name, k) => expect(Array.from(g.layouts[k])).toEqual(Array.from(layouts[name])));
    const index = new Map(model.nodes.map((n, i) => [n.id, i]));
    model.edges.forEach((e, i) => {
      expect(g.edges[i * 2]).toBe(index.get(e.source));
      expect(g.edges[i * 2 + 1]).toBe(index.get(e.target));
      expect(RELS[g.rel[i]]).toBe(e.rel);
      expect(g.edgeWeight[i]).toBe(e.weight);
    });
    model.nodes.forEach((n, i) => {
      expect(KINDS[g.kind[i]]).toBe(n.kind);
      expect(g.frente[i]).toBe(n.frente ? FRENTES.indexOf(n.frente) : NO_FRENTE);
      expect(g.weight[i]).toBe(n.weight);
      expect(meta.nodes[i].id).toBe(n.id);
      expect(meta.nodes[i].label).toEqual(n.label);
    });
  });

  it('rechaza buffers ajenos', () => {
    expect(() => decodeGraph(new ArrayBuffer(16))).toThrow();
  });

  it('cabe en el presupuesto (≤ 60 KB gz binario + meta)', async () => {
    const { gzipSync } = await import('node:zlib');
    const size = gzipSync(bin).length + gzipSync(JSON.stringify(meta)).length;
    expect(size).toBeLessThanOrEqual(60 * 1024);
  });
});
