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
  /**
   * Render this product as a full-width SHOWCASE BANNER (horizontal og_product
   * cover, big radius) at the TOP of its section — even when the section also
   * holds grid cards below. Used for the "big" products that deserve a wide
   * plate in a multi-product front (e.g. Ágora in Filosofía). The remaining
   * non-banner products in the same section keep the uniform 2-col portrait grid.
   */
  banner?: boolean;
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
    secNo: '02',  // 3 products: Ágora (banner) + Paideía + Agón (grid-portrait)
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
    secNo: '03',  // 2 products (grid-portrait)
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
    secNo: '01',  // 11 products (grid-portrait)
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
    secNo: '04',  // keeps last (1 product → showcase)
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

// Ordered descending by product count: informatica(11) > filosofia(3) > ciencias(2) > enterprise(1)
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
  // Ágora es de las "grandes": va PRIMERO y como BANNER full-width (showcase
  // horizontal con su og_product), no como card de grid. Debajo, Paideía + Agón
  // siguen en el grid 2-col portrait normal.
  {
    id: 'agora',
    frente: 'filosofia',
    nombre: 'Ágora',
    subtitulo: {
      es: 'Plataforma académica · Elenxos',
      en: 'Academic platform · Elenxos',
    },
    descripcion: {
      es: 'Plataforma académica en vivo (Elenxos): traduce el caos en estructuras lógicas. Integra ST (lenguaje lógico con SAT solver CDCL propio, 6 333 tests), auto.logic (NLP → lógica formal por reglas, 11 perfiles) y colaboración en tiempo real para razonamiento compartido. NestJS + Next.js sobre Docker.',
      en: 'Live academic platform (Elenxos): turns chaos into logical structures. It bundles ST (a logic language with a home-grown CDCL SAT solver, 6,333 tests), auto.logic (rule-based NLP → formal logic, 11 profiles) and real-time collaboration for shared reasoning. NestJS + Next.js on Docker.',
    },
    url: 'https://agora.elenxos.com',
    status: 'live',
    badge: { es: 'Plataforma académica', en: 'Academic platform' },
    featured: true,
    banner: true,
  },
  {
    id: 'clavis',
    frente: 'filosofia',
    nombre: 'Paideía',
    subtitulo: {
      es: 'Portal de humanidades',
      en: 'Humanities portal',
    },
    descripcion: {
      es: 'Portal de humanidades digitales con 227 rutas estáticas en MDX: Griego Clásico (morfología, traducciones, glosario), Neurofilosofía (210 archivos en 10 módulos) y Filosofía de la Ciudad. Next.js 15, sin base de datos, 100% estático — pensado para leerse y citarse como material académico.',
      en: 'Digital humanities portal with 227 static MDX routes: Classical Greek (morphology, translations, glossary), Neurophilosophy (210 files across 10 modules) and Philosophy of the City. Next.js 15, no database, fully static — built to be read and cited as academic material.',
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
      es: 'PWA offline para moderar debates académicos y competitivos: gestiona turnos, cronómetro, puntuación y detección de falacias, e incluye un simulador de dinámicas con autómata celular (canvas 2D) heredado de la investigación en sistemas complejos.',
      en: 'Offline PWA to moderate academic and competitive debates: manages turns, timer, scoring and fallacy detection, and bundles a dynamics simulator with a cellular automaton (2D canvas) inherited from the complex-systems research.',
    },
    url: 'https://agon.stevenvallejo.com',
    repo: 'https://github.com/stevenvo780/debatesuite',
    status: 'live',
    badge: { es: 'PWA offline', en: 'Offline PWA' },
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
      es: 'Catálogo educativo interactivo de 16 repos en sistemas complejos, emergencia y cómputo científico: ABM y ODE acoplados, una métrica de emergencia propia (EDI) y su fundamento en realismo estructural operativo. 22 páginas SSG, sin base de datos, todo estático.',
      en: 'Interactive educational catalogue of 16 repos on complex systems, emergence and scientific computation: coupled ABM and ODE models, a home-grown emergence metric (EDI) and its grounding in operative structural realism. 22 SSG pages, no database, fully static.',
    },
    url: 'https://kosmos.stevenvallejo.com',
    repo: 'https://github.com/stevenvo780/complexlab',
    status: 'live',
    badge: { es: '16 repos · 22 páginas', en: '16 repos · 22 pages' },
    featured: true,
  },
  {
    id: 'estructuras-preontologicas',
    frente: 'ciencias',
    nombre: 'Estructuras Preontológicas',
    subtitulo: {
      es: 'Tesis doctoral · Filosofía de la ciencia',
      en: 'Doctoral thesis · Philosophy of science',
    },
    descripcion: {
      es: 'Tesis doctoral (Jacob Agudelo + Steven Vallejo, UdeA) en filosofía de la ciencia y ciencias de la complejidad: propone las "estructuras pre-ontológicas" como regularidades operativas previas a la objetualidad, ancladas en un sustrato material dinámico y validadas con la métrica EDI y compresión multiescala sobre evidencia multidominio. Rigor cuantitativo y fundamentación ontológica en un mismo programa.',
      en: 'Doctoral thesis (Jacob Agudelo + Steven Vallejo, UdeA) in philosophy of science and complexity sciences: proposes "pre-ontological structures" as operative regularities prior to objecthood, anchored in a dynamic material substrate and validated with the EDI metric and multiscale compression over multi-domain evidence. Quantitative rigor and ontological grounding in a single program.',
    },
    url: 'https://estructuras-preontologicas.vercel.app',
    repo: 'https://github.com/stevenvo780/EstructurasPreontologicas',
    status: 'live',
    badge: { es: 'Investigación doctoral', en: 'Doctoral research' },
    featured: true,
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
      es: 'La joya técnica, en vivo: escribes en español → autologic (formalizador NLP por reglas) lo traduce → ST lo ejecuta (lenguaje lógico con SAT solver CDCL propio, 6 333 tests). Sin IA y sin base de datos: todo corre en proceso, serverless sobre Vercel.',
      en: 'The technical jewel, live: write in Spanish → autologic (rule-based NLP formalizer) translates it → ST executes it (a logic language with a home-grown CDCL SAT solver, 6,333 tests). No AI, no database: it all runs in-process, serverless on Vercel.',
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
      es: 'Vitrina de la pila de IA personal: Jarvis v1/v2 (RAG sobre ChromaDB, modelos 14B–70B), chat GGUF local con llama-cpp-python, swarm MCP con Ollama (deepseek-r1 + qwen2.5) y un conversor OCR PDF→Markdown en GPU. Documentación estática en Next.js 15: no ejecuta modelos en el servidor.',
      en: 'Showcase of the personal AI stack: Jarvis v1/v2 (RAG over ChromaDB, 14B–70B models), local GGUF chat via llama-cpp-python, an MCP swarm on Ollama (deepseek-r1 + qwen2.5) and a GPU OCR PDF→Markdown converter. Static docs in Next.js 15: no models run on the server.',
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
      es: 'Documentación y showcase de devtools OSS para Linux: Ultimate Terminal (control distribuido de máquinas por navegador), Mission Center Web (monitor de recursos sin Electron), clawbar (voz + barra de estado Hyprland con Whisper/Kokoro) e Hyprland Multi-Monitor (workspaces independientes por monitor). Astro Starlight, 100% estático.',
      en: 'Docs and showcase of OSS devtools for Linux: Ultimate Terminal (browser-based distributed machine control), Mission Center Web (Electron-free resource monitor), clawbar (voice + Hyprland status bar with Whisper/Kokoro) and Hyprland Multi-Monitor (independent per-monitor workspaces). Astro Starlight, fully static.',
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
      es: 'Plataforma multi-tenant para comunidades Discord: portal web (eventos, biblioteca, ranking, tienda y roles), API NestJS 10 sobre Neon Postgres y bot discord.js con XP y recompensas por voz. Un solo codebase y una sola BD para múltiples comunidades aisladas por tenantId.',
      en: 'Multi-tenant platform for Discord communities: web portal (events, library, ranking, store and roles), a NestJS 10 API over Neon Postgres and a discord.js bot with XP and voice rewards. A single codebase and database for many communities isolated by tenantId.',
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
      es: 'Landing comercial de una suite de tres starter kits PYME listos para customizar: CRM (React + Vite + Express), Hours Tracker (Next.js 15 + Turso) y VPN Manager (Flask + Docker). Modelo «el 80% ya está hecho, pagas el 20% a medida». Venta cerrada o micro-SaaS.',
      en: 'Commercial landing for a suite of three ready-to-customize SMB starter kits: CRM (React + Vite + Express), Hours Tracker (Next.js 15 + Turso) and VPN Manager (Flask + Docker). Model: "80% is already built, you pay for the 20% custom". Fixed-scope sale or micro-SaaS.',
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
      es: 'App SaaS de control de horas freelance y cuentas de cobro localizadas para Colombia: registro individual o masivo, cálculo de ingresos con tarifa configurable, exportación a PDF, filtros por día de semana y llenado automático por promedios. Next.js 15 + SQLite.',
      en: 'SaaS app for freelance time tracking and Colombia-localized invoices: single or bulk entry, income calculation with configurable rate, PDF export, weekday filters and average-based autofill. Next.js 15 + SQLite.',
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
      es: 'CRM para PYME colombiana con 19 entidades: pipeline kanban, contactos, empresas, negocios, actividades, cotizaciones y facturas. Localizado para NIT, COP, departamentos y tipos societarios. React 19 + Vite + Express + Neon Postgres, desplegado en Vercel.',
      en: 'CRM for Colombian SMBs with 19 entities: kanban pipeline, contacts, companies, deals, activities, quotes and invoices. Localized for tax ID, COP, departments and company types. React 19 + Vite + Express + Neon Postgres, deployed on Vercel.',
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
      es: 'Indexador de documentos legislativos con búsqueda full-text: adapta el scraping a Cámara y Senado de Colombia y Cámara de Diputados de RD mediante un patrón Source Adapter intercambiable sin tocar el pipeline. FastAPI + Neon Postgres + Mangum sobre Vercel serverless.',
      en: 'Legislative document indexer with full-text search: adapts scraping to Colombia’s House and Senate and the DR Chamber of Deputies via a swappable Source Adapter pattern that never touches the pipeline. FastAPI + Neon Postgres + Mangum on Vercel serverless.',
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
      es: 'Sistema de gestión de almacén e inventario: stock, órdenes, movimientos, roles (admin/manager/worker), notificaciones y analítica. React 19 + Vite + Neon Postgres en funciones serverless de Vercel, con seed de datos demo para arrancar de inmediato.',
      en: 'Warehouse and inventory management system: stock, orders, movements, roles (admin/manager/worker), notifications and analytics. React 19 + Vite + Neon Postgres on Vercel serverless functions, with seed demo data to start instantly.',
    },
    url: 'https://apotheke.stevenvallejo.com',
    status: 'live',
    badge: { es: 'Venta cerrada PYME', en: 'Fixed-scope SMB sale' },
  },
  {
    id: 'aporia',
    frente: 'informatica',
    nombre: 'Áporía',
    subtitulo: {
      es: 'CMS editorial científico',
      en: 'Scientific editorial CMS',
    },
    descripcion: {
      es: 'Plataforma editorial full-stack (Next.js 16 + Neon/Postgres + Firebase Auth): publica papers, archiva investigación y corre experimentos colectivos con visualización en tiempo real, con un panel /studio para el CRUD editorial bajo auth real. El nombre evoca la paradoja, pero el producto es infraestructura de publicación científica.',
      en: 'Full-stack editorial platform (Next.js 16 + Neon/Postgres + Firebase Auth): publishes papers, archives research and runs collective experiments with real-time visualization, with a /studio panel for editorial CRUD behind real auth. The name evokes paradox, but the product is scientific publishing infrastructure.',
    },
    status: 'soon',
    badge: { es: 'Próximamente', en: 'Coming soon' },
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
      es: 'Generador del pack de imagen de marca en GPU local (SDXL / FLUX.1-schnell): produce 15+ renders sociales (LinkedIn, Instagram, X, YouTube, WhatsApp, OG) para un media kit completo. Python puro, sin servicio web público — es la herramienta interna que fabrica las portadas de este mismo portafolio.',
      en: 'Local-GPU brand image pack generator (SDXL / FLUX.1-schnell): produces 15+ social renders (LinkedIn, Instagram, X, YouTube, WhatsApp, OG) for a full media kit. Pure Python, no public web service — the internal tool that builds the covers of this very portfolio.',
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
      es: 'Suite corporativa modular en producción sobre Cloud Run: POS con facturación DIAN (Talanton), crédito sin interés (Pistis), marketing por WhatsApp (Iris), e-commerce conversacional (Hermes), logística de última milla (Talaria) y CRM, orquestados por un hub de eventos (Nous). NestJS + Next.js, 8 microservicios desplegados.',
      en: 'Modular corporate suite in production on Cloud Run: POS with DIAN e-invoicing (Talanton), interest-free credit (Pistis), WhatsApp marketing (Iris), conversational e-commerce (Hermes), last-mile logistics (Talaria) and CRM, orchestrated by an event hub (Nous). NestJS + Next.js, 8 deployed microservices.',
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
