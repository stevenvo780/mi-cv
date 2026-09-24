import aboutEs from '@/locales/es/common/about.json';
import aboutEn from '@/locales/en/common/about.json';
import { frenteOrder } from '@/data/frentes';
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
  meta: { title: string; description: string; jobTitle: string[]; knowsAbout: string[] };
  nav: { skip: string; menu: string; method: string; path: string; fronts: string; proof: string; contact: string; language: string; hire: string };
  hero: { kicker: string; first: string; last: string; role: string; lead: string; ctaHire: string; ctaStory: string; figcaption: (nodes: number, edges: number) => string; listLink: string };
  method: { eyebrow: string; title: string; lead: string; paragraphs: string[]; epigraph: string; logic: string; engineering: string };
  path: { eyebrow: string; title: string; lead: string };
  fronts: { eyebrow: string; title: string; lead: string; searchLabel: string; searchPlaceholder: string; noResults: string; openFront: string; visit: string; code: string; soon: string };
  proof: { eyebrow: string; title: string; lead: string; stackTitle: string; stackLead: string };
  contact: {
    eyebrow: string;
    title: string;
    lead: string;
    hire: string;
    email: string;
    whatsapp: string;
    cvPhilosopher: string;
    cvEngineer: string;
    blog: string;
    story: string;
    social: string;
    ecosystem: string;
    foot: string;
  };
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
      title: 'Steven Vallejo Ortiz — Ingeniero de software y filósofo',
      description:
        'Ingeniero de software y filósofo. Backend, IA agéntica y lógica formal: explora mi trayectoria como un grafo vivo de empresas, productos e ideas.',
      jobTitle: ['Ingeniero de software', 'Filósofo'],
      knowsAbout: KNOWS_ES,
    },
    nav: {
      skip: 'Saltar al contenido',
      menu: 'Menú',
      method: 'Método',
      path: 'Trayectoria',
      fronts: 'Frentes',
      proof: 'Prueba',
      contact: 'Contacto',
      language: 'English',
      hire: 'Contratar',
    },
    hero: {
      kicker: 'Mouseîon · stevenvallejo.com',
      first: 'Steven',
      last: 'Vallejo Ortiz',
      role: 'Ingeniero de software · Filósofo',
      lead: 'Pensar antes de construir. Sistemas que sostienen lo que dicen que hacen.',
      ctaHire: 'Contratar servicios',
      ctaStory: 'Mi historia',
      figcaption: (nodes, edges) => `Este grafo es mi trayectoria: ${nodes} nodos, ${edges} relaciones reales`,
      listLink: 'Verlo como lista',
    },
    method: {
      eyebrow: '01 · Método',
      title: 'Dos lenguajes, un método',
      lead: 'La lógica y la ingeniería son, para mí, la misma disciplina: definir con precisión, distinguir lo necesario de lo accesorio y construir lo que se sostiene.',
      paragraphs: [aboutEs['about.p1'], aboutEs['about.p2'], aboutEs['about.p3']],
      epigraph: '«La abstracción no es alejarse del problema. Es verlo desde la altura exacta.»',
      logic: 'Lógica · Filosofía',
      engineering: 'Ingeniería · Sistemas',
    },
    path: {
      eyebrow: '02 · Trayectoria',
      title: 'Del servidor a la flota de agentes',
      lead: 'De la infraestructura y los videojuegos a plataformas que facturan, y a la flota de agentes que hoy opera este portafolio.',
    },
    fronts: {
      eyebrow: '03 · Frentes',
      title: `${countWord('es', frenteOrder.length)} frentes, un mismo criterio`,
      lead: 'Cada producto es una tesis sobre lógica, sistemas complejos o software que genera caja.',
      searchLabel: 'Buscar en el portafolio',
      searchPlaceholder: 'Producto, tecnología o tema…',
      noResults: 'Sin resultados. Prueba con otro término.',
      openFront: 'Explorar el frente',
      visit: 'Visitar',
      code: 'Código',
      soon: 'Próximamente',
    },
    proof: {
      eyebrow: '04 · Prueba',
      title: 'Evidencia, no adjetivos',
      lead: 'Cifras tomadas de los propios proyectos. Lo que no se puede verificar no aparece aquí.',
      stackTitle: 'Herramientas',
      stackLead: 'Lo que he usado en producción y en investigación, agrupado por familia.',
    },
    contact: {
      eyebrow: '05 · Contacto',
      title: 'Construyamos algo que se sostenga',
      lead: 'Consultoría, desarrollo a medida, IA aplicada o una conversación sobre lógica: escríbeme.',
      hire: 'Contratar servicios',
      email: 'Escribir un correo',
      whatsapp: 'WhatsApp',
      cvPhilosopher: 'CV de filósofo',
      cvEngineer: 'CV de ingeniero',
      blog: 'Blog · Scholḗ',
      story: 'Mi historia',
      social: 'Redes',
      ecosystem: 'Ecosistema',
      foot: 'Pensar antes de construir: ese es todo el método.',
    },
  },
  en: {
    meta: {
      title: 'Steven Vallejo Ortiz — Software engineer & philosopher',
      description:
        'Software engineer and philosopher. Backend, agentic AI and formal logic: explore my path as a living graph of companies, products and ideas.',
      jobTitle: ['Software engineer', 'Philosopher'],
      knowsAbout: KNOWS_EN,
    },
    nav: {
      skip: 'Skip to content',
      menu: 'Menu',
      method: 'Method',
      path: 'Path',
      fronts: 'Fronts',
      proof: 'Proof',
      contact: 'Contact',
      language: 'Español',
      hire: 'Hire me',
    },
    hero: {
      kicker: 'Mouseîon · stevenvallejo.com',
      first: 'Steven',
      last: 'Vallejo Ortiz',
      role: 'Software engineer · Philosopher',
      lead: 'Think before you build. Systems that hold up what they say they do.',
      ctaHire: 'Hire me',
      ctaStory: 'My story',
      figcaption: (nodes, edges) => `This graph is my path: ${nodes} nodes, ${edges} real relations`,
      listLink: 'See it as a list',
    },
    method: {
      eyebrow: '01 · Method',
      title: 'Two languages, one method',
      lead: 'To me, logic and engineering are the same discipline: define precisely, tell the essential from the accessory, and build what holds.',
      paragraphs: [aboutEn['about.p1'], aboutEn['about.p2'], aboutEn['about.p3']],
      epigraph: '“Abstraction is not stepping away from the problem. It is seeing it from the exact height.”',
      logic: 'Logic · Philosophy',
      engineering: 'Engineering · Systems',
    },
    path: {
      eyebrow: '02 · Path',
      title: 'From the server room to the agent fleet',
      lead: 'From infrastructure and video games to platforms that bill, and to the agent fleet that runs this portfolio today.',
    },
    fronts: {
      eyebrow: '03 · Fronts',
      title: `${countWord('en', frenteOrder.length)} fronts, one standard`,
      lead: 'Each product is a thesis on logic, complex systems or software that makes money.',
      searchLabel: 'Search the portfolio',
      searchPlaceholder: 'Product, technology or topic…',
      noResults: 'No results. Try another term.',
      openFront: 'Explore the front',
      visit: 'Visit',
      code: 'Code',
      soon: 'Coming soon',
    },
    proof: {
      eyebrow: '04 · Proof',
      title: 'Evidence, not adjectives',
      lead: 'Figures taken from the projects themselves. If it cannot be verified, it is not here.',
      stackTitle: 'Tools',
      stackLead: 'What I have used in production and research, grouped by family.',
    },
    contact: {
      eyebrow: '05 · Contact',
      title: 'Let’s build something that holds',
      lead: 'Consulting, custom development, applied AI or a conversation about logic: write to me.',
      hire: 'Hire me',
      email: 'Send an email',
      whatsapp: 'WhatsApp',
      cvPhilosopher: 'Philosopher CV',
      cvEngineer: 'Engineer CV',
      blog: 'Blog · Scholḗ',
      story: 'My story',
      social: 'Social',
      ecosystem: 'Ecosystem',
      foot: 'Think before you build: that is the whole method.',
    },
  },
};
