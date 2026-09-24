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
  /** Card identity for projects outside the Eikon brand catalog. */
  cardIdentity?: { label: LocalizedText; symbol: string };
  /** Visually featured (e.g. the technical jewel, the PRISMA slot). */
  featured?: boolean;
  /** Secondary card shown nested under a primary product. */
  secondary?: boolean;
  /**
   * Product type override: 'ponencia' for academic talks/presentations; 'catalogo' for a site that gathers and
   * links a whole collection of other sites, courses or repos (Humanizar, Paideía, Kósmos, Daímon). A catálogo carries
   * `incluye` and `unidad`, and the home shows it as a big tile of its own (Fronts.tsx).
   */
  tipo?: 'ponencia' | 'catalogo';
  /** Solo catálogos: lo que reúne, ítem a ítem. Toda cifra que la home muestre de un catálogo se deriva de aquí. */
  incluye?: CatalogoItem[];
  /** Solo catálogos: cómo se llaman sus ítems, en plural («proyectos», «obras»). */
  unidad?: LocalizedText;
  /**
   * Render this product as a full-width SHOWCASE BANNER (horizontal og_product
   * cover, big radius) at the TOP of its section — even when the section also
   * holds grid cards below. Used for the "big" products that deserve a wide
   * plate in a multi-product front (e.g. Ágora in Filosofía). The remaining
   * non-banner products in the same section keep the uniform 2-col portrait grid.
   */
  banner?: boolean;
}

/**
 * Colección de un catálogo: las áreas de Kósmos (lib/catalog.ts → CATEGORIES) y de Daímon (lib/catalog-groups.ts),
 * y los tipos de obra de Paideía (cursos de su archivo y app/trabajos/works.ts).
 */
export type CatalogoKind =
  | 'curso'
  | 'ponencia'
  | 'tesis'
  | 'ensayo'
  | 'matematicas'
  | 'fisica'
  | 'sistemas-complejos'
  | 'emergencia'
  | 'computo-cientifico'
  | 'infraestructura'
  | 'asistentes'
  | 'herramientas'
  | 'inferencia'
  | 'producto'
  | 'servicio';

export interface CatalogoItem {
  /**
   * Título tal como lo publica el catálogo. Un texto solo es un nombre propio (Cauce V3, clawbar) o una obra publicada
   * en su idioma (una ponencia, un ensayo) y sale igual en /es y en /en; una etiqueta descriptiva lleva sus dos idiomas.
   */
  nombre: string | LocalizedText;
  /** Enlace directo: su sitio, su curso o su repositorio. Sin él, el ítem no es público (p. ej. un repo privado). */
  url?: string;
  kind: CatalogoKind;
}

/** Un producto con `tipo: 'catalogo'`: lleva siempre lo que reúne y el nombre de sus ítems. */
export type Catalogo = Producto & { tipo: 'catalogo'; incluye: CatalogoItem[]; unidad: LocalizedText };

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
    secNo: '02',  // 5 products: Ágora (banner) + Paideía + Koinonía UdeA + Gobierno UdeA + Agón
    tagline: {
      es: 'El criterio que da forma a todo lo demás.',
      en: 'The judgment that shapes everything else.',
    },
    descripcion: {
      es: 'Filosofía analítica, lógica formal y simbólica, filosofía de la mente y de la IA, filosofía de la ciudad y proyectos de deliberación y gobierno universitario. El registro humanístico que da criterio a la ingeniería.',
      en: 'Analytic philosophy, formal and symbolic logic, philosophy of mind and of AI, philosophy of the city, and projects in deliberation and university governance. The humanistic register that gives engineering its judgment.',
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
    nombre: { es: 'Empresarial', en: 'Enterprise' },
    secNo: '04',
    tagline: {
      es: 'Software empresarial en producción, con clientes reales.',
      en: 'Production business software, with real clients.',
    },
    descripcion: {
      es: 'El frente empresarial: software en producción con clientes reales — Prizma (suite modular para PYME), Graf (pedidos y logística de domicilios) y Deméter (gestión operativa para distribuidoras de alimentos).',
      en: 'The business front: production software with real clients — Prizma (modular SMB suite), Graf (orders & last-mile delivery) and Deméter (operations platform for food distributors).',
    },
  },
};

