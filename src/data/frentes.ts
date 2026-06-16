/* ================================================================
   FRENTES — typed, bilingual (ES/EN) data for the brand portal.
   Sources:
     - INeedMoney/docs/05-activos/productos-desplegados-2026-06.md
     - INeedMoney/docs/03-perfil-y-marca/portal-marca-3-frentes.md
     - src/app/components/Portafolio/common.ts (raw URLs)
   Front assignment: 4 frentes (Filosofía · Ciencias · Ingeniería · Enterprise).
   Enterprise = la suite corporativa Prizma, como 4º frente de la galería.
   NOTE: never invent URLs. status:'soon' = sin dominio propio aún.
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
  /** Visible Greek wordmark for the product (e.g. "Kósmos"). */
  nombre: string;
  /** One-line bilingual "what it is", shown under the Greek name. */
  subtitulo?: LocalizedText;
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
  /** Product type override, e.g. 'ponencia' for academic talks/presentations. */
  tipo?: 'ponencia';
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
    secNo: '02',
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
    secNo: '03',
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
    nombre: { es: 'Ingeniería', en: 'Engineering' },
    secNo: '01',
    tagline: {
      es: '12+ años de backend, IA agéntica, devtools y software de negocio.',
      en: '12+ years of backend, agentic AI, devtools and business software.',
    },
    descripcion: {
      es: 'El frente del ingeniero: más de 12 años de backend, IA agéntica, lógica computacional, devtools OSS, arquitectura multi-tenant y starter kits para PYME. La columna vertebral técnica.',
      en: 'The engineer front: 12+ years of backend, agentic AI, computational logic, OSS devtools, multi-tenant architecture and SMB starter kits. The technical backbone.',
    },
  },
  enterprise: {
    id: 'enterprise',
    nombre: { es: 'Enterprise', en: 'Enterprise' },
    secNo: '04',  // keeps last (1 product)
    tagline: {
      es: 'Software empresarial de producción: la suite Prizma.',
      en: 'Production business software: the Prizma suite.',
    },
    descripcion: {
      es: 'El frente empresarial: Prizma, suite modular para PYME y comercio (POS con facturación DIAN, crédito sin interés, marketing por WhatsApp, e-commerce conversacional y CRM). NestJS + Next.js sobre Cloud Run.',
      en: 'The business front: Prizma, a modular suite for SMBs and commerce (POS with e-invoicing, interest-free credit, WhatsApp marketing, conversational e-commerce and CRM). NestJS + Next.js on Cloud Run.',
    },
  },
};

