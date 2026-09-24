/**
 * Genera src/assistant/profile.md, el perfil completo de Steven que el asistente de la home (/api/assistant) lleva en su
 * system prompt. Solo compila lo que ya está publicado; no escribe ni resume nada:
 *   - este repo: el catálogo (src/data/frentes.ts), «Mi historia» (Portrait/portraitData.ts), los textos de
 *     src/locales/es y los enlaces del ecosistema (src/lib/ecosystem.ts, src/lib/site.ts);
 *   - cv-informatico: el CV completo para bots (public/pdf/CV_ai_es.html), que ya trae la trayectoria entera;
 *   - cv-filosofo: el CV filosófico (public/index.html, la versión en español);
 *   - services: lo que ofrece praxis (app/content.ts, contentES).
 * De los repos hermanos se lee lo commiteado (git show HEAD:…), no el árbol de trabajo. El perfil va en español: el
 * prompt pide al modelo contestar en el idioma del visitante.
 *
 * Uso: npx tsx scripts/build-assistant-profile.mts   (SITES_DIR, por defecto /workspace/MySites, con los tres repos)
 * Vuelve a generarlo y commitéalo cada vez que cambie un CV, el catálogo o los servicios.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import ts from 'typescript';
import { PORTRAIT } from '../src/app/components/Portrait/portraitData';
import { HOME } from '../src/content/home';
import { catalogoGrupos, catalogoKinds, esCatalogo, frenteLinks, frenteOrder, frentesMeta, nombreItem, productos } from '../src/data/frentes';
import { EMAIL, SITES, WHATSAPP_URL } from '../src/lib/ecosystem';
import { PROFILES, SITE } from '../src/lib/site';

const SITES_DIR = process.env.SITES_DIR ?? '/workspace/MySites';
const OUT = 'src/assistant/profile.md';

/** Archivo commiteado de un repo hermano y el commit del que sale. */
function fromRepo(repo: string, path: string) {
  const cwd = `${SITES_DIR}/${repo}`;
  const git = (...args: string[]) => execFileSync('git', ['-C', cwd, ...args], { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 });
  return { text: git('show', `HEAD:${path}`), commit: git('rev-parse', '--short', 'HEAD').trim(), source: `${repo}@${git('rev-parse', '--short', 'HEAD').trim()}:${path}` };
}

const localeJson = (name: string): Record<string, string> => JSON.parse(readFileSync(`src/locales/es/common/${name}.json`, 'utf8'));

// ── HTML → texto ──────────────────────────────────────────────────────────────────────────────────────────────────

const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr']);
const BLOCK = new Set(['article', 'blockquote', 'dd', 'div', 'dt', 'figcaption', 'footer', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'header', 'li', 'ol', 'p', 'section', 'tr', 'ul']);
const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', middot: '·', mdash: '—', ndash: '–', laquo: '«', raquo: '»', hellip: '…', copy: '©' };
const decode = (s: string) =>
  s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e: string) =>
    e[0] === '#' ? String.fromCodePoint(e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : Number(e.slice(1))) : (ENTITIES[e.toLowerCase()] ?? m),
  );

/**
 * Texto legible de un documento: el <body> sin scripts, estilos ni SVG; titulares como «#», listas con «-», y cada
 * enlace externo con su URL entre <> (salvo que el texto ya sea la URL). `drop` descarta un elemento con su contenido.
 */
