import { FRENTES, KINDS, NO_FRENTE, type DecodedGraph } from '../codec';
import { LAYOUT_NAMES } from '../layout-names';
import type { NodeKind } from '../model';
import { nodeColor } from '../palette';
import { mulberry32 } from '../random';

export function hexToLinear(hex: string): [number, number, number] {
  const v = parseInt(hex.slice(1), 16);
  const ch = (c: number) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return [ch((v >> 16) & 255), ch((v >> 8) & 255), ch(v & 255)];
}

/** Tamaño del sprite en px CSS por tipo de nodo. */
const SPRITE_PX: Record<NodeKind, number> = { self: 22, frente: 16, empresa: 12, producto: 10, grupo: 8, tecnologia: 5, concepto: 6 };
/** Radio del hub de cristal (unidades de mundo) por tipo. */
const HUB_SCALE: Partial<Record<NodeKind, number>> = { self: 0.075, frente: 0.058 };
const HUB_DEFAULT = 0.042;

export interface NodeInstances {
  ref: Float32Array;
  offset: Float32Array;
  color: Float32Array;
  size: Float32Array;
  seed: Float32Array;
  semantic: Float32Array;
  count: number;
}
export interface EdgeInstances {
  a: Float32Array;
  b: Float32Array;
  offA: Float32Array;
  offB: Float32Array;
  colA: Float32Array;
  colB: Float32Array;
  seed: Float32Array;
  weight: Float32Array;
  semantic: Float32Array;
  count: number;
}
export interface HubInstances {
  ref: Float32Array;
  color: Float32Array;
  scale: Float32Array;
  count: number;
}
export interface SceneData {
  nodeCount: number;
  layoutCount: number;
  /** RGBA32F, ancho = nodeCount, alto = layoutCount. */
  layoutTexture: Float32Array;
  nodes: NodeInstances;
  edges: EdgeInstances;
  hubs: HubInstances;
  adjacency: number[][];
  frente: Uint8Array;
  kind: Uint8Array;
  /** Posiciones por forma, para proyectar en CPU (hover). */
  layouts: Float32Array[];
  decorCount: number;
  /** decorEdgePrefix[k] = nº de aristas decorativas de los k primeros satélites: permite recortar la capa al bajar de nivel. */
  decorEdgePrefix: Uint32Array;
}

