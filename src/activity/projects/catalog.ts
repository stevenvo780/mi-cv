import { productos, type LocalizedText } from '@/data/frentes';
import type { BeastKind, ProjectIdentity } from './model';

interface PublishedProject extends ProjectIdentity { repo: string }
const bilingual = (text: string): LocalizedText => ({ es: text, en: text });

function product(id: string, repo: string, kind: BeastKind): PublishedProject {
  const entry = productos.find((item) => item.id === id);
  if (!entry) throw new Error('Unknown published project');
  return { id, repo, kind, name: bilingual(entry.nombre), description: entry.subtitulo ?? entry.descripcion, url: entry.url ?? entry.repo ?? `https://github.com/stevenvo780/${repo}` };
}

function tool(repo: string, kind: BeastKind, description: LocalizedText): PublishedProject {
  const url = `https://github.com/stevenvo780/${repo}`;
  const entry = productos.flatMap((item) => item.incluye ?? []).find((item) => item.url === url);
  if (!entry) throw new Error('Unknown published project');
  return { id: repo.toLowerCase(), repo, kind, name: typeof entry.nombre === 'string' ? bilingual(entry.nombre) : entry.nombre, description, url };
}

/** Public repositories that can also refresh through anonymous REST requests. */
export const PUBLIC_PROJECT_CATALOG: readonly PublishedProject[] = [
  product('cauce-v3', 'cauce-v3', 'hydra'),
  product('specorganon', 'SpecOrganon', 'sentinel'),
  product('nlp-to-logic', 'nlp-to-logic', 'sentinel'),
  product('stevenai', 'stevenai', 'nautilus'),
  product('clavis', 'clavis', 'moth'),
  product('estructuras-preontologicas', 'EstructurasPreontologicas', 'nautilus'),
  tool('night-harness', 'golem', { es: 'Infraestructura de automatización', en: 'Automation infrastructure' }),
  tool('MCP-delegate-agents', 'hydra', { es: 'Delegación de agentes de IA', en: 'AI agent delegation' }),
  tool('cloud-delegate', 'moth', { es: 'Delegación entre modelos', en: 'Delegation across models' }),
  tool('clawbar', 'sprout', { es: 'Asistente de escritorio', en: 'Desktop assistant' }),
  tool('reel-forge', 'golem', { es: 'Herramientas de creación audiovisual', en: 'Audiovisual creation tools' }),
  { id: 'mouseion', repo: 'mi-cv', kind: 'sprout', name: { es: 'Mouseîon', en: 'Mouseîon' }, description: { es: 'Este portafolio vivo', en: 'This living portfolio' }, url: 'https://www.stevenvallejo.com' },
];

function named(id: string, name: string, kind: BeastKind, es: string, en: string, url?: string): ProjectIdentity {
  return { id, name: bilingual(name), kind, description: { es, en }, ...(url ? { url } : {}) };
}

/** Owner-approved names. Private repository paths exist only in the local publisher configuration. */
export const PROJECT_CATALOG: readonly ProjectIdentity[] = [
  ...PUBLIC_PROJECT_CATALOG,
  named('argos', 'Argos', 'sentinel', 'Verificación y herramientas de trabajo', 'Verification and work tools'),
  named('gravitatoria', 'Gravitatoria', 'nautilus', 'Un ecosistema de negocios conectados', 'An ecosystem of connected businesses', 'https://gravitatoria.humanizar.tech/'),
  named('educacion-cooperativa', 'Educación Cooperativa', 'moth', 'Educación y cooperación', 'Education and cooperation', 'https://github.com/stevenvo780/EducacionCooperativa'),
  named('atlas', 'Atlas', 'hydra', 'Investigación y experimentación', 'Research and experimentation', 'https://github.com/stevenvo780/AtlasParaIsa'),
  named('graf-motor', 'Graf · Motor', 'golem', 'El motor de la plataforma comercial', 'The commerce platform engine', 'https://www.graf.com.co'),
  named('finca-directa', 'Finca Directa', 'golem', 'Automatización de operaciones', 'Operations automation'),
  named('graf-clientes', 'Graf · Clientes', 'sprout', 'La experiencia de los clientes', 'The customer experience', 'https://www.graf.com.co'),
  named('xenia-crm', 'Xenía · CRM', 'sentinel', 'Relaciones y gestión comercial', 'Customer relations and commerce', 'https://xenia.stevenvallejo.com'),
  named('graf-administracion', 'Graf · Administración', 'nautilus', 'Herramientas de gestión comercial', 'Commerce management tools', 'https://www.graf.com.co'),
  named('st', 'ST', 'sprout', 'Un lenguaje para la lógica', 'A language for logic', 'https://github.com/stevenvo780/ST'),
  named('xenia-operaciones', 'Xenía · Operaciones', 'hydra', 'El trabajo detrás de la operación', 'The work behind the operation'),
  named('humanizar-comercial', 'Humanizar · Comercial', 'moth', 'Desarrollo del frente comercial', 'Commercial development'),
  named('kosmos', 'Kósmos', 'nautilus', 'Un atlas de experimentos', 'An atlas of experiments', 'https://kosmos.stevenvallejo.com'),
  named('humanizar-mercado', 'Humanizar · Mercado', 'moth', 'Investigación de mercado', 'Market research'),
  named('humanizar-documentacion', 'Humanizar · Documentación', 'sprout', 'El conocimiento del proyecto', 'Project knowledge'),
  named('congreso-filosofia', 'Congreso de Filosofía', 'nautilus', 'Filosofía y encuentro académico', 'Philosophy and academic exchange'),
  named('humanizar-agente', 'Humanizar · Agente IA', 'hydra', 'Automatización con agentes', 'Agent automation', 'https://github.com/stevenvo780/humanizar-ai-agent'),
];
