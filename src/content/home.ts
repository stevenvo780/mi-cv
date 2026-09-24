import { frenteOrder, productos } from '@/data/frentes';
import type { NodeKind } from '@/graph/model';
import type { Locale } from '@/lib/site';

const COUNT_WORDS: Record<Locale, readonly string[]> = {
  es: ['Dos', 'Tres', 'Cuatro', 'Cinco', 'Seis', 'Siete', 'Ocho', 'Nueve', 'Diez'],
  en: ['Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'],
};

/** Numeral en palabras (2–10) para un título: la home no escribe cifras a mano, las deriva de los datos. */
export function countWord(locale: Locale, n: number): string {
  const word = COUNT_WORDS[locale][n - 2];
  if (!word) throw new Error(`Sin numeral en palabras para ${n} (${locale})`);
  return word;
}

export interface HomeCopy {
  meta: { title: string; description: string; person: string; jobTitle: string[]; knowsAbout: string[] };
  nav: { skip: string; menu: string; catalog: string; contact: string; language: string; services: string };
  hero: {
    kicker: string;
    first: string;
    last: string;
    role: string;
    lead: string;
    services: string;
    cvEngineer: string;
    cvPhilosopher: string;
    figcaption: (nodes: number, edges: number) => string;
    listLink: string;
  };
  fronts: { eyebrow: string; title: string; lead: string; searchLabel: string; searchPlaceholder: string; noResults: string; openFront: string; visit: string; code: string; soon: string };
  contact: { eyebrow: string; title: string; lead: string; email: string; whatsapp: string; story: string; social: string; ecosystem: string; foot: string };
  graph: { pause: string; explore: string; openHint: string; present: string; kinds: Record<NodeKind, string> };
}

const KNOWS_ES = [
  'Node.js', 'NestJS', 'TypeScript', 'PostgreSQL', 'Docker', 'Linux', 'Google Cloud Platform', 'Cloud Run', 'APIs REST',
  'Microservicios', 'Integración de LLMs', 'RAG', 'OCR', 'Automatización de procesos', 'React', 'Next.js',
  'Arquitectura de software', 'Orquestación de agentes de IA', 'Lógica formal', 'Filosofía analítica', 'Epistemología',
  'Filosofía de la mente', 'Filosofía de la inteligencia artificial', 'Ética', 'Argumentación', 'Lógica simbólica',
  'Teoría de tipos', 'SAT solving', 'Sistemas complejos',
];
const KNOWS_EN = [
  'Node.js', 'NestJS', 'TypeScript', 'PostgreSQL', 'Docker', 'Linux', 'Google Cloud Platform', 'Cloud Run', 'REST APIs',
  'Microservices', 'LLM integration', 'RAG', 'OCR', 'Process automation', 'React', 'Next.js',
  'Software architecture', 'AI agent orchestration', 'Formal logic', 'Analytic philosophy', 'Epistemology',
  'Philosophy of mind', 'Philosophy of artificial intelligence', 'Ethics', 'Argumentation', 'Symbolic logic',
  'Type theory', 'SAT solving', 'Complex systems',
];