// Ordered descending by product count: informatica(10) > filosofia(4) > ciencias(2) > enterprise(1)
export const frenteOrder: FrenteId[] = [
  'informatica',
  'filosofia',
  'ciencias',
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
    nombre: 'Paideía',
    subtitulo: {
      es: 'Portal de humanidades',
      en: 'Humanities portal',
    },
    descripcion: {
      es: 'Portal de humanidades digitales: Griego Clásico, Neurofilosofía y Filosofía de la Ciudad. 227 rutas estáticas de contenido académico en MDX.',
      en: 'Digital humanities portal: Classical Greek, Neurophilosophy and Philosophy of the City. 227 static routes of academic content in MDX.',
    },
    url: 'https://paideia.stevenvallejo.com',
    repo: 'https://github.com/stevenvo780/clavis',
    status: 'live',
    badge: { es: 'Humanidades digitales', en: 'Digital humanities' },
    featured: true,
  },
  {
    id: 'debatesuite',
    frente: 'filosofia',
    nombre: 'Agón',
    subtitulo: {
      es: 'Moderador de debates',
      en: 'Debate moderator',
    },
    descripcion: {
      es: 'Moderador de debates (timer, turnos, falacias) y simulador de dinámicas con autómata celular. PWA con uso offline.',
      en: 'Debate moderator (timer, turns, fallacies) and dynamics simulator with a cellular automaton. Offline-capable PWA.',
    },
    url: 'https://agon.stevenvallejo.com',
    repo: 'https://github.com/stevenvo780/debatesuite',
    status: 'live',
    badge: { es: 'PWA offline', en: 'Offline PWA' },
  },
  {
    id: 'estructuras-preontologicas',
    frente: 'filosofia',
    nombre: 'Estructuras Preontológicas',
    subtitulo: {
      es: 'Tesis doctoral · Filosofía de la ciencia',
      en: 'Doctoral thesis · Philosophy of science',
    },
    descripcion: {
      es: 'Tesis doctoral en filosofía de la ciencia y ciencias de la complejidad: propone que todo fenómeno empírico está anclado en un sustrato material dinámico, y que las categorías con que lo pensamos son "estructuras pre-ontológicas" (regularidades operativas anteriores a la objetualidad), validadas mediante compresión multiescala y evidencia EDI multidominio. Autoría: Jacob Agudelo (UdeA) + Steven Vallejo (ing. computacional).',
      en: 'Doctoral thesis in philosophy of science and complexity sciences: proposes that every empirical phenomenon is anchored in a dynamic material substrate, and that the categories by which we think it are "pre-ontological structures" (operative regularities prior to objecthood), validated via multiscale compression and multi-domain EDI evidence. Authored by Jacob Agudelo (UdeA) + Steven Vallejo (computational engineering).',
    },
    url: 'https://estructuras-preontologicas.vercel.app',
    repo: 'https://github.com/stevenvo780/EstructurasPreontologicas',
    status: 'live',
    badge: { es: 'Investigación doctoral', en: 'Doctoral research' },
    featured: true,
  },
  {
    id: 'hinton',
    frente: 'filosofia',
    nombre: 'Redes Neuronales · Hinton',
    descripcion: {
      es: 'Deck sobre redes neuronales y aprendizaje profundo: del perceptrón a la retropropagación, con la mirada de Hinton.',
      en: "Deck on neural networks and deep learning: from the perceptron to backpropagation, through Hinton's lens.",
    },
    url: 'https://hinton.stevenvallejo.com/',
    status: 'live',
    badge: { es: 'Ponencia', en: 'Talk' },
    secondary: true,
    tipo: 'ponencia',
  },

  /* ===================== CIENCIAS ===================== */
  {
    id: 'complexlab',
    frente: 'ciencias',
    nombre: 'Kósmos',
    subtitulo: {
      es: 'Catálogo de simulación científica',
      en: 'Scientific simulation catalogue',
    },
    descripcion: {
      es: 'Catálogo educativo de simulación científica que unifica 16 repos de sistemas complejos, emergencia y filosofía de la ciencia. 22 páginas SSG.',
      en: 'Educational catalogue of scientific simulation unifying 16 repos on complex systems, emergence and philosophy of science. 22 SSG pages.',
    },
    url: 'https://kosmos.stevenvallejo.com',
    repo: 'https://github.com/stevenvo780/complexlab',
    status: 'live',
    badge: { es: '16 repos · 22 páginas', en: '16 repos · 22 pages' },
    featured: true,
  },
  {
    id: 'aporia',
    frente: 'ciencias',
    nombre: 'Áporía',
    subtitulo: {
      es: 'La ciencia en lo absurdo',
      en: 'Science at the edge of the absurd',
    },
    descripcion: {
      es: 'La ciencia en lo absurdo: paradojas, problemas sin solución y las fronteras donde el rigor tropieza con lo inexplicable.',
      en: 'Science at the edge of the absurd: paradoxes, unsolvable problems and the frontiers where rigor meets the inexplicable.',
    },
    status: 'soon',
    badge: { es: 'Próximamente', en: 'Coming soon' },
  },

  /* ===================== INFORMÁTICA ===================== */
  {
    id: 'nlp-to-logic',
    frente: 'informatica',
    nombre: 'Órganon',
    subtitulo: {
      es: 'Lenguaje natural → lógica formal',
      en: 'Natural language → formal logic',
    },
    descripcion: {
      es: 'La joya técnica: escribes en español → auto.logic formaliza → ST ejecuta (lenguaje lógico con SAT solver CDCL propio, 6333 tests).',
      en: 'The technical jewel: write in Spanish → auto.logic formalizes → ST executes (a logic language with a home-grown CDCL SAT solver, 6333 tests).',
    },
    url: 'https://organon.stevenvallejo.com',
    repo: 'https://github.com/stevenvo780/nlp-to-logic',
    status: 'live',
    badge: { es: 'Joya técnica', en: 'Technical jewel' },
    featured: true,
  },
  {
    id: 'stevenai',
    frente: 'informatica',
    nombre: 'Daímon',
    subtitulo: {
      es: 'Pila de IA',
      en: 'AI stack',
    },
    descripcion: {
      es: 'Vitrina de la pila de IA: RAG, LLM local en GGUF, swarm de agentes vía MCP y conversor OCR.',
      en: 'Showcase of the AI stack: RAG, local GGUF LLM, agent swarm over MCP and an OCR converter.',
    },
    url: 'https://daimon.stevenvallejo.com',
    repo: 'https://github.com/stevenvo780/stevenai',
    status: 'live',
    badge: { es: 'Pila de IA', en: 'AI stack' },
  },
  {
    id: 'stevendevbox',
    frente: 'informatica',
    nombre: 'Téchne',
    subtitulo: {
      es: 'Herramientas dev OSS',
      en: 'OSS dev tools',
    },
    descripcion: {
      es: '8 devtools OSS de desarrollo y sistema: Ultimate Terminal, Mission Center Web, clawbar, kratos-jarvis, vaultlog y más.',
      en: '8 OSS dev/system devtools: Ultimate Terminal, Mission Center Web, clawbar, kratos-jarvis, vaultlog and more.',
    },
    url: 'https://techne.stevenvallejo.com',
    repo: 'https://github.com/stevenvo780/stevendevbox',
    status: 'live',
    badge: { es: '8 herramientas OSS', en: '8 OSS tools' },
  },
  {
    id: 'communityos',
    frente: 'informatica',
    nombre: 'Koinonía',
    subtitulo: {
      es: 'Plataforma de comunidades',
      en: 'Community platform',
    },
    descripcion: {
      es: 'Plataforma multi-tenant de comunidades: eventos, biblioteca, ranking y normativa. Next.js 15 + NestJS serverless + Neon + auth Firebase.',
      en: 'Multi-tenant community platform: events, library, ranking and rules. Next.js 15 + serverless NestJS + Neon + Firebase auth.',
    },
    url: 'https://koinonia.stevenvallejo.com',
    repo: 'https://github.com/stevenvo780/communityos',
    status: 'live',
    badge: { es: 'Multi-tenant', en: 'Multi-tenant' },
  },

  /* ── Ingeniería: software de negocio (ex-Enterprise) ── */
  {
    id: 'devkits',
    frente: 'informatica',
    nombre: 'Érgon',
    subtitulo: {
      es: 'Software a medida PYME',
      en: 'Custom SMB software',
    },
    descripcion: {
      es: 'Suite de starter kits para PYME: «el 80% ya está hecho, pagas el customizing». Venta cerrada o micro-SaaS.',
      en: 'Suite of SMB starter kits: "80% is already built, you pay for the customizing". Fixed-scope sale or micro-SaaS.',
    },
    url: 'https://ergon.stevenvallejo.com',
    status: 'live',
    badge: { es: 'Venta cerrada 40/30/30', en: 'Fixed-scope 40/30/30' },
  },
  {
    id: 'devkits-hours',
    frente: 'informatica',
    nombre: 'Chrónos',
    subtitulo: {
      es: 'Horas + cuentas de cobro',
      en: 'Time tracking + invoices',
    },
    descripcion: {
      es: 'Control de horas por empresa/proyecto + cuentas de cobro colombianas (firma, NIT, banco) + reportes PDF.',
      en: 'Time tracking by company/project + Colombian invoices (signature, tax ID, bank) + PDF reports.',
    },
    url: 'https://chronos.stevenvallejo.com',
    status: 'live',
    badge: { es: 'SaaS · ~29k COP/mes', en: 'SaaS · ~29k COP/mo' },
  },
  {
    id: 'devkits-crm',
    frente: 'informatica',
    nombre: 'Xenía',
    subtitulo: {
      es: 'CRM PYME',
      en: 'SMB CRM',
    },
    descripcion: {
      es: 'CRM para PYME colombiana: pipeline kanban, contactos, empresas y negocios, 19 entidades, localizado NIT/COP.',
      en: 'CRM for Colombian SMBs: kanban pipeline, contacts, companies and deals, 19 entities, localized for tax ID/COP.',
    },
    url: 'https://xenia.stevenvallejo.com',
    status: 'live',
    badge: { es: 'CRM PYME', en: 'SMB CRM' },
  },
  {
    id: 'scrapekit',
    frente: 'informatica',
    nombre: 'Nómos',
    subtitulo: {
      es: 'Scraping legal',
      en: 'Legal scraping',
    },
    descripcion: {
      es: 'Indexa documentos legislativos (Cámara/Senado CO + Cámara RD) con búsqueda full-text. FastAPI + Neon.',
      en: 'Indexes legislative documents (CO House/Senate + DR House) with full-text search. FastAPI + Neon.',
    },
    url: 'https://nomos.stevenvallejo.com',
    status: 'live',
    badge: { es: 'Llave en mano o SaaS', en: 'Turnkey or SaaS' },
  },
  {
    id: 'warehouse',
    frente: 'informatica',
    nombre: 'Apothḗke',
    subtitulo: {
      es: 'Inventario',
      en: 'Inventory',
    },
    descripcion: {
      es: 'Gestión de almacén e inventario: stock, órdenes, movimientos, roles y exportación a PDF/Excel.',
      en: 'Warehouse and inventory management: stock, orders, movements, roles and PDF/Excel export.',
    },
    url: 'https://apotheke.stevenvallejo.com',
    status: 'live',
    badge: { es: 'Venta cerrada PYME', en: 'Fixed-scope SMB sale' },
  },
  {
    id: 'eikon',
    frente: 'informatica',
    nombre: 'Eikón',
    subtitulo: {
      es: 'Generador de imagen de marca',
      en: 'Brand image generator',
    },
    descripcion: {
      es: 'Generador de imagen de marca: logos, paletas, activos visuales y kits de identidad con IA.',
      en: 'Brand image generator: logos, palettes, visual assets and identity kits powered by AI.',
    },
    status: 'soon',
    badge: { es: 'Próximamente', en: 'Coming soon' },
  },

  /* ===================== ENTERPRISE ===================== */
  {
    id: 'prizma',
    frente: 'enterprise',
    nombre: 'Prizma',
    subtitulo: {
      es: 'Suite empresarial modular',
      en: 'Modular business suite',
    },
    descripcion: {
      es: 'Suite corporativa modular: POS con facturación DIAN (Talanton), crédito sin interés (Pistis), marketing por WhatsApp (Iris), e-commerce conversacional (Hermes), logística de última milla (Talaria) y CRM, orquestados por un hub de eventos (Nous). NestJS + Next.js sobre Cloud Run.',
      en: 'Modular corporate suite: POS with e-invoicing (Talanton), interest-free credit (Pistis), WhatsApp marketing (Iris), conversational e-commerce (Hermes), last-mile logistics (Talaria) and CRM, orchestrated by an event hub (Nous). NestJS + Next.js on Cloud Run.',
    },
    url: 'https://prisma-enterprice.cloud',
    status: 'live',
    badge: { es: 'Suite empresarial', en: 'Business suite' },
    featured: true,
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
      label: { es: 'CV Filósofo', en: 'Philosophy CV' },
      url: 'https://filosofo.stevenvallejo.com',
    },
    {
      label: { es: 'Blog · Scholḗ', en: 'Blog · Scholḗ' },
      url: 'https://blog.stevenvallejo.com',
    },
  ],
  informatica: [
    {
      label: { es: 'CV Informático', en: 'Engineering CV' },
      url: 'https://informatico.stevenvallejo.com',
    },
    {
      label: { es: 'Servicios', en: 'Services' },
      url: 'https://services.stevenvallejo.com',
    },
  ],
};
