import { describe, expect, it } from 'vitest';
import { buildArtifacts } from '@/graph/artifacts';
import { decodeGraph } from '@/graph/codec';
import { LAYOUT_NAMES } from '@/graph/layout-names';
import { buildSceneData, clusterCentroids, helixSpan, hexToLinear } from '@/graph/scene/data';

const { bin } = buildArtifacts();
const graph = decodeGraph(bin.buffer.slice(bin.byteOffset, bin.byteOffset + bin.byteLength) as ArrayBuffer);

describe('datos de GPU', () => {
  const d = buildSceneData(graph, 500);

  it('convierte sRGB a lineal', () => {
    expect(hexToLinear('#ffffff')).toEqual([1, 1, 1]);
    const [r] = hexToLinear('#808080');
    expect(r).toBeCloseTo(0.2158, 3);
  });

  it('textura de formas: N×L texels RGBA con las posiciones del binario', () => {
    expect(d.layoutCount).toBe(LAYOUT_NAMES.length);
    expect(d.layoutTexture.length).toBe(graph.nodeCount * LAYOUT_NAMES.length * 4);
    const i = 7;
    const l = 3;
    const texel = (l * graph.nodeCount + i) * 4;
    expect(d.layoutTexture[texel]).toBe(graph.layouts[l][i * 3]);
    expect(d.layoutTexture[texel + 3]).toBe(1);
  });

  it('instancias de nodos: semánticos + decorativos, referencias válidas', () => {
    expect(d.nodes.count).toBe(graph.nodeCount + 500);
    for (let k = 0; k < d.nodes.count; k++) expect(d.nodes.ref[k]).toBeLessThan(graph.nodeCount);
    expect(Array.from(d.nodes.semantic.slice(0, graph.nodeCount)).every((v) => v === 1)).toBe(true);
    expect(Array.from(d.nodes.semantic.slice(graph.nodeCount)).every((v) => v === 0)).toBe(true);
    expect(Array.from(d.nodes.color).every((v) => v >= 0 && v <= 1)).toBe(true);
  });

  it('cada nodo decorativo está conectado (no hay puntos sueltos)', () => {
    const decorEdges = d.edges.count - graph.edgeCount;
    expect(decorEdges).toBeGreaterThanOrEqual(500);
    expect(d.decorEdgePrefix[d.decorCount]).toBe(decorEdges);
    expect(d.decorEdgePrefix[250]).toBeGreaterThanOrEqual(250);
    expect(Array.from(d.edges.semantic.slice(0, graph.edgeCount)).every((v) => v === 1)).toBe(true);
  });

  it('hubs = nodos semánticos de peso ≥ 3', () => {
    const expected = Array.from(graph.weight).filter((w) => w >= 3).length;
    expect(d.hubs.count).toBe(expected);
  });

  it('adyacencia simétrica', () => {
    d.adjacency.forEach((list, i) => list.forEach((j) => expect(d.adjacency[j]).toContain(i)));
  });

  it('es determinista', () => {
    const again = buildSceneData(graph, 500);
    expect(Array.from(again.nodes.offset)).toEqual(Array.from(d.nodes.offset));
  });

  it('centroides de los 4 frentes y rango de la hélice', () => {
    const c = clusterCentroids(d);
    expect(c).toHaveLength(4);
    const [lo, hi] = helixSpan(d);
    expect(lo).toBeLessThan(hi);
  });
});