export const HOME: Record<Locale, HomeCopy> = {
  es: {
    meta: {
      title: 'Steven Vallejo Ortiz — Portafolio y catálogo de proyectos',
      description:
        'Catálogo de mis trabajos: productos SaaS, laboratorios de lógica y sistemas complejos, IA y humanidades digitales. Cada uno enlaza a su propio sitio.',
      person: 'Ingeniero de software y filósofo. Backend, IA agéntica y lógica formal.',
      jobTitle: ['Ingeniero de software', 'Filósofo'],
      knowsAbout: KNOWS_ES,
    },
    nav: {
      skip: 'Saltar al contenido',
      menu: 'Menú',
      catalog: 'Catálogo',
      contact: 'Contacto',
      language: 'English',
      services: 'Servicios',
    },
    hero: {
      kicker: 'Mouseîon · stevenvallejo.com',
      first: 'Steven',
      last: 'Vallejo Ortiz',
      role: 'Ingeniero de software · Filósofo',
      lead: 'Todos mis trabajos, cada uno en su propio sitio.',
      services: 'Servicios',
      cvEngineer: 'CV Informático',
      cvPhilosopher: 'CV Filósofo',
      figcaption: (nodes, edges) => `Este grafo es el mapa de mis trabajos: ${nodes} nodos, ${edges} relaciones reales`,
      listLink: 'Verlo como catálogo',
    },
    fronts: {
      eyebrow: `${countWord('es', frenteOrder.length)} frentes · ${productos.length} trabajos`,
      title: 'Catálogo · todos mis trabajos',
      lead: 'Cada uno es un sitio o un proyecto propio: entra directo a su versión actual.',
      searchLabel: 'Buscar en el catálogo',
      searchPlaceholder: 'Producto, tecnología o tema…',
      noResults: 'Sin resultados. Prueba con otro término.',
      openFront: 'Explorar el frente',
      visit: 'Visitar',
      code: 'Código',
      soon: 'Próximamente',
    },
    contact: {
      eyebrow: 'Contacto',
      title: 'Hablemos',
      lead: 'Un proyecto, una consultoría o una conversación sobre lógica: escríbeme por donde prefieras.',
      email: 'Correo',
      whatsapp: 'WhatsApp',
      story: 'Mi historia',
      social: 'Redes',
      ecosystem: 'Ecosistema',
      foot: 'Pensar antes de construir: ese es todo el método.',
    },
    graph: {
      pause: 'Pausar la animación del grafo',
      explore: 'Explorar el grafo en 3D',
      openHint: 'Clic para abrir',
      present: 'Actualidad',
      kinds: { self: 'Yo', frente: 'Frente', empresa: 'Empresa', producto: 'Producto', grupo: 'Familia de herramientas', tecnologia: 'Tecnología', concepto: 'Concepto' },
    },
  },
  en: {
    meta: {
      title: 'Steven Vallejo Ortiz — Portfolio and project catalog',
      description:
        'Catalog of my work: SaaS products, logic and complex-systems labs, AI and digital humanities. Each one links to its own site.',
      person: 'Software engineer and philosopher. Backend, agentic AI and formal logic.',
      jobTitle: ['Software engineer', 'Philosopher'],
      knowsAbout: KNOWS_EN,
    },
    nav: {
      skip: 'Skip to content',
      menu: 'Menu',
      catalog: 'Catalog',
      contact: 'Contact',
      language: 'Español',
      services: 'Services',
    },
    hero: {
      kicker: 'Mouseîon · stevenvallejo.com',
      first: 'Steven',
      last: 'Vallejo Ortiz',
      role: 'Software engineer · Philosopher',
      lead: 'All my work, each piece on a site of its own.',
      services: 'Services',
      cvEngineer: 'Engineering CV',
      cvPhilosopher: 'Philosophy CV',
      figcaption: (nodes, edges) => `This graph maps my work: ${nodes} nodes, ${edges} real relations`,
      listLink: 'See it as a catalog',
    },
    fronts: {
      eyebrow: `${countWord('en', frenteOrder.length)} fronts · ${productos.length} works`,
      title: 'Catalog · all my work',
      lead: 'Each one is a site or a project of its own: go straight to its current version.',
      searchLabel: 'Search the catalog',
      searchPlaceholder: 'Product, technology or topic…',
      noResults: 'No results. Try another term.',
      openFront: 'Explore the front',
      visit: 'Visit',
      code: 'Code',
      soon: 'Coming soon',
    },
    contact: {
      eyebrow: 'Contact',
      title: 'Let’s talk',
      lead: 'A project, some consulting or a conversation about logic: write to me wherever suits you.',
      email: 'Email',
      whatsapp: 'WhatsApp',
      story: 'My story',
      social: 'Social',
      ecosystem: 'Ecosystem',
      foot: 'Think before you build: that is the whole method.',
    },
    graph: {
      pause: 'Pause the graph animation',
      explore: 'Explore the graph in 3D',
      openHint: 'Click to open',
      present: 'Present',
      kinds: { self: 'Me', frente: 'Front', empresa: 'Company', producto: 'Product', grupo: 'Tool family', tecnologia: 'Technology', concepto: 'Concept' },
    },
  },
};
