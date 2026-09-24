import { describe, expect, it } from 'vitest';
import toolsEs from '@/locales/es/common/tools.json';
import { productos } from '@/data/frentes';
import { buildGraphModel, nodeId, parseDates } from '@/graph/sources';
import { CONCEPT_PRODUCTS, EMPRESAS, PRODUCT_TECH, TOOL_GROUPS } from '@/graph/relations';

describe('parseDates', () => {
  it('lee rangos cerrados con mes', () => {
    expect(parseDates('2024/11 - 2026/06')).toEqual({ year: 2024, month: 11, yearEnd: 2026 });
  });
  it('lee rangos abiertos en ES y EN y sin mes', () => {
    expect(parseDates('2014/02 - ACTUALIDAD')).toEqual({ year: 2014, month: 2, yearEnd: null });
  });
  it('sin mes en la fuente no inventa uno', () => {
    for (const range of ['2022 - Actualidad', '2018 - Present']) {
      const d = parseDates(range);
      expect(d).toEqual({ year: Number(range.slice(0, 4)), yearEnd: null });
      expect('month' in d).toBe(false);
    }
  });
  it('rechaza texto sin fecha', () => {
    expect(() => parseDates('hace tiempo')).toThrow();
  });
});

describe('buildGraphModel', () => {
  const g = buildGraphModel();
  const ids = new Set(g.nodes.map((n) => n.id));

  it('ids únicos', () => {
    expect(ids.size).toBe(g.nodes.length);
  });

  it('aristas válidas y sin duplicados', () => {
    const keys = new Set<string>();
    for (const e of g.edges) {
      expect(ids.has(e.source), e.source).toBe(true);
      expect(ids.has(e.target), e.target).toBe(true);
      const key = [e.source, e.target].sort().join('|');
      expect(keys.has(key), key).toBe(false);
      keys.add(key);
    }
  });

  it('tamaño semántico entre 150 y 300 nodos', () => {
    expect(g.nodes.length).toBeGreaterThanOrEqual(150);
    expect(g.nodes.length).toBeLessThanOrEqual(300);
  });

  it('cada producto de frentes.ts es un nodo unido a su frente', () => {
    for (const p of productos) {
      const id = nodeId.producto(p.id);
      const node = g.nodes.find((n) => n.id === id);
      expect(node?.frente).toBe(p.frente);
      expect(g.edges.some((e) => e.source === nodeId.frente(p.frente) && e.target === id)).toBe(true);
    }
  });

  it('cada herramienta de tools.json está en exactamente un grupo', () => {
    const items = Object.keys(toolsEs)
      .filter((k) => k.startsWith('tools.item.'))
      .map((k) => k.slice('tools.item.'.length));
    const grouped = Object.values(TOOL_GROUPS).flatMap((g2) => g2.tools);
    expect(new Set(grouped).size).toBe(grouped.length);
    expect([...grouped].sort()).toEqual([...items].sort());
  });

  it('las relaciones curadas solo usan ids existentes', () => {
    for (const [p, tools] of Object.entries(PRODUCT_TECH)) {
      expect(ids.has(nodeId.producto(p)), p).toBe(true);
      for (const t of tools) expect(ids.has(nodeId.tec(t)), t).toBe(true);
    }
    for (const [c, prods] of Object.entries(CONCEPT_PRODUCTS)) {
      expect(ids.has(nodeId.tec(c)), c).toBe(true);
      for (const p of prods) expect(ids.has(nodeId.producto(p)), p).toBe(true);
    }
  });

  it('todas las empresas tienen año de inicio y rol bilingüe', () => {
    for (const key of EMPRESAS) {
      const n = g.nodes.find((x) => x.id === nodeId.empresa(key));
      expect(n?.year, key).toBeGreaterThan(2010);
      expect(n?.role?.es && n?.role?.en, key).toBeTruthy();
    }
  });

  it('es conexo desde self', () => {
    const adj = new Map<string, string[]>();
    for (const e of g.edges) {
      adj.set(e.source, [...(adj.get(e.source) ?? []), e.target]);
      adj.set(e.target, [...(adj.get(e.target) ?? []), e.source]);
    }
    const seen = new Set(['self']);
    const queue = ['self'];
    while (queue.length) for (const next of adj.get(queue.shift()!) ?? []) if (!seen.has(next)) (seen.add(next), queue.push(next));
    expect(seen.size).toBe(g.nodes.length);
  });

  it('es determinista', () => {
    expect(buildGraphModel()).toEqual(g);
  });
});