// Front order in the portfolio; catalog cards have their own priority below.
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
  // horizontal con su og_product), no como card de grid. Debajo, Paideía,
  // Koinonía UdeA, Gobierno UdeA y Agón siguen en el grid 2-col portrait.
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
      es: 'Catálogo de cursos, ponencias y ensayos',
      en: 'Catalog of courses, talks and essays',
    },
    descripcion: {
      es: 'No es una app suelta: es la capa que organiza el trabajo de humanidades. Reúne los cursos de Griego Clásico, Neurofilosofía y Filosofía de la Ciudad, con sus documentos navegables y un buscador, y enlaza las ponencias interactivas, la tesis doctoral y los ensayos, cada uno publicado en su propio sitio.',
      en: 'Not a single app: it is the layer that organizes the humanities work. It gathers the Classical Greek, Neurophilosophy and Philosophy of the City courses, with their browsable documents and a search, and links the interactive talks, the doctoral thesis and the essays, each published on a site of its own.',
    },
    url: 'https://paideia.stevenvallejo.com',
    repo: 'https://github.com/stevenvo780/clavis',
    status: 'live',
    badge: { es: 'Humanidades digitales', en: 'Digital humanities' },
    featured: true,
    tipo: 'catalogo',
    unidad: { es: 'obras', en: 'works' },
    // Fuente: el repo paideia (app/trabajos/works.ts, app/ponencias/page.tsx y los módulos de lib/modules.ts).
    // El Fedón va una vez: /ponencias enlaza además un deck alterno (clavis-decks.vercel.app/platon/) de la misma ponencia.
    incluye: [
      { nombre: { es: 'Griego Clásico', en: 'Classical Greek' }, kind: 'curso', url: 'https://paideia.stevenvallejo.com/griego' },
      { nombre: { es: 'Neurofilosofía', en: 'Neurophilosophy' }, kind: 'curso', url: 'https://paideia.stevenvallejo.com/neurofilosofia' },
      { nombre: { es: 'Filosofía de la Ciudad', en: 'Philosophy of the City' }, kind: 'curso', url: 'https://paideia.stevenvallejo.com/filosofia-ciudad' },
      { nombre: '¿Silicio o Tejido? — mente y materia', kind: 'ponencia', url: 'https://neurocarbon.stevenvallejo.com/' },
      { nombre: 'La ciudad bien asignada — Medellín', kind: 'ponencia', url: 'https://autopoesis.stevenvallejo.com/' },
      { nombre: 'La retórica como téchne', kind: 'ponencia', url: 'https://retorica.stevenvallejo.com/' },
      { nombre: 'Redes Neuronales — Hinton', kind: 'ponencia', url: 'https://hinton.stevenvallejo.com/' },
      { nombre: 'Refutación de Simmias y Cebes (Fedón)', kind: 'ponencia', url: 'https://fedon.stevenvallejo.com/' },
      { nombre: 'Fenomenología urbana de Medellín', kind: 'ponencia', url: 'https://fenomenologiaurbana.stevenvallejo.com/' },
      { nombre: 'Fragmentar el futuro — Yuk Hui', kind: 'ponencia', url: 'https://ponencia-yuk-hui-critertec-a963d21e.vercel.app/' },
      { nombre: 'La arquitectura de lo ausente — Russell', kind: 'ponencia', url: 'https://russell.stevenvallejo.com/' },
      { nombre: 'Estructuras Pre-Ontológicas', kind: 'tesis', url: 'https://preontologia.stevenvallejo.com/' },
      {
        nombre: 'Ignosticismo — análisis filosófico crítico',
        kind: 'ensayo',
        url: 'https://medium.com/@stevenvallejo780/ignosticismo-an%C3%A1lisis-filos%C3%B3fico-cr%C3%ADtico-0cb2a411569f',
      },
      {
        nombre: 'Crítica y dialéctica del Gnosticismo',
        kind: 'ensayo',
        url: 'https://medium.com/@stevenvallejo780/cr%C3%ADtica-y-dial%C3%A9ctica-del-gnosticismo-6173e5768a0c',
      },
      {
        nombre: 'Filosofía y Programación',
        kind: 'ensayo',
        url: 'https://medium.com/@stevenvallejo780/filosof%C3%ADa-y-programaci%C3%B3n-una-exploraci%C3%B3n-profunda-de-paradigmas-y-arquitecturas-199df6786331',
      },
    ],
  },
  {
    id: 'koinonia-udea',
    frente: 'filosofia',
    nombre: 'Koinonía UdeA',
    subtitulo: {
      es: 'Gobernanza estudiantil independiente',
      en: 'Independent student governance',
    },
    descripcion: {
      es: 'Plataforma libre de gobernanza colectiva para el estudiantado del Instituto de Filosofía de la UdeA. Organiza problemas, deliberaciones, decisiones verificables e iniciativas con seguimiento. Es un proyecto independiente: no representa oficialmente a la Universidad.',
      en: 'Open-source collective governance platform for students of the UdeA Institute of Philosophy. It organizes issues, deliberations, verifiable decisions and initiatives with follow-through. This is an independent project and does not officially represent the university.',
    },
    url: 'https://koinonia-udea.stevenvallejo.com/',
    repo: 'https://github.com/stevenvo780/koinonia',
    status: 'live',
    badge: { es: 'Software libre', en: 'Open source' },
    cardIdentity: {
      label: { es: 'Proyecto independiente', en: 'Independent project' },
      symbol: 'Κ',
    },
  },
  {
    id: 'gobierno-universitario-udea',
    frente: 'filosofia',
    nombre: 'Gobierno Universitario UdeA',
    subtitulo: {
      es: 'Gobernanza universitaria · informe IEP',
      en: 'University governance · IEP report',
    },
    descripcion: {
      es: 'Visualización del informe de 2015 del Instituto de Estudios Políticos de la Universidad de Antioquia sobre gobierno universitario. Presenta actores, estructura del Consejo Superior Universitario y tensiones políticas entre 2010 y 2013. La investigación corresponde al equipo del IEP.',
      en: 'Visualization of the Universidad de Antioquia Institute of Political Studies 2015 report on university governance. It presents the actors, the University Superior Council structure and political tensions from 2010 to 2013. The research belongs to the IEP team.',
    },
    url: 'https://formacion-ciudadana-udea.vercel.app/',
    repo: 'https://github.com/stevenvo780/FormacionCiudadanaUdea',
    status: 'live',
    badge: { es: 'Visualización de investigación', en: 'Research visualization' },
    cardIdentity: {
      label: { es: 'Informe del IEP', en: 'IEP report' },
      symbol: 'U',
    },
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
    url: 'https://debates.cafeteriadelcaos.com',
    repo: 'https://github.com/stevenvo780/debatesuite',
    status: 'live',
    badge: { es: 'En vivo · Cafetería del Caos', en: 'Live · Cafetería del Caos' },
  },

  /* ===================== CIENCIAS ===================== */
  {
    id: 'complexlab',
    frente: 'ciencias',
    nombre: 'Kósmos',
    subtitulo: {
      es: 'Catálogo de proyectos científicos',
      en: 'Catalog of science projects',
    },
    descripcion: {
      es: 'Reúne proyectos públicos de matemáticas, física, sistemas complejos, autómatas y cómputo científico, cada uno con su ficha y su propio repositorio. Cada ficha dice el alcance real del código y separa el modelo didáctico del resultado empírico; la portada suma diagramas interactivos propios, como un atractor de Lorenz que se recalcula en vivo.',
      en: 'It gathers public projects in mathematics, physics, complex systems, automata and scientific computing, each with its own page and repository. Every page states what the code really covers and separates the teaching model from the empirical result; the front page adds its own interactive diagrams, such as a Lorenz attractor recomputed live.',
    },
    url: 'https://kosmos.stevenvallejo.com',
    repo: 'https://github.com/stevenvo780/complexlab',
    status: 'live',
    badge: { es: 'Atlas de ciencia en código', en: 'Atlas of science in code' },
    featured: true,
    tipo: 'catalogo',
    unidad: { es: 'proyectos', en: 'projects' },
    // Fuente: el repo kosmos (lib/catalog.ts → PROJECTS y CATEGORIES; docs/CATALOG_AUDIT.md). Un repositorio por ficha.
    incluye: [
      { nombre: { es: 'Curvas de complejidad algorítmica', en: 'Algorithmic complexity curves' }, kind: 'matematicas', url: 'https://github.com/stevenvo780/ComplejidadYCostoComputacional' },
      { nombre: { es: 'Comunicación celular con ruido', en: 'Noisy cellular communication' }, kind: 'matematicas', url: 'https://github.com/stevenvo780/teoria-informacion' },
      { nombre: { es: 'Grafos e hipergrafos', en: 'Graphs and hypergraphs' }, kind: 'matematicas', url: 'https://github.com/stevenvo780/complejidad-teoria' },
      { nombre: { es: 'Kalos: visualización matemática', en: 'Kalos: mathematical visualization' }, kind: 'matematicas', url: 'https://github.com/stevenvo780/kalos' },
      { nombre: { es: 'Cálculo de entropía de Shannon', en: 'Shannon entropy calculator' }, kind: 'matematicas', url: 'https://github.com/stevenvo780/shanon' },
      { nombre: { es: 'Simulación de estrategias y recursos', en: 'Strategy and resource simulation' }, kind: 'matematicas', url: 'https://github.com/stevenvo780/teoria-de-juegos' },
      { nombre: { es: 'Utilidad esperada de decisiones', en: 'Expected utility of decisions' }, kind: 'matematicas', url: 'https://github.com/stevenvo780/teoria-desicion' },
      { nombre: { es: 'Medidas probabilísticas de información', en: 'Probabilistic measures of information' }, kind: 'matematicas', url: 'https://github.com/stevenvo780/TheorySemanticInformation' },
      { nombre: { es: 'Banco de pruebas EDI multiescala', en: 'Multiscale EDI test bench' }, kind: 'sistemas-complejos', url: 'https://github.com/stevenvo780/EstructurasPreontologicas' },
      { nombre: { es: 'Casos de simulación ABM y ODE', en: 'ABM and ODE simulation cases' }, kind: 'sistemas-complejos', url: 'https://github.com/stevenvo780/hiper-objeto-simulaciones' },
      { nombre: { es: 'Simulaciones urbanas de Medellín', en: 'Urban simulations of Medellín' }, kind: 'sistemas-complejos', url: 'https://github.com/stevenvo780/FenomenologiaUrbana' },
      { nombre: { es: 'Sistema económico simulado', en: 'Simulated economic system' }, kind: 'sistemas-complejos', url: 'https://github.com/stevenvo780/teoria-sistemas' },
      { nombre: { es: 'Modelo multiagente MASOES', en: 'MASOES multi-agent model' }, kind: 'sistemas-complejos', url: 'https://github.com/stevenvo780/teoria-MASOES' },
      { nombre: { es: 'Simulación de un sistema de metro', en: 'Metro system simulation' }, kind: 'sistemas-complejos', url: 'https://github.com/stevenvo780/SistemaDeTrasporteTrenes' },
      { nombre: { es: 'Isla de calor urbano', en: 'Urban heat island' }, kind: 'fisica', url: 'https://github.com/stevenvo780/JacobTesis' },
      { nombre: { es: 'Atractor de Lorenz', en: 'Lorenz attractor' }, kind: 'fisica', url: 'https://github.com/stevenvo780/teoria-caos' },
      { nombre: { es: 'Partículas y dispersión de velocidades', en: 'Particles and velocity dispersion' }, kind: 'fisica', url: 'https://github.com/stevenvo780/emergencia-experimento-temperatura' },
      { nombre: { es: 'Enfriamiento cosmológico simplificado', en: 'Simplified cosmological cooling' }, kind: 'fisica', url: 'https://github.com/stevenvo780/entropia-vacio' },
      { nombre: { es: 'Juego de la Vida y entropía', en: 'Game of Life and entropy' }, kind: 'emergencia', url: 'https://github.com/stevenvo780/emergencia-juego-de-conwey' },
      { nombre: { es: 'Grafo de reglas de autómatas', en: 'Automaton rule graph' }, kind: 'emergencia', url: 'https://github.com/stevenvo780/teoria-ruliat' },
      { nombre: { es: 'Dinámica de partículas macro y micro', en: 'Macro and micro particle dynamics' }, kind: 'emergencia', url: 'https://github.com/stevenvo780/experimento-macro-micro' },
      { nombre: { es: 'Benchmark y simulación N cuerpos', en: 'N-body benchmark and simulation' }, kind: 'computo-cientifico', url: 'https://github.com/stevenvo780/TestPcForProgramers' },
      { nombre: { es: 'Prácticas de redes neuronales', en: 'Neural network exercises' }, kind: 'computo-cientifico', url: 'https://github.com/stevenvo780/neuronalLearning' },
    ],
  },
  {
    id: 'umbral-atlas',
    frente: 'ciencias',
    nombre: 'Umbral',
    subtitulo: {
      es: 'Atlas interactivo de experimentos',
      en: 'Interactive atlas of experiments',
    },
    descripcion: {
      es: 'Atlas interactivo de 23 experimentos de matemáticas, física, autómatas y sistemas complejos. Combina escenas 3D exploratorias con 230 resultados documentados y enlaces al código fuente; las escenas no recalculan los resultados originales.',
      en: 'Interactive atlas of 23 experiments in mathematics, physics, automata and complex systems. It pairs exploratory 3D scenes with 230 documented results and source links; the scenes do not recompute the original results.',
    },
    url: 'https://umbral-atlas.stevenvallejo.com',
    status: 'live',
    badge: { es: 'Exploración científica', en: 'Scientific exploration' },
    cardIdentity: { label: { es: 'Atlas de experimentos', en: 'Experiment atlas' }, symbol: '◇' },
    banner: true,
  },
  {
    id: 'phusis',
    frente: 'ciencias',
    nombre: 'Phúsis',
    subtitulo: {
      es: 'Aprender complejidad programando',
      en: 'Learn complexity by coding',
    },
    descripcion: {
      es: 'Plataforma-curso de ciencias de la complejidad con tres cursos activos y 22 lecciones. Permite programar autómatas, sistemas caóticos y modelos basados en agentes, con vista previa, comprobaciones automáticas y reflexión filosófica.',
      en: 'Complexity science course platform with three active courses and 22 lessons. Learners code cellular automata, chaotic systems and agent-based models, with live previews, automated checks and philosophical reflection.',
    },
    url: 'https://phusis.stevenvallejo.com',
    status: 'live',
    badge: { es: 'Plataforma educativa', en: 'Learning platform' },
    cardIdentity: { label: { es: 'Ciencia en código', en: 'Science in code' }, symbol: 'φ' },
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
    url: 'https://preontologia.stevenvallejo.com',
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
      es: 'Catálogo de proyectos de IA',
      en: 'Catalog of AI projects',
    },
    descripcion: {
      es: 'Reúne mis proyectos de IA (asistentes, infraestructura para agentes, inferencia local y herramientas), cada uno con su ficha, su diagrama y su repositorio. No ejecuta los proyectos: los documenta y enlaza, y dice con honestidad cuáles son demo, cuáles referencia y cuáles privados.',
      en: 'It gathers my AI projects (assistants, agent infrastructure, local inference and tools), each with its own page, diagram and repository. It does not run them: it documents and links them, and says plainly which are demos, which are references and which are private.',
    },
    url: 'https://daimon.stevenvallejo.com',
    repo: 'https://github.com/stevenvo780/stevenai',
    status: 'live',
    badge: { es: 'Atlas de inteligencia', en: 'Atlas of intelligence' },
    tipo: 'catalogo',
    unidad: { es: 'proyectos', en: 'projects' },
    // Fuente: el repo daimon (lib/components-data.ts y lib/catalog-groups.ts). Talos es privado: el catálogo público no
    // enlaza su repositorio, así que aquí tampoco.
    incluye: [
      { nombre: 'Cauce V3', kind: 'infraestructura', url: 'https://github.com/stevenvo780/cauce-v3' },
      { nombre: 'MCP Swarm Delegator', kind: 'infraestructura', url: 'https://github.com/stevenvo780/MCP-delegate-agents' },
      { nombre: 'MCP Autonomous Agents', kind: 'infraestructura', url: 'https://github.com/stevenvo780/MCPagents' },
      { nombre: 'night-harness', kind: 'infraestructura', url: 'https://github.com/stevenvo780/night-harness' },
      { nombre: 'Clawbus', kind: 'infraestructura', url: 'https://github.com/stevenvo780/clawbus' },
      { nombre: 'Prizma Agent Stack', kind: 'infraestructura', url: 'https://github.com/stevenvo780/prizma-agent-stack' },
      { nombre: 'Agora MCP', kind: 'infraestructura', url: 'https://github.com/stevenvo780/agora-mcp' },
      { nombre: 'Cloud Delegate', kind: 'infraestructura', url: 'https://github.com/stevenvo780/cloud-delegate' },
      { nombre: { es: 'Talos · Harness de automatización', en: 'Talos · Automation harness' }, kind: 'infraestructura' },
      { nombre: 'Jarvis IA v1', kind: 'asistentes', url: 'https://github.com/stevenvo780/jarvisIA' },
      { nombre: 'Jarvis IA v2', kind: 'asistentes', url: 'https://github.com/stevenvo780/jarvisIAV2' },
      { nombre: 'Kratos Jarvis', kind: 'asistentes', url: 'https://github.com/stevenvo780/kratos-jarvis' },
      { nombre: 'clawbar', kind: 'asistentes', url: 'https://github.com/stevenvo780/clawbar' },
      { nombre: 'Ágora AI Agent', kind: 'asistentes', url: 'https://github.com/stevenvo780/agora-backend' },
      { nombre: 'PDF to Markdown IA', kind: 'herramientas', url: 'https://github.com/stevenvo780/ConvertPDFToMarkdownIA' },
      { nombre: 'ai-usage-live', kind: 'herramientas', url: 'https://github.com/stevenvo780/ai-usage-live' },
      { nombre: 'reel-forge', kind: 'herramientas', url: 'https://github.com/stevenvo780/reel-forge' },
      { nombre: 'NewsLeters · MiniMax H3', kind: 'herramientas', url: 'https://github.com/stevenvo780/minimax-h3' },
      { nombre: { es: 'Generador de pixel art', en: 'Pixel art generator' }, kind: 'herramientas', url: 'https://github.com/stevenvo780/CreadorDeImagenes' },
      { nombre: { es: 'Chat IA Local GGUF', en: 'Local GGUF AI chat' }, kind: 'inferencia', url: 'https://github.com/stevenvo780/IA' },
      { nombre: 'Neuronal Learning', kind: 'inferencia', url: 'https://github.com/stevenvo780/neuronalLearning' },
    ],
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
    id: 'cauce-v3',
    frente: 'informatica',
    nombre: 'Cauce V3',
    subtitulo: {
      es: 'Director orquestador de la flota agéntica',
      en: 'Orchestrating director of the agent fleet',
    },
    descripcion: {
      es: 'Mi proyecto estrella en ingeniería: orquestador de la flota agéntica que opera Cauce V3 (este mismo portafolio y todo el ecosistema Humanizar). Despliegues, monitoreo, contratos de entrega entre agentes y un CRM multi-tenant en producción. Es la mano derecha que mantiene viva la flota.',
      en: 'My flagship engineering project: the orchestrating director of the agent fleet that operates Cauce V3 (this very portfolio and the entire Humanizar ecosystem). Deployments, monitoring, delivery contracts between agents, and a multi-tenant CRM in production. The right hand that keeps the fleet alive.',
    },
    url: 'https://cauce.humanizar.tech',
    status: 'live',
    badge: { es: 'Proyecto estrella en ingeniería', en: 'Flagship engineering project' },
    banner: true,
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
      es: 'Generador determinista de identidad de marca: isotipos procedurales, paletas, iconsets y kits sociales, con validación de contraste WCAG. Webapp multi-tenant + API + servidor MCP, en producción. Es el motor que fabrica las marcas de este mismo portafolio.',
      en: 'Deterministic brand-identity generator: procedural isotypes, palettes, icon sets and social kits, with WCAG contrast validation. Multi-tenant webapp + API + MCP server, in production. The engine that builds the brands of this very portfolio.',
    },
    url: 'https://eikon.humanizar.cloud',
    status: 'live',
    badge: { es: 'Generador de marca', en: 'Brand generator' },
  },

  /* ===================== ENTERPRISE ===================== */
  {
    id: 'humanizar',
    frente: 'enterprise',
    nombre: 'Humanizar',
    subtitulo: {
      es: 'Catálogo de productos y servicios',
      en: 'Catalog of products and services',
    },
    descripcion: {
      es: 'Reúne la oferta pública de Humanizar Systems: software para ventas, distribución y operación, plataformas para coordinar agentes de IA y servicios de ingeniería a medida. Cada ficha lleva a su producto o servicio.',
      en: 'It brings together Humanizar Systems’ public offerings: software for sales, distribution and operations, platforms for coordinating AI agents, and tailored engineering services. Each entry links to its product or service.',
    },
    url: 'https://catalogo.humanizar.tech/',
    status: 'live',
    badge: { es: 'Software y agentes para empresas', en: 'Business software and AI agents' },
    tipo: 'catalogo',
    unidad: { es: 'soluciones', en: 'offerings' },
    // Fuente: catalogo.humanizar.tech/catalogo-publico.json (12 productos y 3 servicios públicos).
    incluye: [
      { nombre: 'POS Saldantia', kind: 'producto', url: 'https://pos.saldantia.cloud' },
      { nombre: 'Deméter', kind: 'producto', url: 'https://demeter.humanizar.cloud' },
      { nombre: 'Graf Commerce', kind: 'producto', url: 'https://admin.graf.com.co' },
      { nombre: 'Xenía (Devkits CRM)', kind: 'producto', url: 'https://xenia.stevenvallejo.com' },
      { nombre: 'Cauce V3', kind: 'producto', url: 'https://cauce.humanizar.tech' },
      { nombre: 'Agora (Elenxos)', kind: 'producto', url: 'https://agora.elenxos.com' },
      { nombre: 'Aletheia', kind: 'producto', url: 'https://aletheia.humanizar.tech' },
      { nombre: 'Apothḗke', kind: 'producto', url: 'https://apotheke.stevenvallejo.com' },
      { nombre: 'Koinonía', kind: 'producto', url: 'https://koinonia.stevenvallejo.com' },
      { nombre: 'Chrónos', kind: 'producto', url: 'https://chronos.stevenvallejo.com' },
      { nombre: 'Gravitatoria', kind: 'producto', url: 'https://gravitatoria.humanizar.tech' },
      { nombre: 'Prizma', kind: 'producto', url: 'https://prisma-enterprice.cloud' },
      { nombre: 'Práxis', kind: 'servicio', url: 'https://praxis.stevenvallejo.com' },
      { nombre: 'Érgon', kind: 'servicio', url: 'https://ergon.stevenvallejo.com' },
      { nombre: { es: 'Agentes de IA a la medida', en: 'Tailored AI agents' }, kind: 'servicio', url: 'https://agentes.humanizar.tech/' },
    ],
  },
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
  {
    id: 'graf',
    frente: 'enterprise',
    nombre: 'Graf',
    subtitulo: {
      es: 'Plataforma de pedidos y logística de domicilios',
      en: 'Orders & last-mile delivery platform',
    },
    descripcion: {
      es: 'Plataforma comercial de gestión de pedidos y logística de última milla, en producción y con clientes reales. El producto con mayor tracción del portafolio.',
      en: 'Commercial platform for order management and last-mile delivery logistics, in production with real clients. The highest-traction product in the portfolio.',
    },
    url: 'https://www.graf.com.co',
    status: 'live',
    badge: { es: 'En producción · con clientes', en: 'In production · live clients' },
    featured: true,
  },
  {
    id: 'demeter',
    frente: 'enterprise',
    nombre: 'Deméter',
    subtitulo: {
      es: 'Gestión operativa para distribuidoras de alimentos',
      en: 'Ops platform for food distributors',
    },
    descripcion: {
      es: 'Plataforma de gestión operativa para distribuidoras de alimentos: del pedido a la ruta sin digitar a mano — recepción de pedidos, armado de rutas, despacho, control de cartera y facturación electrónica DIAN, multi-empresa. En producción.',
      en: 'Operations platform for food distributors: from order to route with no manual entry — order intake, route building, dispatch, receivables and DIAN e-invoicing, multi-company. In production.',
    },
    url: 'https://demeter.humanizar.cloud',
    status: 'live',
    badge: { es: 'En producción · distribución', en: 'In production · distribution' },
    featured: true,
  },
];

