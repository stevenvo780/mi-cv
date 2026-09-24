import { describe, expect, it } from 'vitest';
import { productos } from '@/data/frentes';
import { GRAPH_STATS } from '@/graph/generated/stats';
import { buildProofFigures } from '@/content/proof';

describe('cifras de la sección Prueba', () => {
  const figures = buildProofFigures();
  const byId = Object.fromEntries(figures.map((f) => [f.id, f]));

  it('deriva las 8 cifras de los datos', () => {
    expect(figures.map((f) => f.id)).toEqual([
      'sat-tests',
      'logic-profiles',
      'microservices',
      'years',
      'kosmos-repos',
      'paideia-routes',
      'live-products',
      'graph',
    ]);
  });

  it('los valores coinciden con lo que dicen los datos', () => {
    expect(byId['sat-tests'].value.en).toBe('6,333');
    expect(byId['logic-profiles'].value.en).toBe('11');
    expect(byId['microservices'].value.en).toBe('8');
    expect(byId['years'].value.en).toBe('12+');
    expect(byId['kosmos-repos'].value.en).toBe('16');
    expect(byId['paideia-routes'].value.en).toBe('227');
    expect(byId['live-products'].value.en).toBe(String(productos.filter((p) => p.status === 'live').length));
    expect(byId['graph'].value.en).toBe(`${GRAPH_STATS.nodes} · ${GRAPH_STATS.edges}`);
  });

  it('cada cifra declara su fuente', () => {
    for (const f of figures) expect(f.source.length).toBeGreaterThan(0);
  });
});
