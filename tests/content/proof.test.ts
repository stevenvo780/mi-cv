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

  it('los valores en español coinciden con lo que dicen los datos', () => {
    expect(byId['sat-tests'].value.es).toBe('6 333');
    expect(byId['logic-profiles'].value.es).toBe('11');
    expect(byId['microservices'].value.es).toBe('8');
    expect(byId['years'].value.es).toBe('12+');
    expect(byId['kosmos-repos'].value.es).toBe('16');
    expect(byId['paideia-routes'].value.es).toBe('227');
  });

  // Cada cifra se extrae con dos regex sobre dos textos (descripcion.es y descripcion.en): si solo se actualiza
  // uno, /es y /en mostrarían cifras distintas. Se comparan los dígitos, sin separadores de miles.
  it('cada cifra es la misma en ES y en EN', () => {
    for (const f of figures) {
      expect(f.value.es.replace(/\D/g, ''), f.id).toBe(f.value.en.replace(/\D/g, ''));
      expect(f.value.es.replace(/\D/g, '').length, f.id).toBeGreaterThan(0);
    }
  });

  it('cada cifra declara su fuente', () => {
    for (const f of figures) expect(f.source.length).toBeGreaterThan(0);
  });
});
