import type { FrenteId } from '@/data/frentes';
import type { Bilingual } from './model';

/** Claves de experience.json, en el orden canónico del CV. */
export const EMPRESAS = [
  'critertec',
  'humanizar',
  'fincaDirecta',
  'indieLevels',
  'zenit',
  'ins',
  'kambban',
  'sena',
  'iqpixels',
  'infraestructura',
  'videojuegos',
  'appsWeb',
] as const;
export type EmpresaKey = (typeof EMPRESAS)[number];

export const EMPRESAS_PRINCIPALES: ReadonlySet<EmpresaKey> = new Set(['critertec', 'humanizar', 'fincaDirecta', 'indieLevels']);

/** Proyectos de achievements.json que no son productos de frentes.ts. */
export const EXTRA_PROJECTS: { id: string; label: Bilingual; frente: FrenteId }[] = [
  { id: 'soy-digital', label: { es: 'Soy Digital · INDOTEL', en: 'Soy Digital · INDOTEL' }, frente: 'informatica' },
  { id: 'sinergia-pos', label: { es: 'Sinergia POS', en: 'Sinergia POS' }, frente: 'enterprise' },
  { id: 'fiar', label: { es: 'FIAR', en: 'FIAR' }, frente: 'enterprise' },
  { id: 'emw', label: { es: 'EMW', en: 'EMW' }, frente: 'informatica' },
  { id: 'mera-vuelta', label: { es: 'Mera Vuelta', en: 'Mera Vuelta' }, frente: 'informatica' },
  { id: 'cafeteria-del-caos', label: { es: 'Cafetería del Caos', en: 'Cafetería del Caos' }, frente: 'filosofia' },
];

/** Empresa → proyectos construidos allí (evidencia: achievements.json y frentes.ts). */
export const EMPRESA_PROYECTOS: Partial<Record<EmpresaKey, string[]>> = {
  humanizar: ['cauce-v3', 'eikon', 'graf', 'demeter', 'sinergia-pos', 'fiar'],
  critertec: ['soy-digital'],
};

export type ToolGroupId =
  | 'backend'
  | 'frontend'
  | 'cloud'
  | 'datos'
  | 'mensajeria'
  | 'protocolos'
  | 'ia'
  | 'aiTools'
  | 'juegos'
  | 'gestion'
  | 'paradigmas'
  | 'logica';

/** Cada clave `tools.item.*` de tools.json pertenece exactamente a un grupo (lo verifica un test). */
export const TOOL_GROUPS: Record<ToolGroupId, { label: Bilingual; frente: FrenteId; tools: string[] }> = {
  backend: {
    label: { es: 'Back-end', en: 'Back-end' },
    frente: 'informatica',
    tools: ['nodejs', 'typescript', 'nestjs', 'hapi', 'python', 'express', 'php', 'laravel', 'symfony', 'slim', 'bash', 'dotnet', 'C#', 'flask', 'pysimplegui', 'blockchain'],
  },
  frontend: {
    label: { es: 'Front-end', en: 'Front-end' },
    frente: 'informatica',
    tools: ['reactjs', 'javascript', 'html', 'css3', 'nextjs', 'reactNative', 'laravelBlade', 'vuejs', 'angular'],
  },
  cloud: {
    label: { es: 'DevOps y cloud', en: 'DevOps & cloud' },
    frente: 'informatica',
    tools: ['git', 'linuxHosting', 'googleCloud', 'vercel', 'aws', 'docker', 'azure', 'render', 'gitActions', 'googleArtifacts'],
  },
  datos: {
    label: { es: 'Bases de datos', en: 'Databases' },
    frente: 'informatica',
    tools: ['relationalDB', 'nosql', 'graphDB', 'inMemory', 'dynamodb', 'couchDB', 'cassandra', 'elasticSearch', 'neon', 'redis', 'sqlite', 'mysql', 'MariaDB', 'postgresql', 'neo4j', 'mongodb', 'firebase'],
  },
  mensajeria: {
    label: { es: 'Mensajería y colas', en: 'Messaging & queues' },
    frente: 'informatica',
    tools: ['rabbitmq', 'amazonSQS', 'googlePubSub', 'zeroMQ', 'apacheKafka', 'sqs', 'mqtt'],
  },
  protocolos: {
    label: { es: 'Protocolos y APIs', en: 'Protocols & APIs' },
    frente: 'informatica',
    tools: ['rest', 'graphql', 'soap', 'rpc', 'websocket', 'grpc'],
  },
  ia: {
    label: { es: 'IA y cómputo científico', en: 'AI & scientific computing' },
    frente: 'ciencias',
    tools: ['numpy', 'tensorflow', 'huggingface', 'stableDiffusion', 'cuda', 'parallelization', 'pytorch', 'opencv', 'pandas', 'cupy', 'keras', 'matplotlib', 'whisper', 'llama'],
  },
  aiTools: {
    label: { es: 'Modelos y asistentes de IA', en: 'AI models & assistants' },
    frente: 'informatica',
    tools: ['chatgpt', 'githubCopilot', 'googleCloudAI', 'deebseek', 'claude', 'googleGemini', 'openia'],
  },
  juegos: {
    label: { es: 'Videojuegos y XR', en: 'Games & XR' },
    frente: 'informatica',
    tools: ['unity', 'vr', 'ar', 'capturaDeDatos', 'roblox', 'decentraland'],
  },
  gestion: {
    label: { es: 'Gestión de proyectos', en: 'Project management' },
    frente: 'informatica',
    tools: ['scrum', 'trello', 'tdd', 'kanban', 'jira', 'clickup', 'notion', 'excel', 'advance_documents'],
  },
  paradigmas: {
    label: { es: 'Paradigmas', en: 'Paradigms' },
    frente: 'informatica',
    tools: ['objectOriented', 'functional', 'procedural', 'eventDriven', 'logicProgramming', 'declarative', 'reactive', 'concurrent', 'aspectOriented', 'metaprogramming', 'structuredProgramming', 'cqs'],
  },
  logica: {
    label: { es: 'Lógica y filosofía', en: 'Logic & philosophy' },
    frente: 'filosofia',
    tools: ['formalLogic', 'symbolicLogic', 'analyticPhilosophy', 'epistemology', 'philosophyOfMind', 'philosophyOfAI', 'ethics', 'argumentation', 'typeTheory', 'satSolving'],
  },
};

