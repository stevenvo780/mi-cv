// Single source of truth for the web CV (mirrors cv-pdf/*.html, datos confirmados 2026-06-12).
// Tech profile leads with experience (empirical/self-taught); Philosophy profile leads with UdeA.

export type Locale = 'es' | 'en';

export interface CvJob {
  org: string;
  role: string;
  bond: string; // tipo de vínculo
  dates: string;
  desc: string;
}

export interface CvProject {
  name: string;
  url?: string;
  desc: string;
}

export interface CvDownload {
  label: string;
  href: string;
  ats?: boolean;
}

interface TechContent {
  role: string;
  location: string;
  profileTitle: string;
  profile: string;
  expTitle: string;
  jobs: CvJob[];
  prev: string;
  projTitle: string;
  projects: CvProject[];
  stackTitle: string;
  stack: { label: string; items: string }[];
  eduTitle: string;
  education: { title: string; meta: string }[];
  langTitle: string;
  languages: { name: string; level: string }[];
}

interface PhiloContent {
  role: string;
  location: string;
  profileTitle: string;
  profile: string;
  areasTitle: string;
  areas: { title: string; desc: string }[];
  projTitle: string;
  flagship: CvProject;
  writeTitle: string;
  writing: string;
}

interface CvStrings {
  pageTitle: string;
  pageLead: string;
  tabTech: string;
  tabPhilo: string;
  downloadsTitle: string;
  downloadPretty: string;
  downloadAts: string;
  atsNote: string;
  backHome: string;
  tech: TechContent;
  philo: PhiloContent;
}

export const CONTACT = {
  email: 'stevenvallejo780@gmail.com',
  phone: '+57 304 637 4368',
  web: 'stevenvallejo.com',
  github: 'github.com/stevenvo780',
  githubUrl: 'https://github.com/stevenvo780',
  linkedin: 'linkedin.com/in/steven-vallejo',
  linkedinUrl: 'https://www.linkedin.com/in/steven-vallejo/',
  blog: 'blog.stevenvallejo.com',
  blogUrl: 'https://blog.stevenvallejo.com',
};

export const DOWNLOADS: Record<Locale, { tech: CvDownload[]; philo: CvDownload[] }> = {
  es: {
    tech: [
      { label: 'CV Informática · ES', href: '/pdf/CV_tech_es.pdf' },
      { label: 'CV Informática · EN', href: '/pdf/CV_tech_en.pdf' },
      { label: 'CV ATS · ES', href: '/pdf/CV_tech_ats_es.pdf', ats: true },
      { label: 'CV ATS · EN', href: '/pdf/CV_tech_ats_en.pdf', ats: true },
    ],
    philo: [
      { label: 'CV Filosofía · ES', href: '/pdf/CV_filo_es.pdf' },
      { label: 'CV Filosofía · EN', href: '/pdf/CV_filo_en.pdf' },
    ],
  },
  en: {
    tech: [
      { label: 'CV Software · ES', href: '/pdf/CV_tech_es.pdf' },
      { label: 'CV Software · EN', href: '/pdf/CV_tech_en.pdf' },
      { label: 'CV ATS · ES', href: '/pdf/CV_tech_ats_es.pdf', ats: true },
      { label: 'CV ATS · EN', href: '/pdf/CV_tech_ats_en.pdf', ats: true },
    ],
    philo: [
      { label: 'CV Philosophy · ES', href: '/pdf/CV_filo_es.pdf' },
      { label: 'CV Philosophy · EN', href: '/pdf/CV_filo_en.pdf' },
    ],
  },
};