function htmlToText(html: string, drop: (tag: string, attrs: string) => boolean = () => false): string {
  const body = html
    .slice(Math.max(0, html.search(/<body\b/i)))
    .replace(/<(script|style|svg|noscript)\b[\s\S]*?<\/\1>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '');
  const out: string[] = [];
  const stack: { tag: string; skip: boolean; href?: string; at: number }[] = [];
  let skip = 0;
  for (const m of body.matchAll(/<(\/?)([a-zA-Z][\w-]*)([^>]*)>|([^<]+)/g)) {
    if (m[4] !== undefined) {
      // Como en HTML, los saltos de línea del código fuente son espacio: las líneas salen de los bloques y de <br>.
      if (!skip) out.push(decode(m[4]).replace(/\s+/g, ' '));
      continue;
    }
    const [, close, rawTag, attrs] = m;
    const tag = rawTag.toLowerCase();
    if (!close) {
      if (VOID.has(tag) || attrs.trimEnd().endsWith('/')) {
        if (tag === 'br' && !skip) out.push('\n');
        continue;
      }
      const dropped = drop(tag, attrs);
      stack.push({ tag, skip: dropped, href: /\bhref="(https?:[^"]+)"/.exec(attrs)?.[1], at: out.length });
      if (dropped) skip++;
      if (!skip && BLOCK.has(tag)) out.push(`\n${/^h[1-6]$/.test(tag) ? `${'#'.repeat(Number(tag[1]))} ` : tag === 'li' ? '- ' : ''}`);
      continue;
    }
    while (stack.length) {
      const el = stack.pop()!;
      if (!skip) {
        if (el.tag === 'a' && el.href) {
          const text = out.slice(el.at).join('').trim().replace(/^https?:\/\//, '').replace(/\.\.\.$|…$/, '');
          if (!text || !el.href.replace(/^https?:\/\//, '').startsWith(text)) out.push(` <${el.href}>`);
        }
        out.push(BLOCK.has(el.tag) ? '\n' : ' ');
      }
      if (el.skip) skip--;
      if (el.tag === tag) break;
    }
  }
  return out
    .join('')
    .replace(/[ \t]+/g, ' ')
    .replace(/ +([,.;:)»”])(?=\s|$)/g, '$1')
    .replace(/([(«“]) +/g, '$1')
    .replace(/ *\n */g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/** Baja un nivel los titulares de un bloque para que cuelgue de una sección «##» del perfil. */
const nest = (text: string, levels = 1) => text.replace(/^(#{1,6}) /gm, (_, h: string) => `${'#'.repeat(Math.min(6, h.length + levels))} `);

// ── Fuentes ───────────────────────────────────────────────────────────────────────────────────────────────────────

const cvEngineer = fromRepo('cv-informatico', 'public/pdf/CV_ai_es.html');
const cvPhilosopher = fromRepo('cv-filosofo', 'public/index.html');
const services = fromRepo('services', 'app/content.ts');

// El CV filosófico es bilingüe en el mismo HTML: se queda la versión en español (sin [data-lang-en]), sin la barra
// superior ni los botones de descarga de PDF.
const philosopherText = htmlToText(
  cvPhilosopher.text,
  (tag, attrs) => /\bdata-lang-en\b/.test(attrs) || /\bclass="topbar"/.test(attrs) || /\bdownload\b/.test(attrs) || tag === 'nav',
)
  // Los números sueltos de la lista de temas (1…7) y el «◆» decorativo no aportan nada.
  .replace(/^\d\n/gm, '')
  .replace(/◆ /g, '')
  .replace(/^# Steven Vallejo Ortiz\n+/m, '');
const engineerText = htmlToText(cvEngineer.text).replace(/^# Steven Vallejo Ortiz\n+/m, '').replace(/^Steven Vallejo Ortiz — CV completo\n+/m, '');

// services/app/content.ts es TypeScript sin imports: se transpila a CommonJS y se evalúa para leer contentES.
type Services = {
  hero: { eyebrow: string; h1: string; h1em: string; lead: string };
  sections: { flagship: { h3: string; h3em: string; fdesc: string; points: { bold: string; rest: string }[] }; finalCta: { h2: string; p: string } };
  services: { title: string; desc: string; price: string }[];
  capabilities: { title: string; desc: string }[];
  systems: { title: string; desc: string; href: string }[];
  steps: { h: string; p: string }[];
  trajectory: { company: string; role: string; period: string; line: string }[];
};
const servicesModule: { contentES?: Services } = {};
new Function('exports', ts.transpileModule(services.text, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText)(servicesModule);
const praxis = servicesModule.contentES;
if (!praxis) throw new Error('services/app/content.ts ya no exporta contentES');

// ── Documento ─────────────────────────────────────────────────────────────────────────────────────────────────────

const today = new Date().toISOString().slice(0, 10);
const es = HOME.es;
const about = localeJson('about');
const skills = localeJson('skills');
const portfolio = localeJson('portfolio');
const story = PORTRAIT.es;

const lines: string[] = [];
const push = (...l: string[]) => lines.push(...l);

push(
  '# Perfil de Steven Vallejo Ortiz',
  '',
  `Datos al ${today}. Compilado por scripts/build-assistant-profile.mts (repo mi-cv) a partir de lo publicado en sus sitios: ${[cvEngineer.source, cvPhilosopher.source, services.source].join(', ')} y el catálogo de stevenvallejo.com.`,
  '',
  '## Identidad y contacto',
  '',
  `- Nombre: Steven Vallejo Ortiz. ${es.meta.person}`,
  `- Roles: ${es.meta.jobTitle.join(' y ')}.`,
  '- Ubicación: Medellín, Antioquia, Colombia (GMT-5). Trabaja en remoto desde Colombia y presencial o híbrido en Medellín y el Valle de Aburrá.',
  `- WhatsApp: ${WHATSAPP_URL.split('?')[0]} (+57 302 395 4534, mi asistente personal).`,
  `- Correo: ${EMAIL}.`,
  `- GitHub: ${PROFILES.github} · LinkedIn: ${PROFILES.linkedin} · Instagram: ${PROFILES.instagram} · Medium: https://medium.com/@stevenvallejo780`,
  `- Temas que domina: ${es.meta.knowsAbout.join(', ')}.`,
  '',
  '## Sitios del ecosistema Mouseîon',
  '',
  `- ${SITE} — la portada: el catálogo de todos sus trabajos, con un grafo 3D que los relaciona, y este asistente. Su historia personal está en ${SITE}/es/lore.`,
  `- ${SITES.cvEngineer} — ${es.hero.cvEngineer}: su hoja de vida como ingeniero de software (con PDF descargable).`,
  `- ${SITES.cvPhilosopher} — ${es.hero.cvPhilosopher}: su hoja de vida como filósofo (con PDF descargable).`,
  `- ${SITES.services} — Práxis, sus servicios: qué ofrece, precios y cómo contratarlo.`,
  `- ${SITES.blog} — ${es.hero.blog}, su blog de filosofía, lógica e ingeniería.`,
  '',
  '## Sobre mí (texto de stevenvallejo.com, en primera persona de Steven)',
  '',
  ...['about.lead', 'about.p1', 'about.p2', 'about.p3', 'about.p4', 'about.p5'].flatMap((k) => [about[k], '']),
  ...['skills.mind', 'skills.ethics', 'skills.study', 'skills.education', 'skills.passion'].flatMap((k) => [skills[k], '']),
  `## Mi historia (${SITE}/es/lore, en primera persona de Steven)`,
  '',
  story.heroTitle,
  '',
  story.heroLead,
  '',
  story.bodyOfWork,
  '',
  story.epigraph,
  '',
  ...story.sections.flatMap((s) => [`### ${s.kicker} · ${s.title}`, '', ...s.body.flatMap((p) => [p, '']), s.question, '']),
  `## CV informático completo (${SITES.cvEngineer})`,
  '',
  nest(engineerText),
  '',
  `## CV filosófico (${SITES.cvPhilosopher})`,
  '',
  nest(philosopherText),
  '',
  `## Servicios · Práxis (${SITES.services})`,
  '',
  `${praxis.hero.eyebrow}. ${praxis.hero.h1} ${praxis.hero.h1em}. ${praxis.hero.lead}`,
  '',
  '### Qué puede hacer por un cliente (precios publicados)',
  '',
  ...praxis.services.map((s) => `- ${s.title} — ${s.price}. ${s.desc}`),
  '',
  '### Capacidades',
  '',
  ...praxis.capabilities.map((c) => `- ${c.title}: ${c.desc}`),
  '',
  '### Sistemas en producción que muestra',
  '',
  ...praxis.systems.map((s) => `- ${s.title} (${s.href}): ${s.desc}`),
  '',
  `### Caso de plataforma: ${praxis.sections.flagship.h3} ${praxis.sections.flagship.h3em}`,
  '',
  praxis.sections.flagship.fdesc,
  ...praxis.sections.flagship.points.map((p) => `- ${p.bold}${p.rest}`),
  '',
  '### Cómo trabaja',
  '',
  ...praxis.steps.map((s) => `- ${s.h}: ${s.p}`),
  '',
  `${praxis.sections.finalCta.h2} ${praxis.sections.finalCta.p}`,
  '',
  `## Catálogo de trabajos (${SITE}): ${es.fronts.eyebrow.toLowerCase()}`,
  '',
  'Cada trabajo es un sitio o un proyecto propio. «En línea» enlaza su versión actual; «próximamente» aún no tiene dominio propio.',
  '',
);
for (const fid of frenteOrder) {
  const f = frentesMeta[fid];
  push(`### Frente ${f.nombre.es} — ${f.tagline.es}`, '', f.descripcion.es, '');
  for (const p of productos.filter((x) => x.frente === fid)) {
    const where = [p.url && `sitio: ${p.url}`, p.repo && `código: ${p.repo}`, p.status === 'soon' ? 'próximamente' : 'en línea'].filter(Boolean).join(' · ');
    push(`- ${p.nombre}${p.subtitulo ? ` (${p.subtitulo.es})` : ''}${p.badge ? ` [${p.badge.es}]` : ''}: ${p.descripcion.es} (${where})`);
    // Un catálogo reúne otros sitios, cursos o repositorios: el asistente conoce cada uno y su enlace.
    if (esCatalogo(p)) {
      push(`  - Es un catálogo: reúne ${p.incluye.length} ${p.unidad.es}.`);
      for (const g of catalogoGrupos(p)) {
        push(`  - ${catalogoKinds[g.kind].es} (${g.items.length}): ${g.items.map((i) => (i.url ? `${nombreItem(i, 'es')} <${i.url}>` : `${nombreItem(i, 'es')} (privado, sin enlace público)`)).join(' · ')}`);
      }
    }
  }
  const links = frenteLinks[fid];
  if (links?.length) push(`- Enlaces del frente: ${links.map((l) => `${l.label.es} ${l.url}`).join(' · ')}`);
  push('');
}
// Fuera del perfil: «Sueño Dorado», descrito en una línea como «Proyecto de esquema ponzi.». Sin más contexto, el
// asistente lo repetiría tal cual ante cualquier visitante; si vuelve, que sea con una descripción que Steven revise.
const OMIT = new Set(['suenoDorado']);
push('## Portafolio ampliado (descripciones de proyectos y repositorios de stevenvallejo.com)', '');
for (const [key, name] of Object.entries(portfolio)) {
  const id = key.match(/^portfolio\.project\.(.+)$/)?.[1];
  const desc = id && !OMIT.has(id) && portfolio[`portfolio.description.${id}`];
  if (desc) push(`- ${name}: ${desc}`);
}
push('');

const doc = `${lines.join('\n').replace(/\n{3,}/g, '\n\n').trim()}\n`;
writeFileSync(OUT, doc);
console.log(`${OUT}: ${doc.length} caracteres, ${doc.split('\n').length} líneas`);