/** Producto → herramientas mencionadas en su descripción de frentes.ts o achievements.json. */
export const PRODUCT_TECH: Record<string, string[]> = {
  agora: ['nestjs', 'nextjs', 'docker', 'websocket', 'googleCloud'],
  clavis: ['nextjs'],
  debatesuite: ['javascript'],
  complexlab: ['nextjs', 'python'],
  'nlp-to-logic': ['vercel', 'logicProgramming'],
  stevenai: ['llama', 'deebseek', 'python', 'cuda', 'nextjs'],
  stevendevbox: ['whisper', 'bash', 'linuxHosting'],
  communityos: ['nestjs', 'neon', 'postgresql', 'typescript'],
  devkits: ['reactjs', 'express', 'nextjs', 'flask', 'docker'],
  'devkits-hours': ['nextjs', 'sqlite'],
  'devkits-crm': ['reactjs', 'express', 'neon', 'postgresql', 'vercel'],
  scrapekit: ['python', 'neon', 'vercel'],
  warehouse: ['reactjs', 'neon', 'vercel'],
  aporia: ['nextjs', 'neon', 'firebase'],
  'cauce-v3': ['claude', 'googleGemini', 'openia', 'docker', 'typescript', 'eventDriven'],
  eikon: ['typescript'],
  prizma: ['nestjs', 'nextjs', 'googleCloud', 'eventDriven'],
  graf: ['nestjs'],
  'soy-digital': ['javascript'],
  emw: ['nestjs', 'mysql', 'redis'],
  'sinergia-pos': ['nestjs'],
  fiar: ['nestjs'],
};

/** Concepto (clave de tools.json del grupo 'logica') → productos que fundamenta. */
export const CONCEPT_PRODUCTS: Record<string, string[]> = {
  formalLogic: ['agora', 'nlp-to-logic'],
  symbolicLogic: ['nlp-to-logic'],
  satSolving: ['agora', 'nlp-to-logic'],
  typeTheory: ['nlp-to-logic'],
  analyticPhilosophy: ['clavis', 'debatesuite'],
  argumentation: ['debatesuite', 'cafeteria-del-caos'],
  epistemology: ['estructuras-preontologicas', 'complexlab'],
  philosophyOfMind: ['clavis'],
  philosophyOfAI: ['stevenai', 'cauce-v3'],
};

/** Productos que unen lógica/filosofía e ingeniería (franja central de la forma "hemisferios"). */
export const BRIDGE_PRODUCTS: ReadonlySet<string> = new Set(['nlp-to-logic', 'complexlab', 'estructuras-preontologicas', 'clavis']);