/**
 * Search topics per product (product id → keywords). Feeds the site search so
 * queries like "ciencia", "griego", "logística" or "RAG" surface the right
 * product even when the term isn't in the name or one-line description.
 * TODO: enriquecer automáticamente escaneando el contenido de cada sub-repo.
 */
export const productTags: Record<string, string[]> = {
  agora: ['lógica formal', 'plataforma académica', 'filosofía analítica', 'SAT solver', 'ST', 'auto.logic', 'verificación', 'humanidades', 'elenxos', 'razonamiento'],
  clavis: ['paideía', 'catálogo', 'catalog', 'humanidades digitales', 'griego clásico', 'griego', 'morfología', 'neurofilosofía', 'filosofía de la ciudad', 'MDX', 'educación', 'filosofía', 'lecturas', 'ponencias', 'ensayos'],
  'koinonia-udea': ['koinonía', 'UdeA', 'Universidad de Antioquia', 'Instituto de Filosofía', 'gobernanza estudiantil', 'deliberación', 'decisiones', 'iniciativas', 'software libre'],
  'gobierno-universitario-udea': ['gobierno universitario', 'gobernanza', 'UdeA', 'Universidad de Antioquia', 'IEP', 'Instituto de Estudios Políticos', 'Consejo Superior Universitario', 'CSU', 'divulgación', 'visualización'],
  debatesuite: ['agón', 'debate', 'debates', 'cafetería del caos', 'retórica', 'moderación', 'falacias', 'argumentación', 'autómata celular', 'PWA', 'filosofía', 'oratoria'],
  'estructuras-preontologicas': ['filosofía de la ciencia', 'ontología', 'complejidad', 'tesis doctoral', 'preontología', 'EDI', 'emergencia', 'ciencias de la complejidad', 'metafísica', 'investigación'],
  complexlab: ['kósmos', 'catálogo', 'catalog', 'ciencia', 'complejidad', 'emergencia', 'caos', 'redes', 'agentes', 'simulación', 'sistemas complejos', 'autómatas', 'orden natural'],
  'umbral-atlas': ['umbral', 'atlas', 'experimentos', 'matemáticas', 'física', 'autómatas', 'sistemas complejos', '3D', 'simulación', 'resultados documentados'],
  phusis: ['phúsis', 'ciencias de la complejidad', 'educación', 'curso', 'lecciones', 'autómatas celulares', 'caos', 'sistemas dinámicos', 'modelos basados en agentes', 'programación'],
  aporia: ['áporía', 'CMS', 'editorial', 'papers', 'publicación académica', 'investigación', 'ciencia', 'paradojas', 'Neon', 'Postgres'],
  'nlp-to-logic': ['órganon', 'lógica formal', 'NLP', 'lenguaje natural', 'SAT solver', 'CDCL', 'ST', 'autologic', 'razonamiento', 'formalización'],
  stevenai: ['daímon', 'catálogo', 'catalog', 'inteligencia artificial', 'IA', 'RAG', 'LLM', 'Jarvis', 'Ollama', 'agentes', 'MCP', 'GPU', 'ChromaDB', 'chat local', 'OCR'],
  stevendevbox: ['téchne', 'devtools', 'OSS', 'código abierto', 'terminal', 'Hyprland', 'Linux', 'Wayland', 'herramientas', 'monitor de sistema'],
  communityos: ['koinonía', 'comunidades', 'Discord', 'multi-tenant', 'eventos', 'ranking', 'biblioteca', 'bot', 'NestJS', 'gamificación'],
  devkits: ['érgon', 'starter kits', 'PYME', 'CRM', 'hours tracker', 'VPN', 'plantillas', 'landing comercial'],
  'devkits-hours': ['chrónos', 'horas', 'freelance', 'cuentas de cobro', 'facturación', 'tiempo', 'Colombia', 'tarifa', 'SaaS'],
  'devkits-crm': ['xenía', 'CRM', 'PYME', 'kanban', 'ventas', 'pipeline', 'contactos', 'cotizaciones', 'facturas', 'Colombia'],
  scrapekit: ['nómos', 'scraping', 'legal', 'legislación', 'documentos', 'búsqueda full-text', 'Colombia', 'República Dominicana', 'FastAPI', 'indexador'],
  warehouse: ['apothḗke', 'inventario', 'almacén', 'stock', 'órdenes', 'logística', 'gestión', 'roles', 'analítica'],
  eikon: ['eikón', 'imagen de marca', 'logos', 'identidad visual', 'iconsets', 'favicons', 'paletas', 'WCAG', 'generador', 'MCP', 'branding', 'diseño', 'marca'],
  'cauce-v3': ['cauce', 'cauce v3', 'flota agéntica', 'agentes', 'orquestador', 'director de flota', 'multi-tenant', 'CRM', 'CRM agéntico', 'humandroid', 'humanizar', 'flagship engineering'],
  humanizar: ['humanizar', 'humanizar systems', 'catálogo', 'catalog', 'empresa', 'productos', 'servicios', 'software empresarial', 'agentes de IA', 'POS', 'ventas', 'distribución', 'operación', 'ingeniería'],
  prizma: ['suite empresarial', 'POS', 'facturación DIAN', 'crédito', 'WhatsApp', 'marketing', 'e-commerce', 'logística', 'CRM', 'microservicios', 'Cloud Run', 'talanton', 'pistis', 'iris', 'hermes', 'talaria'],
  graf: ['pedidos', 'domicilios', 'logística', 'última milla', 'delivery', 'clientes', 'comercio', 'plataforma', 'producción'],
  demeter: ['distribución', 'alimentos', 'pedidos', 'rutas', 'facturación DIAN', 'cartera', 'inventario', 'HORECA', 'logística', 'multi-empresa', 'despacho'],
};

