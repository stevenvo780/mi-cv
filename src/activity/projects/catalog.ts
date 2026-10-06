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

/** Explicit published selection. Never enumerate an authenticated account's private repositories. */
export const PROJECT_CATALOG: readonly PublishedProject[] = [
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
