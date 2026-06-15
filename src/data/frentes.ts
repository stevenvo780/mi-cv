/* ================================================================
   FRENTES — typed, bilingual (ES/EN) data for the brand portal.
   Sources:
     - INeedMoney/docs/05-activos/productos-desplegados-2026-06.md
     - INeedMoney/docs/03-perfil-y-marca/portal-marca-4-frentes.md
     - src/app/components/Portafolio/common.ts (raw URLs)
   Front assignment follows portal-marca-4-frentes.md.
   NOTE: never invent URLs. PRISMA is status:'soon' (no URL) by design —
   flip to 'live' + add url the day it ships, zero refactor.
   ================================================================ */

export type FrenteId = 'filosofia' | 'ciencias' | 'informatica' | 'enterprise';
export type ProductStatus = 'live' | 'soon';

export interface LocalizedText {
  es: string;
  en: string;
}

export interface Producto {
  id: string;
  frente: FrenteId;
  nombre: string;
  descripcion: LocalizedText;
  /** Live public URL. Absent for status:'soon'. */
  url?: string;
  /** Public repo URL when available. */
  repo?: string;
  status: ProductStatus;
  /** Short business/model/type tag, bilingual. */
  badge?: LocalizedText;
  /** Visually featured (e.g. the technical jewel, the PRISMA slot). */
  featured?: boolean;
  /** Secondary card shown nested under a primary product. */
  secondary?: boolean;
}

export interface FrenteMeta {
  id: FrenteId;
  nombre: LocalizedText;
  /** Short eyebrow / section number for the mono kicker. */
  secNo: string;
  tagline: LocalizedText;
  descripcion: LocalizedText;
}

/* ---------------------------------------------------------------- */
/* Front metadata                                                    */
/* ---------------------------------------------------------------- */
export const frentesMeta: Record<FrenteId, FrenteMeta> = {
  filosofia: {
    id: 'filosofia',
    nombre: { es: 'Filosofía', en: 'Philosophy' },
    secNo: '01',
    tagline: {
      es: 'El criterio que da forma a todo lo demás.',
      en: 'The judgment that shapes everything else.',
    },
    descripcion: {
      es: 'Filosofía analítica, lógica formal y simbólica, filosofía de la mente y de la IA, y filosofía de la ciudad. El registro humanístico que da criterio a la ingeniería.',
      en: 'Analytic philosophy, formal and symbolic logic, philosophy of mind and of AI, and philosophy of the city. The humanistic register that gives engineering its judgment.',
    },
  },
  ciencias: {
    id: 'ciencias',
    nombre: { es: 'Ciencias', en: 'Sciences' },
    secNo: '02',
    tagline: {
      es: 'Sistemas complejos, emergencia, simulación.',
      en: 'Complex systems, emergence, simulation.',
    },
    descripcion: {
      es: 'El frente del investigador: sistemas complejos, emergencia, simulación científica, filosofía de la ciencia y cómputo. Rigor cuantitativo y curiosidad de laboratorio.',
      en: 'The researcher front: complex systems, emergence, scientific simulation, philosophy of science and computation. Quantitative rigor with lab curiosity.',
    },
  },
  informatica: {
    id: 'informatica',
    nombre: { es: 'Informática', en: 'Computer Science' },
    secNo: '03',
    tagline: {
      es: '10+ años de backend, IA agéntica, devtools.',
      en: '10+ years of backend, agentic AI, devtools.',
    },
    descripcion: {
      es: 'El frente del ingeniero: más de 10 años de backend, IA agéntica, lógica computacional, devtools OSS y arquitectura multi-tenant. La columna vertebral técnica.',
      en: 'The engineer front: 10+ years of backend, agentic AI, computational logic, OSS devtools and multi-tenant architecture. The technical backbone.',
    },
  },
  enterprise: {
    id: 'enterprise',
    nombre: { es: 'Enterprise', en: 'Enterprise' },
    secNo: '04',
    tagline: {
      es: 'Software que genera caja para PYME y empresa.',
      en: 'Software that drives revenue for SMBs and enterprise.',
    },
    descripcion: {
      es: 'El frente comercial: la suite que genera caja para PYME y empresa, el legado vivo de Humanizar, y el lugar reservado para PRISMA.',
      en: 'The commercial front: the suite that drives revenue for SMBs and enterprise, the living legacy of Humanizar, and the reserved slot for PRISMA.',
    },
  },
};

export const frenteOrder: FrenteId[] = [
  'filosofia',
  'ciencias',
  'informatica',
  'enterprise',
];