/* ---------------------------------------------------------------- */
/* Helpers                                                           */
/* ---------------------------------------------------------------- */
export function productosPorFrente(frente: FrenteId): Producto[] {
  return productos.filter((p) => p.frente === frente);
}

/** Nombre de cada colección, como lo publica su catálogo. */
export const catalogoKinds: Record<CatalogoKind, LocalizedText> = {
  curso: { es: 'Cursos', en: 'Courses' },
  ponencia: { es: 'Ponencias', en: 'Talks' },
  tesis: { es: 'Tesis doctoral', en: 'Doctoral thesis' },
  ensayo: { es: 'Ensayos', en: 'Essays' },
  matematicas: { es: 'Matemáticas', en: 'Mathematics' },
  fisica: { es: 'Física y ambiente', en: 'Physics & environment' },
  'sistemas-complejos': { es: 'Sistemas complejos', en: 'Complex systems' },
  emergencia: { es: 'Autómatas y emergencia', en: 'Automata & emergence' },
  'computo-cientifico': { es: 'Cómputo científico', en: 'Scientific computing' },
  infraestructura: { es: 'Infraestructura para agentes', en: 'Agent infrastructure' },
  asistentes: { es: 'Asistentes y voz', en: 'Assistants & voice' },
  herramientas: { es: 'Herramientas y creación', en: 'Tools & creation' },
  inferencia: { es: 'Inferencia y experimentos', en: 'Inference & experiments' },
  producto: { es: 'Productos', en: 'Products' },
  servicio: { es: 'Servicios', en: 'Services' },
};

