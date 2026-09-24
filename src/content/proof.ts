import { frentesMeta, productos } from '@/data/frentes';
import { GRAPH_STATS } from '@/graph/generated/stats';
import type { Bilingual } from '@/graph/model';

export interface ProofFigure {
  id: string;
  value: Bilingual;
  label: Bilingual;
  source: string;
}

function fromDescription(id: string, es: RegExp, en: RegExp): Bilingual | null {
  const p = productos.find((x) => x.id === id);
  const vEs = p?.descripcion.es.match(es)?.[1];
  const vEn = p?.descripcion.en.match(en)?.[1];
  return vEs && vEn ? { es: vEs.replace(/\s/g, ' '), en: vEn } : null;
}

export function buildProofFigures(): ProofFigure[] {
  const live = String(productos.filter((p) => p.status === 'live').length);
  const years = {
    es: frentesMeta.informatica.tagline.es.match(/(\d+\+) años/)?.[1],
    en: frentesMeta.informatica.tagline.en.match(/(\d+\+) years/)?.[1],
  };
  const candidates: (ProofFigure | null)[] = [
    wrap('sat-tests', fromDescription('nlp-to-logic', /(\d[\d\s  .]*\d) tests/, /(\d[\d,]*\d) tests/), {
      es: 'tests en el SAT solver CDCL propio de ST (Órganon y Ágora)',
      en: "tests in ST's home-grown CDCL SAT solver (Órganon and Ágora)",
    }, 'frentes.ts · nlp-to-logic'),
    wrap('logic-profiles', fromDescription('agora', /(\d+) perfiles/, /(\d+) profiles/), {
      es: 'perfiles lógicos en auto.logic',
      en: 'logic profiles in auto.logic',
    }, 'frentes.ts · agora'),
    wrap('microservices', fromDescription('prizma', /(\d+) microservicios/, /(\d+) deployed microservices/), {
      es: 'microservicios de Prizma en producción, con facturación DIAN',
      en: 'Prizma microservices in production, with DIAN e-invoicing',
    }, 'frentes.ts · prizma'),
    wrap('years', years.es && years.en ? { es: years.es, en: years.en } : null, {
      es: 'años construyendo backend, IA agéntica y devtools',
      en: 'years building backends, agentic AI and devtools',
    }, 'frentes.ts · frentesMeta.informatica'),
    wrap('kosmos-repos', fromDescription('complexlab', /(\d+) repos/, /(\d+) repos/), {
      es: 'repositorios de sistemas complejos en Kósmos',
      en: 'complex-systems repositories in Kósmos',
    }, 'frentes.ts · complexlab'),
    wrap('paideia-routes', fromDescription('clavis', /(\d+) rutas/, /(\d+) static MDX routes/), {
      es: 'rutas de humanidades digitales en Paideía',
      en: 'digital-humanities routes in Paideía',
    }, 'frentes.ts · clavis'),
    wrap('live-products', { es: live, en: live }, { es: 'productos en producción', en: 'products in production' }, 'frentes.ts · status live'),
    wrap('graph', { es: `${GRAPH_STATS.nodes} · ${GRAPH_STATS.edges}`, en: `${GRAPH_STATS.nodes} · ${GRAPH_STATS.edges}` }, {
      es: 'nodos y relaciones en el grafo de esta página',
      en: "nodes and relations in this page's graph",
    }, 'graph/generated/stats.ts'),
  ];
  return candidates.filter((f): f is ProofFigure => f !== null);
}

function wrap(id: string, value: Bilingual | null, label: Bilingual, source: string): ProofFigure | null {
  return value ? { id, value, label, source } : null;
}