export const CV: Record<Locale, CvStrings> = {
  es: {
    pageTitle: 'Hoja de vida',
    pageLead:
      'Filósofo e informático. Ingeniería de sistemas de extremo a extremo y formación analítica, con más de 10 años construyendo y operando software en producción. Aquí está todo: el perfil de informática y el de filosofía, con descarga en PDF (ES/EN, versión bonita y versión ATS).',
    tabTech: 'Informática',
    tabPhilo: 'Filosofía',
    downloadsTitle: 'Descargar en PDF',
    downloadPretty: 'Versión de diseño',
    downloadAts: 'Versión ATS (una columna)',
    atsNote:
      'La versión ATS es de una sola columna, sin gráficos: está pensada para los lectores automáticos de los portales de empleo.',
    backHome: 'Volver al inicio',
    tech: {
      role: 'Ingeniero de Software · Backend / Cloud / IA',
      location: 'Medellín, Colombia · Trabajo remoto · Reubicable a España · 10+ años de experiencia',
      profileTitle: 'Perfil',
      profile:
        'Ingeniero de software empírico con más de 10 años en producción construyendo sistemas backend, plataformas SaaS multi-tenant y automatización de procesos. Sólido en Node.js, NestJS, TypeScript, Python, PostgreSQL, Docker, Linux y GCP/Cloud Run, con foco en microservicios, REST APIs e integración de IA (LLM, RAG, MCP). Perfil autodidacta: mis cargos y sistemas en producción son mi credencial principal.',
      expTitle: 'Experiencia',
      jobs: [
        {
          org: 'Humanizar Systems',
          role: 'Fundador / Lead Developer',
          bond: 'proyecto propio',
          dates: '2022 — Actualidad',
          desc:
            'Construí un ecosistema SaaS multi-tenant (e-commerce, POS con facturación electrónica DIAN y módulo de créditos) usando microservicios NestJS, PostgreSQL y Docker, para que PYMEs colombianas vendieran, facturaran legalmente y gestionaran créditos desde una sola plataforma. Comunicación entre servicios vía pub/sub y webhooks firmados con HMAC, autenticación JWT/OAuth2 y despliegue con Git y CI/CD. En producción con clientes reales.',
        },
        {
          org: 'Finca Directa S.A.S',
          role: 'CTO / Jefe de Sistemas',
          bond: 'prestación de servicios',
          dates: '2021 — Actualidad',
          desc:
            'Construí un sistema RPA de automatización administrativa (OCR de facturas, descarga de extractos bancarios, clasificación de correos y sincronización a CRM) con Node.js y Python sobre Linux, con idempotencia y validación humana, para eliminar trabajo manual repetitivo y reducir errores de digitación.',
        },
        {
          org: 'Indie Levels Studio',
          role: 'Backend Developer',
          bond: 'contrato a término fijo',
          dates: '2021 — Actualidad',
          desc:
            'Desarrollé y mantuve servicios y APIs REST backend (Node.js / TypeScript) con PostgreSQL para los productos de un estudio de videojuegos con usuarios en varios países, aplicando control de versiones con Git y pruebas para sostener releases estables.',
        },
        {
          org: 'Critertec',
          role: 'Administrador de Sistemas',
          bond: 'contrato a término fijo',
          dates: '2024 — 2026 (finalizado)',
          desc:
            'Operé y aseguré la infraestructura en producción (Linux, Docker, CI/CD) que sostenía las soluciones digitales de la agencia, garantizando disponibilidad continua del servicio.',
        },
        {
          org: 'Soy Digital · INDOTEL',
          role: 'Frontend Developer',
          bond: 'proyecto de gobierno (Rep. Dominicana, vía Critertec)',
          dates: '2023',
          desc:
            'Construí el frontend con soporte offline y sincronización automática para una plataforma nacional de habilitación digital del gobierno dominicano, usando React/Next.js y PWA, para que el registro funcionara aun sin conexión estable en campo.',
        },
      ],
      prev:
        'Trayectoria previa: Full Stack en ZENIT, INS, Kambban e IQpixels; freelance en web, infraestructura y videojuegos desde 2014.',
      projTitle: 'Proyectos destacados',
      projects: [
        {
          name: 'Ágora — plataforma de agentes de IA',
          url: 'https://agora.elenxos.com',
          desc:
            'Diseñé y operé la arquitectura completa: backend de microservicios (Express / NestJS) sobre Cloud Run, orquestación multi-LLM (OpenAI, Anthropic, Gemini, DeepSeek, xAI) con claves del usuario (BYOK), comunicación en tiempo real (socket.io) y ejecución en workers Docker. Motor de agentes con 40+ herramientas registradas, vault AES-256-GCM y servidor MCP. Desplegada y en funcionamiento.',
        },
        {
          name: 'ST — lenguaje de lógica formal ejecutable',
          desc:
            'Lenguaje publicado en npm con SAT solver propio (CDCL), teoría de tipos y más de 6.000 pruebas automatizadas (Jest). Combina lógica formal e ingeniería; es el núcleo lógico de Ágora.',
        },
      ],
      stackTitle: 'Stack',
      stack: [
        { label: 'Backend', items: 'Node.js · NestJS · Express · TypeScript · Python · REST APIs · microservicios' },
        { label: 'Datos', items: 'PostgreSQL · MongoDB · Redis · SQLite' },
        { label: 'Cloud & DevOps', items: 'Docker · Linux · GCP / Cloud Run · Git · CI/CD' },
        { label: 'IA / Agentes', items: 'LLM (OpenAI/Anthropic) · RAG · MCP · OCR' },
        { label: 'Seguridad', items: 'JWT · OAuth2 · HMAC · AES-256-GCM' },
        { label: 'Frontend', items: 'React · Next.js · PWA' },
        { label: 'Testing', items: 'Jest · pruebas unitarias · WebSockets / tiempo real' },
      ],
      eduTitle: 'Educación',
      education: [
        { title: 'Técnico en Desarrollo de Software', meta: 'SENA · título formal' },
        { title: 'Perfil empírico / autodidacta', meta: '10+ años en producción · los cargos pesan más que el título' },
        { title: 'Filosofía (en curso)', meta: 'Universidad de Antioquia · base en lógica y razonamiento' },
      ],
      langTitle: 'Idiomas',
      languages: [
        { name: 'Español', level: 'Nativo' },
        { name: 'Inglés', level: 'técnico con lectura/escritura sólidas · conversación en desarrollo' },
      ],
    },
    philo: {
      role: 'Filósofo · Lógica formal y razonamiento',
      location: 'Medellín, Colombia · Filosofía, Universidad de Antioquia',
      profileTitle: 'Perfil',
      profile:
        'Estudiante de Filosofía de la Universidad de Antioquia, con una inclinación fuerte hacia la lógica formal, la filosofía analítica y el cruce entre filosofía y computación. No me quedo en el comentario: construyo sistemas formales ejecutables —donde un argumento se vuelve código que se puede correr y verificar— y escribo sobre filosofía aplicada a la máquina. Llegué a la filosofía desde la informática y hallé en ella un método para razonar con rigor y un puente entre la lógica simbólica y la ingeniería. Aprendí buena parte de lo humano moderando comunidades de miles de personas, y trato el pensar como una disciplina, no como un adorno.',
      areasTitle: 'Áreas de trabajo',
      areas: [
        {
          title: 'Lógica formal y simbólica',
          desc:
            'Cálculo proposicional y de predicados, sistemas de prueba y semántica. Eje central de mi formación y de mi trabajo: la lógica como columna vertebral del razonamiento.',
        },
        {
          title: 'Filosofía analítica y epistemología',
          desc:
            'Análisis del lenguaje y del argumento, condiciones del conocimiento, justificación y verdad. Claridad y precisión por encima de la retórica vacía.',
        },
        {
          title: 'Filosofía de la mente y de la IA',
          desc:
            'Qué es comprender, qué hace una máquina cuando "razona", y dónde están los límites entre cómputo y sentido. Donde mi filosofía y mi práctica técnica se encuentran.',
        },
        {
          title: 'Ética, argumentación y retórica',
          desc:
            'Razón práctica, decisión y diálogo. El Gorgias como brújula: la diferencia entre persuadir y mostrar lo verdadero.',
        },
      ],
      projTitle: 'Proyecto insignia',
      flagship: {
        name: 'ST — lenguaje de lógica formal ejecutable',
        desc:
          'Lenguaje publicado en npm con SAT solver propio (CDCL), teoría de tipos y más de 6.000 tests. Es la prueba tangible de que el rigor lógico puede salir del papel: un puente entre la filosofía analítica y la ingeniería, donde un sistema formal se ejecuta y se verifica como software.',
      },
      writeTitle: 'Escritura',
      writing:
        'Abstracción — blog en blog.stevenvallejo.com. Escribo sobre filosofía aplicada a la máquina: lógica, sentido y cognición vistos desde quien construye los sistemas. La filosofía como método y la abstracción como forma de mirar el mundo.',
    },
  },
  en: {
    pageTitle: 'Résumé',
    pageLead:
      'Philosopher and software engineer. End-to-end systems engineering and an analytic background, with 10+ years building and operating software in production. Everything is here: the software profile and the philosophy profile, with PDF downloads (ES/EN, designed and ATS versions).',
    tabTech: 'Software',
    tabPhilo: 'Philosophy',
    downloadsTitle: 'Download as PDF',
    downloadPretty: 'Designed version',
    downloadAts: 'ATS version (single column)',
    atsNote:
      'The ATS version is single-column, with no graphics: it is built for the automated parsers used by job portals.',
    backHome: 'Back to home',
    tech: {
      role: 'Software Engineer · Backend / Cloud / AI',
      location: 'Medellín, Colombia · Remote · Open to relocation to Spain · 10+ years of experience',
      profileTitle: 'Profile',
      profile:
        'Empirical software engineer with 10+ years in production building backend systems, multi-tenant SaaS platforms and process automation. Strong in Node.js, NestJS, TypeScript, Python, PostgreSQL, Docker, Linux and GCP/Cloud Run, focused on microservices, REST APIs and AI integration (LLM, RAG, MCP). Self-taught profile: my roles and production systems are my primary credential.',
      expTitle: 'Experience',
      jobs: [
        {
          org: 'Humanizar Systems',
          role: 'Founder / Lead Developer',
          bond: 'own project',
          dates: '2022 — Present',
          desc:
            'Built a multi-tenant SaaS ecosystem (e-commerce, POS with DIAN electronic invoicing and a credit module) using NestJS microservices, PostgreSQL and Docker, so Colombian SMBs could sell, invoice legally and manage credit from a single platform. Inter-service communication via pub/sub and HMAC-signed webhooks, JWT/OAuth2 auth and Git plus CI/CD deployment. In production with real clients.',
        },
        {
          org: 'Finca Directa S.A.S',
          role: 'CTO / Head of Systems',
          bond: 'services contract',
          dates: '2021 — Present',
          desc:
            'Built an RPA administrative-automation system (invoice OCR, bank statement retrieval, email classification and CRM synchronization) with Node.js and Python on Linux, with idempotency and human-in-the-loop validation, to remove repetitive manual work and reduce data-entry errors.',
        },
        {
          org: 'Indie Levels Studio',
          role: 'Backend Developer',
          bond: 'fixed-term contract',
          dates: '2021 — Present',
          desc:
            'Developed and maintained backend REST services and APIs (Node.js / TypeScript) with PostgreSQL for the products of a game studio with users across several countries, using Git version control and testing to keep releases stable.',
        },
        {
          org: 'Critertec',
          role: 'Systems Administrator',
          bond: 'fixed-term contract',
          dates: '2024 — 2026 (ended)',
          desc:
            'Operated and secured the production infrastructure (Linux, Docker, CI/CD) running the agency\'s digital solutions, keeping services continuously available.',
        },
        {
          org: 'Soy Digital · INDOTEL',
          role: 'Frontend Developer',
          bond: 'government project (Dominican Republic, via Critertec)',
          dates: '2023',
          desc:
            'Built the frontend with offline support and automatic synchronization for a national digital-literacy platform of the Dominican government, using React/Next.js and PWA, so registration worked even without a stable connection in the field.',
        },
      ],
      prev:
        'Earlier roles: Full Stack at ZENIT, INS, Kambban and IQpixels; freelance work in web, infrastructure and game development since 2014.',
      projTitle: 'Selected projects',
      projects: [
        {
          name: 'Ágora — AI agent platform',
          url: 'https://agora.elenxos.com',
          desc:
            'Designed and ran the full architecture: an Express / NestJS microservices backend on Cloud Run, multi-LLM orchestration (OpenAI, Anthropic, Gemini, DeepSeek, xAI) with bring-your-own-key, real-time communication (socket.io) and execution in Docker workers. Agent engine with 40+ registered tools, an AES-256-GCM vault and an MCP server. Deployed and running.',
        },
        {
          name: 'ST — executable formal-logic language',
          desc:
            'A language published on npm with its own CDCL SAT solver, type theory and more than 6,000 automated tests (Jest). Bridges formal logic and software engineering; it is the logical core of Ágora.',
        },
      ],
      stackTitle: 'Stack',
      stack: [
        { label: 'Backend', items: 'Node.js · NestJS · Express · TypeScript · Python · REST APIs · microservices' },
        { label: 'Data', items: 'PostgreSQL · MongoDB · Redis · SQLite' },
        { label: 'Cloud & DevOps', items: 'Docker · Linux · GCP / Cloud Run · Git · CI/CD' },
        { label: 'AI / Agents', items: 'LLM (OpenAI/Anthropic) · RAG · MCP · OCR' },
        { label: 'Security', items: 'JWT · OAuth2 · HMAC · AES-256-GCM' },
        { label: 'Frontend', items: 'React · Next.js · PWA' },
        { label: 'Testing', items: 'Jest · unit testing · WebSockets / real-time' },
      ],
      eduTitle: 'Education',
      education: [
        { title: 'Technical Degree in Software Development', meta: 'SENA · formal qualification' },
        { title: 'Self-taught / empirical profile', meta: '10+ years in production · roles weigh more than the degree' },
        { title: 'Philosophy (in progress)', meta: 'Universidad de Antioquia · grounding in logic and reasoning' },
      ],
      langTitle: 'Languages',
      languages: [
        { name: 'Spanish', level: 'Native' },
        { name: 'English', level: 'strong technical reading/writing · conversational improving' },
      ],
    },
    philo: {
      role: 'Philosopher · Formal logic and reasoning',
      location: 'Medellín, Colombia · Philosophy, Universidad de Antioquia',
      profileTitle: 'Profile',
      profile:
        'Philosophy student at Universidad de Antioquia, with a strong leaning toward formal logic, analytic philosophy and the intersection between philosophy and computation. I don\'t stop at commentary: I build executable formal systems —where an argument becomes code you can run and verify— and I write about philosophy applied to the machine. I came to philosophy from computing and found in it a method for reasoning with rigor and a bridge between symbolic logic and engineering. I learned much of what is human by moderating communities of thousands, and I treat thinking as a discipline, not as an ornament.',
      areasTitle: 'Areas of work',
      areas: [
        {
          title: 'Formal and symbolic logic',
          desc:
            'Propositional and predicate calculus, proof systems and semantics. The core of my training and my work: logic as the backbone of reasoning.',
        },
        {
          title: 'Analytic philosophy and epistemology',
          desc:
            'Analysis of language and argument, the conditions of knowledge, justification and truth. Clarity and precision over empty rhetoric.',
        },
        {
          title: 'Philosophy of mind and of AI',
          desc:
            'What it means to understand, what a machine does when it "reasons", and where the limits between computation and meaning lie. Where my philosophy and my technical practice meet.',
        },
        {
          title: 'Ethics, argumentation and rhetoric',
          desc:
            'Practical reason, decision and dialogue. The Gorgias as a compass: the difference between persuading and showing what is true.',
        },
      ],
      projTitle: 'Flagship project',
      flagship: {
        name: 'ST — executable formal-logic language',
        desc:
          'A language published on npm with its own CDCL SAT solver, type theory and over 6,000 tests. It is tangible proof that logical rigor can leave the page: a bridge between analytic philosophy and engineering, where a formal system runs and is verified as software.',
      },
      writeTitle: 'Writing',
      writing:
        'Abstracción — blog at blog.stevenvallejo.com. I write about philosophy applied to the machine: logic, meaning and cognition seen from someone who builds the systems. Philosophy as method, and abstraction as a way of looking at the world.',
    },
  },
};