export function esCatalogo(p: Producto): p is Catalogo {
  return p.tipo === 'catalogo' && Array.isArray(p.incluye) && p.unidad !== undefined;
}

/** Humanizar abre la banda; los demás conservan el orden de sus frentes y de `productos`. */
export const catalogos: Catalogo[] = frenteOrder
  .flatMap((f) => productos.filter((p) => p.frente === f).filter(esCatalogo))
  .sort((a, b) => Number(b.id === 'humanizar') - Number(a.id === 'humanizar'));

/** Nombre de un ítem de catálogo en un idioma (ver CatalogoItem.nombre). */
export function nombreItem(i: CatalogoItem, locale: keyof LocalizedText): string {
  return typeof i.nombre === 'string' ? i.nombre : i.nombre[locale];
}

/**
 * Destinos distintos entre catálogos, por URL o por nombre si no son públicos. Dos enlaces distintos a un mismo
 * proyecto cuentan por separado; esta cifra no se presenta en la interfaz.
 */
export function trabajosEnCatalogos(cs: Catalogo[]): number {
  return new Set(cs.flatMap((c) => c.incluye.map((i) => i.url ?? nombreItem(i, 'es')))).size;
}

/** Colecciones de un catálogo en el orden en que aparecen sus ítems, cada una con sus ítems. */
export function catalogoGrupos(c: Catalogo): { kind: CatalogoKind; items: CatalogoItem[] }[] {
  const grupos = new Map<CatalogoKind, CatalogoItem[]>();
  for (const item of c.incluye) grupos.set(item.kind, [...(grupos.get(item.kind) ?? []), item]);
  return [...grupos].map(([kind, items]) => ({ kind, items }));
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
      url: 'https://schole.stevenvallejo.com',
    },
  ],
  informatica: [
    {
      label: { es: 'CV Informático', en: 'Engineering CV' },
      url: 'https://informatico.stevenvallejo.com',
    },
    {
      label: { es: 'Servicios', en: 'Services' },
      url: 'https://praxis.stevenvallejo.com',
    },
  ],
};
