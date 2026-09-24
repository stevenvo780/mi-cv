import { describe, expect, it } from 'vitest';
import { productos } from '@/data/frentes';
import { buildHomeJsonLd, currentEmployers, serializeJsonLd } from '@/lib/jsonld';

const facts = { jobTitle: ['Ingeniero de software', 'Filósofo'], description: 'd', knowsAbout: ['Lógica formal'] };

describe('JSON-LD de la home', () => {
  const ld = buildHomeJsonLd('es', facts, '2026-09-23');
  const graph = ld['@graph'] as Record<string, unknown>[];

  it('publica WebSite, ProfilePage, Person e ItemList sin SearchAction', () => {
    expect(graph.map((n) => n['@type'])).toEqual(['WebSite', 'ProfilePage', 'Person', 'ItemList']);
    expect(JSON.stringify(ld)).not.toContain('SearchAction');
  });

  it('usa el dominio con www y el LinkedIn correcto', () => {
    const person = graph[2] as { url: string; sameAs: string[] };
    expect(person.url).toBe('https://www.stevenvallejo.com');
    expect(person.sameAs).toContain('https://www.linkedin.com/in/steven-vallejo/');
    expect(JSON.stringify(ld)).not.toMatch(/https:\/\/stevenvallejo\.com/);
  });

  it('lista los productos en vivo con URL', () => {
    const list = graph[3] as { itemListElement: unknown[] };
    expect(list.itemListElement).toHaveLength(productos.filter((p) => p.url && p.status === 'live').length);
  });

  it('el ItemList no repite las descripciones que ya están en las tarjetas (peso del HTML, spec §5.2)', () => {
    const list = graph[3] as { itemListElement: { item: Record<string, unknown> }[] };
    for (const { item } of list.itemListElement) {
      expect(Object.keys(item).sort()).toEqual(['@type', 'name', 'url']);
      expect(item.url).toMatch(/^https:\/\//);
    }
  });

  it('declara como empleadores actuales solo las empresas abiertas no freelance', () => {
    expect(currentEmployers().map((o) => o.name)).toEqual(['Humanizar Systems', 'Finca Directa S.A.S']);
  });

  it('escapa "<" al serializar', () => {
    expect(serializeJsonLd({ a: '</script>' })).toBe('{"a":"\\u003c/script>"}');
  });
});
