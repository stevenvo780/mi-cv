import { forceCenter, forceLink, forceManyBody, forceSimulation } from 'd3-force-3d';
import type { FrenteId } from '@/data/frentes';
import { LAYOUT_NAMES, type LayoutName, type Layouts } from './layout-names';
import type { GNode, GraphModel } from './model';
import { BRIDGE_PRODUCTS } from './relations';

export { LAYOUT_NAMES, type LayoutName, type Layouts };

export const CLUSTER_CENTERS: Record<FrenteId, [number, number, number]> = {
  informatica: [-0.52, 0.18, 0.05],
  filosofia: [0.5, 0.32, -0.12],
  ciencias: [0.3, -0.52, 0.3],
  enterprise: [-0.18, -0.5, -0.42],
};
const FRENTE_ORDER: FrenteId[] = ['informatica', 'filosofia', 'ciencias', 'enterprise'];

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Escala a radio máximo 1; con `center` resta antes el centroide. */
export function normalize(p: Float32Array, center = true): Float32Array {
  const out = new Float32Array(p);
  const n = out.length / 3;
  if (center) {
    const c = [0, 0, 0];
    for (let i = 0; i < n; i++) for (let k = 0; k < 3; k++) c[k] += out[i * 3 + k] / n;
    for (let i = 0; i < n; i++) for (let k = 0; k < 3; k++) out[i * 3 + k] -= c[k];
  }
  let max = 0;
  for (let i = 0; i < n; i++) max = Math.max(max, Math.hypot(out[i * 3], out[i * 3 + 1], out[i * 3 + 2]));
  if (max > 0) for (let i = 0; i < out.length; i++) out[i] /= max;
  return out;
}

interface SimNodeData {
  id: string;
  weight: number;
  x?: number;
  y?: number;
  z?: number;
}
interface SimLinkData {
  source: string;
  target: string;
  weight: number;
}

export function layoutRed(model: GraphModel, seed = 7): Float32Array {
  const simNodes: SimNodeData[] = model.nodes.map((n) => ({ id: n.id, weight: n.weight }));
  const links: SimLinkData[] = model.edges.map((e) => ({ source: e.source, target: e.target, weight: e.weight }));
  const sim = forceSimulation(simNodes, 3)
    .randomSource(mulberry32(seed))
    .force('link', forceLink<SimNodeData, SimLinkData>(links).id((d) => d.id).distance((l) => 1.5 - 0.2 * l.weight).strength(0.65))
    .force('charge', forceManyBody<SimNodeData>().strength((d) => -2.5 - 3 * d.weight))
    .force('center', forceCenter(0, 0, 0))
    .stop();
  sim.tick(420);
  const out = new Float32Array(model.nodes.length * 3);
  simNodes.forEach((n, i) => {
    out[i * 3] = n.x ?? 0;
    out[i * 3 + 1] = n.y ?? 0;
    out[i * 3 + 2] = n.z ?? 0;
  });
  return normalize(out);
}

/** −1 = lógica/filosofía/ciencias (izquierda), 1 = ingeniería (derecha), 0 = self y productos puente. */
export function hemisphereSide(node: GNode): -1 | 0 | 1 {
  if (node.kind === 'self') return 0;
  if (node.kind === 'producto' && BRIDGE_PRODUCTS.has(node.id.slice('producto:'.length))) return 0;
  if (node.kind === 'concepto' || node.frente === 'filosofia' || node.frente === 'ciencias') return -1;
  return 1;
}

export function layoutHemisferios(model: GraphModel, red: Float32Array): Float32Array {
  const out = new Float32Array(red.length);
  model.nodes.forEach((node, i) => {
    const side = hemisphereSide(node);
    const [x, y, z] = [red[i * 3], red[i * 3 + 1], red[i * 3 + 2]];
    out[i * 3] = side === 0 ? x * 0.12 : side * (0.42 + 0.58 * Math.abs(x));
    out[i * 3 + 1] = y * 0.92;
    out[i * 3 + 2] = z * 0.92;
  });
  return normalize(out, false);
}

const T_MIN = 2014;
const T_MAX = 2026.6;

