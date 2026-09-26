import { catalogos, esCatalogo, frentesMeta, productoDeItem, productos } from '@/data/frentes';
import expEs from '@/locales/es/common/experience.json';
import expEn from '@/locales/en/common/experience.json';
import toolsEs from '@/locales/es/common/tools.json';
import toolsEn from '@/locales/en/common/tools.json';
import type { Bilingual, GEdge, GNode, GraphModel, RelKind } from './model';
import {
  CONCEPT_PRODUCTS,
  EMPRESAS,
  EMPRESAS_PRINCIPALES,
  EMPRESA_PROYECTOS,
  EXTRA_PROJECTS,
  PRODUCT_TECH,
  TOOL_GROUPS,
  type ToolGroupId,
} from './relations';

type Dict = Record<string, string>;
const EXP = { es: expEs as Dict, en: expEn as Dict };
const TOOLS = { es: toolsEs as Dict, en: toolsEn as Dict };

export const nodeId = {
  self: 'self',
  frente: (id: string) => `frente:${id}`,
  producto: (id: string) => `producto:${id}`,
  empresa: (id: string) => `empresa:${id}`,
  grupo: (id: string) => `grupo:${id}`,
  tec: (id: string) => `tec:${id}`,
};

/** "2024/11 - 2026/06", "2022 - Actualidad"… Sin mes en la fuente, `month` no se inventa: queda sin definir. */
export function parseDates(range: string): { year: number; month?: number; yearEnd: number | null } {
  const m = range.match(/^(\d{4})(?:\/(\d{1,2}))?\s*-\s*(?:(\d{4})(?:\/\d{1,2})?|\p{L}+)$/u);
  if (!m) throw new Error(`Fecha no reconocida: "${range}"`);
  return { year: Number(m[1]), ...(m[2] ? { month: Number(m[2]) } : {}), yearEnd: m[3] ? Number(m[3]) : null };
}

function bilingual(key: string, dict: { es: Dict; en: Dict }): Bilingual {
  const es = dict.es[key];
  const en = dict.en[key];
  if (!es || !en) throw new Error(`Falta la clave "${key}" en es o en`);
  return { es, en };
}

/** URL comparable: sin barra final ni mayúsculas. */
/** "ReactJS (Redux, sagas, ReactContext)" → "ReactJS". */
function shortLabel(label: string): string {
  return label.split(' (')[0].trim();
}

export function buildGraphModel(): GraphModel {
  const nodes: GNode[] = [];
  const edges: GEdge[] = [];
  const seen = new Set<string>();
  const addEdge = (source: string, target: string, rel: RelKind, weight: number) => {
    const key = [source, target].sort().join('|');
    if (seen.has(key)) return;
    seen.add(key);
    edges.push({ source, target, rel, weight });
  };

  nodes.push({ id: nodeId.self, kind: 'self', label: { es: 'Steven Vallejo Ortiz', en: 'Steven Vallejo Ortiz' }, weight: 5 });

  for (const f of Object.values(frentesMeta)) {
    nodes.push({ id: nodeId.frente(f.id), kind: 'frente', label: f.nombre, frente: f.id, weight: 4 });
    addEdge(nodeId.self, nodeId.frente(f.id), 'agrupa', 3);
  }

  for (const p of productos) {
    nodes.push({
      id: nodeId.producto(p.id),
      kind: 'producto',
      label: { es: p.nombre, en: p.nombre },
      frente: p.frente,
      url: p.url,
      // Los catálogos reúnen otros sitios: pesan como un hub, igual que un frente.
      weight: esCatalogo(p) ? 4 : p.banner || p.featured ? 3 : 2,
    });
    addEdge(nodeId.frente(p.frente), nodeId.producto(p.id), 'pertenece-a', 2);
  }
  // Catálogo → productos del portafolio que reúne (productoDeItem: la misma regla que marca esos ítems en la home).
  for (const c of catalogos) {
    const reunidos = new Set(c.incluye.map((i) => productoDeItem(i)?.id).filter((id): id is string => !!id && id !== c.id));
    for (const id of reunidos) addEdge(nodeId.producto(c.id), nodeId.producto(id), 'agrupa', 2);
  }
  for (const x of EXTRA_PROJECTS) {
    nodes.push({ id: nodeId.producto(x.id), kind: 'producto', label: x.label, frente: x.frente, weight: 1 });
    addEdge(nodeId.frente(x.frente), nodeId.producto(x.id), 'pertenece-a', 1);
  }

  for (const key of EMPRESAS) {
    const { year, month, yearEnd } = parseDates(EXP.es[`experience.dates.${key}`]);
    nodes.push({
      id: nodeId.empresa(key),
      kind: 'empresa',
      label: bilingual(`experience.${key}`, EXP),
      role: bilingual(`experience.role.${key}`, EXP),
      year,
      month,
      yearEnd,
      weight: EMPRESAS_PRINCIPALES.has(key) ? 3 : 2,
    });
    addEdge(nodeId.self, nodeId.empresa(key), 'trabajo-en', 2);
  }
  for (const [empresa, proyectos] of Object.entries(EMPRESA_PROYECTOS)) {
    for (const p of proyectos ?? []) addEdge(nodeId.empresa(empresa), nodeId.producto(p), 'construyo', 2);
  }

  for (const [gid, group] of Object.entries(TOOL_GROUPS) as [ToolGroupId, (typeof TOOL_GROUPS)[ToolGroupId]][]) {
    nodes.push({ id: nodeId.grupo(gid), kind: 'grupo', label: group.label, frente: group.frente, weight: 2 });
    addEdge(nodeId.frente(group.frente), nodeId.grupo(gid), 'agrupa', 1);
    for (const tool of group.tools) {
      const label = bilingual(`tools.item.${tool}`, TOOLS);
      nodes.push({
        id: nodeId.tec(tool),
        kind: gid === 'logica' ? 'concepto' : 'tecnologia',
        label: { es: shortLabel(label.es), en: shortLabel(label.en) },
        frente: group.frente,
        weight: 1,
      });
      addEdge(nodeId.grupo(gid), nodeId.tec(tool), 'agrupa', 1);
    }
  }

  for (const [p, tools] of Object.entries(PRODUCT_TECH)) for (const t of tools) addEdge(nodeId.producto(p), nodeId.tec(t), 'usa', 1);
  for (const [c, prods] of Object.entries(CONCEPT_PRODUCTS)) for (const p of prods) addEdge(nodeId.tec(c), nodeId.producto(p), 'fundamenta', 1);

  const ids = new Set(nodes.map((n) => n.id));
  for (const e of edges) {
    if (!ids.has(e.source) || !ids.has(e.target)) throw new Error(`Arista colgante: ${e.source} → ${e.target}`);
  }
  return { nodes, edges };
}
