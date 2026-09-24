import type { FrenteId } from '@/data/frentes';
import { LAYOUT_NAMES, type LayoutName, type Layouts } from './layout-names';
import type { Bilingual, GNode, GraphModel, NodeKind, RelKind } from './model';

export const KINDS: readonly NodeKind[] = ['self', 'frente', 'empresa', 'producto', 'grupo', 'tecnologia', 'concepto'];
export const RELS: readonly RelKind[] = ['agrupa', 'pertenece-a', 'trabajo-en', 'construyo', 'usa', 'fundamenta'];
export const FRENTES: readonly FrenteId[] = ['informatica', 'filosofia', 'ciencias', 'enterprise'];
export const NO_FRENTE = 255;
const MAGIC = 0x31465247; // bytes 'G','R','F','1' en little-endian
const HEADER = 16;

export interface MetaNode {
  id: string;
  kind: NodeKind;
  label: Bilingual;
  frente?: FrenteId;
  url?: string;
  year?: number;
  month?: number;
  yearEnd?: number | null;
  role?: Bilingual;
}

export interface GraphMeta {
  version: 1;
  layouts: readonly LayoutName[];
  edgeCount: number;
  nodes: MetaNode[];
}

export interface DecodedGraph {
  nodeCount: number;
  edgeCount: number;
  layouts: Float32Array[];
  edges: Uint16Array;
  kind: Uint8Array;
  frente: Uint8Array;
  weight: Uint8Array;
  rel: Uint8Array;
  edgeWeight: Uint8Array;
}

function toMetaNode(n: GNode): MetaNode {
  const out: MetaNode = { id: n.id, kind: n.kind, label: n.label };
  if (n.frente) out.frente = n.frente;
  if (n.url) out.url = n.url;
  if (n.year !== undefined) out.year = n.year;
  if (n.month !== undefined) out.month = n.month;
  if (n.yearEnd !== undefined) out.yearEnd = n.yearEnd;
  if (n.role) out.role = n.role;
  return out;
}

export function encodeGraph(model: GraphModel, layouts: Layouts): { bin: Uint8Array; meta: GraphMeta } {
  const n = model.nodes.length;
  const m = model.edges.length;
  const l = LAYOUT_NAMES.length;
  if (n > 0xffff) throw new Error('Demasiados nodos para índices Uint16');
  const floatBytes = l * n * 3 * 4;
  const edgeBytes = m * 2 * 2;
  const buffer = new ArrayBuffer(HEADER + floatBytes + edgeBytes + n * 3 + m * 2);
  const dv = new DataView(buffer);
  dv.setUint32(0, MAGIC, true);
  dv.setUint32(4, n, true);
  dv.setUint32(8, m, true);
  dv.setUint32(12, l, true);

  const positions = new Float32Array(buffer, HEADER, l * n * 3);
  LAYOUT_NAMES.forEach((name, k) => {
    const p = layouts[name];
    if (p.length !== n * 3) throw new Error(`La forma ${name} no mide N×3`);
    positions.set(p, k * n * 3);
  });

  const index = new Map(model.nodes.map((node, i) => [node.id, i]));
  const edges = new Uint16Array(buffer, HEADER + floatBytes, m * 2);
  model.edges.forEach((e, i) => {
    const s = index.get(e.source);
    const t = index.get(e.target);
    if (s === undefined || t === undefined) throw new Error(`Arista colgante ${e.source} → ${e.target}`);
    edges[i * 2] = s;
    edges[i * 2 + 1] = t;
  });

  const u8 = new Uint8Array(buffer, HEADER + floatBytes + edgeBytes, n * 3 + m * 2);
  model.nodes.forEach((node, i) => {
    u8[i] = KINDS.indexOf(node.kind);
    u8[n + i] = node.frente ? FRENTES.indexOf(node.frente) : NO_FRENTE;
    u8[2 * n + i] = node.weight;
  });
  model.edges.forEach((e, i) => {
    u8[3 * n + i] = RELS.indexOf(e.rel);
    u8[3 * n + m + i] = e.weight;
  });

  return {
    bin: new Uint8Array(buffer),
    meta: { version: 1, layouts: LAYOUT_NAMES, edgeCount: m, nodes: model.nodes.map(toMetaNode) },
  };
}

export function decodeGraph(buffer: ArrayBuffer): DecodedGraph {
  const dv = new DataView(buffer);
  if (buffer.byteLength < HEADER || dv.getUint32(0, true) !== MAGIC) throw new Error('Formato de grafo desconocido');
  const n = dv.getUint32(4, true);
  const m = dv.getUint32(8, true);
  const l = dv.getUint32(12, true);
  const floatBytes = l * n * 3 * 4;
  const all = new Float32Array(buffer, HEADER, l * n * 3);
  const u8 = new Uint8Array(buffer, HEADER + floatBytes + m * 4, n * 3 + m * 2);
  return {
    nodeCount: n,
    edgeCount: m,
    layouts: Array.from({ length: l }, (_, k) => all.subarray(k * n * 3, (k + 1) * n * 3)),
    edges: new Uint16Array(buffer, HEADER + floatBytes, m * 2),
    kind: u8.subarray(0, n),
    frente: u8.subarray(n, 2 * n),
    weight: u8.subarray(2 * n, 3 * n),
    rel: u8.subarray(3 * n, 3 * n + m),
    edgeWeight: u8.subarray(3 * n + m, 3 * n + 2 * m),
  };
}