export function layoutHelice(model: GraphModel, seed = 11): Float32Array {
  const rand = mulberry32(seed);
  const index = new Map(model.nodes.map((n, i) => [n.id, i]));
  const t = new Float64Array(model.nodes.length).fill(Number.NaN);

  model.nodes.forEach((n, i) => {
    if (n.kind === 'empresa') t[i] = n.year! + (n.month! - 1) / 12;
  });
  // Productos: tras la empresa que los construyó; si no hay, repartidos en la etapa reciente (2022–2026).
  const productos = model.nodes.map((n, i) => ({ n, i })).filter(({ n }) => n.kind === 'producto');
  productos.forEach(({ n, i }, k) => {
    const builder = model.edges.find((e) => e.rel === 'construyo' && e.target === n.id);
    const bi = builder ? index.get(builder.source) : undefined;
    t[i] = bi !== undefined ? t[bi] + 0.35 + 0.1 * (k % 5) : 2022 + (4.4 * k) / Math.max(1, productos.length - 1);
  });
  // Resto: media de sus vecinos ya ubicados; si no tiene, un valor pseudoaleatorio estable.
  model.nodes.forEach((n, i) => {
    if (!Number.isNaN(t[i]) || n.kind === 'self') return;
    const vals = model.edges
      .filter((e) => e.source === n.id || e.target === n.id)
      .map((e) => t[index.get(e.source === n.id ? e.target : e.source)!])
      .filter((v) => !Number.isNaN(v));
    t[i] = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : T_MIN + rand() * (T_MAX - T_MIN);
  });

  const out = new Float32Array(model.nodes.length * 3);
  model.nodes.forEach((n, i) => {
    if (n.kind === 'self') {
      out.set([0, 1.05, 0], i * 3);
      return;
    }
    const u = (Math.min(Math.max(t[i], T_MIN), T_MAX) - T_MIN) / (T_MAX - T_MIN);
    const angle = u * Math.PI * 2 * 2.25;
    const r = n.kind === 'empresa' ? 0.55 : n.kind === 'producto' ? 0.78 : 1.02 + rand() * 0.18;
    out.set([Math.cos(angle) * r, (u - 0.5) * 2, Math.sin(angle) * r], i * 3);
  });
  return normalize(out, false);
}

/** Frente de cada nodo: el suyo; empresas y self, el más frecuente entre sus productos (por defecto ingeniería). */
export function clusterOf(model: GraphModel): FrenteId[] {
  const byId = new Map(model.nodes.map((n) => [n.id, n]));
  return model.nodes.map((n) => {
    if (n.frente) return n.frente;
    const counts = new Map<FrenteId, number>();
    for (const e of model.edges) {
      if (e.source !== n.id || e.rel !== 'construyo') continue;
      const f = byId.get(e.target)?.frente;
      if (f) counts.set(f, (counts.get(f) ?? 0) + 1);
    }
    let best: FrenteId = 'informatica';
    for (const f of FRENTE_ORDER) if ((counts.get(f) ?? 0) > (counts.get(best) ?? 0)) best = f;
    return best;
  });
}

export function layoutClusters(model: GraphModel, red: Float32Array): Float32Array {
  const assigned = clusterOf(model);
  const sizes = new Map<FrenteId, number>();
  assigned.forEach((f) => sizes.set(f, (sizes.get(f) ?? 0) + 1));
  const maxSize = Math.max(...sizes.values());
  const centroid = new Map<FrenteId, number[]>();
  assigned.forEach((f, i) => {
    const c = centroid.get(f) ?? [0, 0, 0];
    for (let k = 0; k < 3; k++) c[k] += red[i * 3 + k] / sizes.get(f)!;
    centroid.set(f, c);
  });
  const spread = new Map<FrenteId, number>();
  assigned.forEach((f, i) => {
    const c = centroid.get(f)!;
    const d = Math.hypot(red[i * 3] - c[0], red[i * 3 + 1] - c[1], red[i * 3 + 2] - c[2]);
    spread.set(f, Math.max(spread.get(f) ?? 0, d));
  });

  const out = new Float32Array(red.length);
  model.nodes.forEach((n, i) => {
    if (n.kind === 'self') {
      out.set([0, 0, 0], i * 3);
      return;
    }
    const f = assigned[i];
    const c = centroid.get(f)!;
    const radius = 0.3 * Math.sqrt(sizes.get(f)! / maxSize) + 0.06;
    const s = radius / Math.max(spread.get(f)!, 1e-6);
    const center = CLUSTER_CENTERS[f];
    for (let k = 0; k < 3; k++) out[i * 3 + k] = center[k] + (red[i * 3 + k] - c[k]) * s;
  });
  return normalize(out, false);
}

/** Lemniscata de Bernoulli (el ∞ del logo). `thickness` añade un grosor estable fuera del plano. */
export function layoutLemniscata(model: GraphModel, thickness = 0.05, seed = 5): Float32Array {
  const rand = mulberry32(seed);
  const assigned = clusterOf(model);
  const order = model.nodes
    .map((n, i) => ({ i, key: `${FRENTE_ORDER.indexOf(assigned[i])}|${n.id}` }))
    .sort((a, b) => (a.key < b.key ? -1 : a.key > b.key ? 1 : 0));
  const out = new Float32Array(model.nodes.length * 3);
  order.forEach(({ i }, k) => {
    const s = (2 * Math.PI * k) / order.length;
    const d = 1 + Math.sin(s) ** 2;
    const x = Math.cos(s) / d;
    const y = (Math.sin(s) * Math.cos(s)) / d;
    const jitter = thickness * (rand() * 2 - 1);
    const z = thickness === 0 ? 0 : Math.sin(2 * s) * 0.12 + jitter;
    out.set([x + (thickness === 0 ? 0 : jitter * 0.4), y + (thickness === 0 ? 0 : jitter * 0.4), z], i * 3);
  });
  return thickness === 0 ? out : normalize(out, false);
}

export function computeLayouts(model: GraphModel, seed = 7): Layouts {
  const red = layoutRed(model, seed);
  return {
    red,
    hemisferios: layoutHemisferios(model, red),
    helice: layoutHelice(model),
    clusters: layoutClusters(model, red),
    lemniscata: layoutLemniscata(model),
  };
}