export function buildSceneData(graph: DecodedGraph, decorCount: number, seed = 13): SceneData {
  const n = graph.nodeCount;
  const m = graph.edgeCount;
  const L = graph.layouts.length;
  if (L !== LAYOUT_NAMES.length) throw new Error('El binario no trae las 5 formas');
  const rand = mulberry32(seed);
  const colorOf = (i: number) => hexToLinear(nodeColor(KINDS[graph.kind[i]], graph.frente[i] === NO_FRENTE ? undefined : FRENTES[graph.frente[i]]));

  const layoutTexture = new Float32Array(n * L * 4);
  for (let l = 0; l < L; l++) {
    for (let i = 0; i < n; i++) {
      const t = (l * n + i) * 4;
      layoutTexture[t] = graph.layouts[l][i * 3];
      layoutTexture[t + 1] = graph.layouts[l][i * 3 + 1];
      layoutTexture[t + 2] = graph.layouts[l][i * 3 + 2];
      layoutTexture[t + 3] = 1;
    }
  }

  // Capa decorativa: satélites repartidos según peso^1.5 (más alrededor de lo importante).
  let acc = 0;
  const cdf = new Float64Array(n);
  for (let i = 0; i < n; i++) cdf[i] = acc += graph.weight[i] ** 1.5;
  const parent = new Uint16Array(decorCount);
  const decorOffset = new Float32Array(decorCount * 3);
  for (let k = 0; k < decorCount; k++) {
    const r = rand() * acc;
    let lo = 0;
    let hi = n - 1;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (cdf[mid] < r) lo = mid + 1;
      else hi = mid;
    }
    parent[k] = lo;
    const u = rand() * 2 - 1;
    const phi = rand() * Math.PI * 2;
    const s = Math.sqrt(1 - u * u);
    const radius = (0.03 + 0.13 * rand() ** 1.8) * (0.7 + 0.15 * graph.weight[lo]);
    decorOffset.set([s * Math.cos(phi) * radius, u * radius, s * Math.sin(phi) * radius], k * 3);
  }

  const total = n + decorCount;
  const nodes: NodeInstances = {
    ref: new Float32Array(total),
    offset: new Float32Array(total * 3),
    color: new Float32Array(total * 3),
    size: new Float32Array(total),
    seed: new Float32Array(total),
    semantic: new Float32Array(total),
    count: total,
  };
  for (let i = 0; i < n; i++) {
    nodes.ref[i] = i;
    nodes.color.set(colorOf(i), i * 3);
    nodes.size[i] = SPRITE_PX[KINDS[graph.kind[i]]] * (graph.weight[i] >= 3 ? 1.15 : 1);
    nodes.seed[i] = rand();
    nodes.semantic[i] = 1;
  }
  for (let k = 0; k < decorCount; k++) {
    const i = n + k;
    nodes.ref[i] = parent[k];
    nodes.offset.set(decorOffset.subarray(k * 3, k * 3 + 3), i * 3);
    const [r, g, b] = colorOf(parent[k]);
    nodes.color.set([r * 0.8, g * 0.8, b * 0.8], i * 3);
    nodes.size[i] = 2 + rand() * 1.6;
    nodes.seed[i] = rand();
    nodes.semantic[i] = 0;
  }

  // Aristas: semánticas + satélite→padre + satélite→satélite anterior del mismo padre.
  const lastOfParent = new Int32Array(n).fill(-1);
  const decorPairs: [number, number][] = [];
  const decorEdgePrefix = new Uint32Array(decorCount + 1);
  for (let k = 0; k < decorCount; k++) {
    decorPairs.push([k, -1]);
    const prev = lastOfParent[parent[k]];
    if (prev >= 0) decorPairs.push([k, prev]);
    lastOfParent[parent[k]] = k;
    decorEdgePrefix[k + 1] = decorPairs.length;
  }
  const e = m + decorPairs.length;
  const edges: EdgeInstances = {
    a: new Float32Array(e),
    b: new Float32Array(e),
    offA: new Float32Array(e * 3),
    offB: new Float32Array(e * 3),
    colA: new Float32Array(e * 3),
    colB: new Float32Array(e * 3),
    seed: new Float32Array(e),
    weight: new Float32Array(e),
    semantic: new Float32Array(e),
    count: e,
  };
  const adjacency: number[][] = Array.from({ length: n }, () => []);
  for (let j = 0; j < m; j++) {
    const s = graph.edges[j * 2];
    const t = graph.edges[j * 2 + 1];
    edges.a[j] = s;
    edges.b[j] = t;
    edges.colA.set(colorOf(s), j * 3);
    edges.colB.set(colorOf(t), j * 3);
    edges.seed[j] = rand();
    edges.weight[j] = graph.edgeWeight[j];
    edges.semantic[j] = 1;
    adjacency[s].push(t);
    adjacency[t].push(s);
  }
  decorPairs.forEach(([k, other], idx) => {
    const j = m + idx;
    const p = parent[k];
    edges.a[j] = p;
    edges.b[j] = p;
    edges.offA.set(decorOffset.subarray(k * 3, k * 3 + 3), j * 3);
    if (other >= 0) edges.offB.set(decorOffset.subarray(other * 3, other * 3 + 3), j * 3);
    const c = colorOf(p);
    edges.colA.set(c, j * 3);
    edges.colB.set(c, j * 3);
    edges.seed[j] = rand();
    edges.weight[j] = 1;
    edges.semantic[j] = 0;
  });

  const hubIdx = Array.from({ length: n }, (_, i) => i).filter((i) => graph.weight[i] >= 3);
  const hubs: HubInstances = {
    ref: new Float32Array(hubIdx.length),
    color: new Float32Array(hubIdx.length * 3),
    scale: new Float32Array(hubIdx.length),
    count: hubIdx.length,
  };
  hubIdx.forEach((i, h) => {
    hubs.ref[h] = i;
    hubs.color.set(colorOf(i), h * 3);
    hubs.scale[h] = HUB_SCALE[KINDS[graph.kind[i]]] ?? HUB_DEFAULT;
  });

  return {
    nodeCount: n,
    layoutCount: L,
    layoutTexture,
    nodes,
    edges,
    hubs,
    adjacency,
    frente: graph.frente,
    kind: graph.kind,
    layouts: graph.layouts,
    decorCount,
    decorEdgePrefix,
  };
}

export function clusterCentroids(data: SceneData): [number, number, number][] {
  const l = LAYOUT_NAMES.indexOf('clusters');
  return FRENTES.map((_, f) => {
    const c: [number, number, number] = [0, 0, 0];
    let count = 0;
    for (let i = 0; i < data.nodeCount; i++) {
      if (data.frente[i] !== f) continue;
      for (let k = 0; k < 3; k++) c[k] += data.layouts[l][i * 3 + k];
      count++;
    }
    return count ? (c.map((v) => v / count) as [number, number, number]) : c;
  });
}

export function helixSpan(data: SceneData): [number, number] {
  const l = LAYOUT_NAMES.indexOf('helice');
  const empresa = KINDS.indexOf('empresa');
  let lo = Infinity;
  let hi = -Infinity;
  for (let i = 0; i < data.nodeCount; i++) {
    if (data.kind[i] !== empresa) continue;
    lo = Math.min(lo, data.layouts[l][i * 3 + 1]);
    hi = Math.max(hi, data.layouts[l][i * 3 + 1]);
  }
  return Number.isFinite(lo) ? [lo, hi] : [-0.8, 0.8];
}