/* ---------------------------------------------------------------- */
/* Products                                                          */
/* ---------------------------------------------------------------- */
export const productos: Producto[] = [
  /* ===================== FILOSOFÍA ===================== */
  {
    id: 'clavis',
    frente: 'filosofia',
    nombre: 'Clavis',
    descripcion: {
      es: 'Portal de humanidades digitales: Griego Clásico, Neurofilosofía y Filosofía de la Ciudad. 227 rutas estáticas de contenido académico en MDX.',
      en: 'Digital humanities portal: Classical Greek, Neurophilosophy and Philosophy of the City. 227 static routes of academic content in MDX.',
    },
    url: 'https://clavis-weld.vercel.app',
    repo: 'https://github.com/stevenvo780/clavis',
    status: 'live',
    badge: { es: 'Humanidades digitales', en: 'Digital humanities' },
    featured: true,
  },
  {
    id: 'debatesuite',
    frente: 'filosofia',
    nombre: 'DebateSuite',
    descripcion: {
      es: 'Moderador de debates (timer, turnos, falacias) y simulador de dinámicas con autómata celular. PWA con uso offline.',
      en: 'Debate moderator (timer, turns, fallacies) and dynamics simulator with a cellular automaton. Offline-capable PWA.',
    },
    url: 'https://debatesuite.vercel.app',
    repo: 'https://github.com/stevenvo780/debatesuite',
    status: 'live',
    badge: { es: 'PWA offline', en: 'Offline PWA' },
  },

  /* ===================== CIENCIAS ===================== */
  {
    id: 'complexlab',
    frente: 'ciencias',
    nombre: 'ComplexLab',
    descripcion: {
      es: 'Catálogo educativo de simulación científica que unifica 16 repos de sistemas complejos, emergencia y filosofía de la ciencia. 22 páginas SSG.',
      en: 'Educational catalogue of scientific simulation unifying 16 repos on complex systems, emergence and philosophy of science. 22 SSG pages.',
    },
    url: 'https://complexlab.vercel.app',
    repo: 'https://github.com/stevenvo780/complexlab',
    status: 'live',
    badge: { es: '16 repos · 22 páginas', en: '16 repos · 22 pages' },
    featured: true,
  },
  {
    id: 'hinton',
    frente: 'ciencias',
    nombre: 'Redes Neuronales · Hinton',
    descripcion: {
      es: 'Deck sobre redes neuronales y aprendizaje profundo: del perceptrón a la retropropagación, con la mirada de Hinton.',
      en: 'Deck on neural networks and deep learning: from the perceptron to backpropagation, through Hinton’s lens.',
    },
    url: 'https://hinton.stevenvallejo.com/',
    status: 'live',
    badge: { es: 'Deck', en: 'Deck' },
    secondary: true,
  },

  /* ===================== INFORMÁTICA ===================== */
  {
    id: 'nlp-to-logic',
    frente: 'informatica',
    nombre: 'NLP-to-Logic',
    descripcion: {
      es: 'La joya técnica: escribes en español → auto.logic formaliza → ST ejecuta (lenguaje lógico con SAT solver CDCL propio, 6333 tests).',
      en: 'The technical jewel: write in Spanish → auto.logic formalizes → ST executes (a logic language with a home-grown CDCL SAT solver, 6333 tests).',
    },
    url: 'https://nlp-to-logic.vercel.app',
    repo: 'https://github.com/stevenvo780/nlp-to-logic',
    status: 'live',
    badge: { es: 'Joya técnica', en: 'Technical jewel' },
    featured: true,
  },
  {
    id: 'stevenai',
    frente: 'informatica',
    nombre: 'StevenAI Suite',
    descripcion: {
      es: 'Vitrina de la pila de IA: RAG, LLM local en GGUF, swarm de agentes vía MCP y conversor OCR.',
      en: 'Showcase of the AI stack: RAG, local GGUF LLM, agent swarm over MCP and an OCR converter.',
    },
    url: 'https://stevenai.vercel.app',
    repo: 'https://github.com/stevenvo780/stevenai',
    status: 'live',
    badge: { es: 'Pila de IA', en: 'AI stack' },
  },
  {
    id: 'stevendevbox',
    frente: 'informatica',
    nombre: 'StevenDevBox',
    descripcion: {
      es: '8 devtools OSS de desarrollo y sistema: Ultimate Terminal, Mission Center Web, clawbar, kratos-jarvis, vaultlog y más.',
      en: '8 OSS dev/system devtools: Ultimate Terminal, Mission Center Web, clawbar, kratos-jarvis, vaultlog and more.',
    },
    url: 'https://stevendevbox.vercel.app',
    repo: 'https://github.com/stevenvo780/stevendevbox',
    status: 'live',
    badge: { es: '8 herramientas OSS', en: '8 OSS tools' },
  },
  {
    id: 'communityos',
    frente: 'informatica',
    nombre: 'CommunityOS',
    descripcion: {
      es: 'Plataforma multi-tenant de comunidades: eventos, biblioteca, ranking y normativa. Next.js 15 + NestJS serverless + Neon + auth Firebase.',
      en: 'Multi-tenant community platform: events, library, ranking and rules. Next.js 15 + serverless NestJS + Neon + Firebase auth.',
    },
    url: 'https://communityos-liard.vercel.app',
    repo: 'https://github.com/stevenvo780/communityos',
    status: 'live',
    badge: { es: 'Multi-tenant', en: 'Multi-tenant' },
  },

  /* ===================== ENTERPRISE ===================== */
  {
    id: 'prisma',
    frente: 'enterprise',
    nombre: 'PRISMA',
    descripcion: {
      es: 'Humanizar, al siguiente nivel. Próximamente.',
      en: 'Humanizar, at the next level. Coming soon.',
    },
    status: 'soon',
    badge: { es: 'Próximamente', en: 'Coming soon' },
    featured: true,
  },
  {
    id: 'devkits',
    frente: 'enterprise',
    nombre: 'DevKits',
    descripcion: {
      es: 'Suite de starter kits para PYME: «el 80% ya está hecho, pagas el customizing». Venta cerrada o micro-SaaS.',
      en: 'Suite of SMB starter kits: "80% is already built, you pay for the customizing". Fixed-scope sale or micro-SaaS.',
    },
    url: 'https://devkits-psi.vercel.app',
    status: 'live',
    badge: { es: 'Venta cerrada 40/30/30', en: 'Fixed-scope 40/30/30' },
  },
  {
    id: 'devkits-hours',
    frente: 'enterprise',
    nombre: 'DevKits Hours',
    descripcion: {
      es: 'Control de horas por empresa/proyecto + cuentas de cobro colombianas (firma, NIT, banco) + reportes PDF.',
      en: 'Time tracking by company/project + Colombian invoices (signature, tax ID, bank) + PDF reports.',
    },
    url: 'https://devkits-hours.vercel.app',
    status: 'live',
    badge: { es: 'SaaS · ~29k COP/mes', en: 'SaaS · ~29k COP/mo' },
  },
  {
    id: 'devkits-crm',
    frente: 'enterprise',
    nombre: 'DevKits CRM',
    descripcion: {
      es: 'CRM para PYME colombiana: pipeline kanban, contactos, empresas y negocios, 19 entidades, localizado NIT/COP.',
      en: 'CRM for Colombian SMBs: kanban pipeline, contacts, companies and deals, 19 entities, localized for tax ID/COP.',
    },
    url: 'https://devkits-crm.vercel.app',
    status: 'live',
    badge: { es: 'CRM PYME', en: 'SMB CRM' },
  },
  {
    id: 'scrapekit',
    frente: 'enterprise',
    nombre: 'ScrapeKit Colombia',
    descripcion: {
      es: 'Indexa documentos legislativos (Cámara/Senado CO + Cámara RD) con búsqueda full-text. FastAPI + Neon.',
      en: 'Indexes legislative documents (CO House/Senate + DR House) with full-text search. FastAPI + Neon.',
    },
    url: 'https://scrapekit-beta.vercel.app',
    status: 'live',
    badge: { es: 'Llave en mano o SaaS', en: 'Turnkey or SaaS' },
  },
  {
    id: 'warehouse',
    frente: 'enterprise',
    nombre: 'Warehouse',
    descripcion: {
      es: 'Gestión de almacén e inventario: stock, órdenes, movimientos, roles y exportación a PDF/Excel.',
      en: 'Warehouse and inventory management: stock, orders, movements, roles and PDF/Excel export.',
    },
    url: 'https://warehouse-eta-inky.vercel.app',
    status: 'live',
    badge: { es: 'Venta cerrada PYME', en: 'Fixed-scope SMB sale' },
  },
];

/* ---------------------------------------------------------------- */
/* Helpers                                                           */
/* ---------------------------------------------------------------- */
export function productosPorFrente(frente: FrenteId): Producto[] {
  return productos.filter((p) => p.frente === frente);
}

/** Cross-links to the sibling brand sites, per front. */
export interface FrenteLink {
  label: LocalizedText;
  url: string;
}

export const frenteLinks: Partial<Record<FrenteId, FrenteLink[]>> = {
  filosofia: [
    {
      label: { es: 'Portal Filosofía', en: 'Philosophy portal' },
      url: 'https://filosofo.stevenvallejo.com',
    },
    {
      label: { es: 'Blog · Abstracción', en: 'Blog · Abstracción' },
      url: 'https://blog.stevenvallejo.com',
    },
  ],
  informatica: [
    {
      label: { es: 'CV Informático', en: 'Engineering CV' },
      url: 'https://informatico.stevenvallejo.com',
    },
    {
      label: { es: 'Hub · Portafolio', en: 'Hub · Portfolio' },
      url: 'https://portafolio-gamma-roan.vercel.app',
    },
  ],
};
