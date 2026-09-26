// Banco de pruebas de una pieza de arte de la home (src/components/home/art/<id>.tsx + <id>.css), sin Next: renderiza
// la pieza dentro de su marco real (la tarjeta o el catálogo, con home.css, _shared.css y las fuentes de la home), la
// fotografía en reposo, activa, en móvil y con movimiento reducido, y comprueba el contrato de _shared.css.
//   npx tsx scripts/art-harness.mts <id> [--out <carpeta>]
// Imprime un informe JSON (y lo guarda junto a las capturas). «ok: false» si algo del contrato falla.
import { createRequire } from 'node:module';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { transform } from 'esbuild';
import { chromium } from '@playwright/test';
import { renderToStaticMarkup } from 'react-dom/server';
import * as CatalogTileModule from '@/components/home/CatalogTile';
import * as ProductCardModule from '@/components/home/ProductCard';
import { HOME } from '@/content/home';
import { esCatalogo, productos } from '@/data/frentes';

// tsx compila los .tsx como CommonJS: el export por defecto llega envuelto.
const unwrap = <T,>(m: unknown): T => ((m as { default?: { default?: T } & T }).default?.default ?? (m as { default: T }).default) as T;
const CatalogTile = unwrap<typeof CatalogTileModule.default>(CatalogTileModule);
const ProductCard = unwrap<typeof ProductCardModule.default>(ProductCardModule);
import type { Locale } from '@/lib/site';

const [, , id, ...rest] = process.argv;
const OUT = rest[rest.indexOf('--out') + 1] && rest.includes('--out') ? rest[rest.indexOf('--out') + 1] : `/tmp/art-harness/${id}`;
const p = productos.find((x) => x.id === id);
if (!p) throw new Error(`No hay producto «${id}» en data/frentes.ts`);
const isCat = esCatalogo(p);
mkdirSync(OUT, { recursive: true });

const ROOT = new URL('../', import.meta.url);
const read = (rel: string) => readFileSync(new URL(rel, ROOT), 'utf8');
const artCss = read(`src/components/home/art/${id}.css`);
const FONTS: Record<string, string> = {
  hero: 'cormorant-hero',
  display: 'cormorant-home',
  sans: 'geist-home',
  mono: 'jetbrains-home',
  greek: 'greek-home',
  math: 'math-home',
  code: 'code-home',
};
const fontFaces = Object.entries(FONTS)
  .map(([k, f]) => `@font-face{font-family:'H-${k}';src:url('${new URL(`src/app/fonts/${f}.woff2`, ROOT).href}') format('woff2');font-weight:100 900;font-display:block}`)
  .join('\n');
const fontVars = Object.keys(FONTS)
  .map((k) => `--font-home-${k}:'H-${k}';`)
  .join('');

function page(locale: Locale) {
  const t = HOME[locale];
  const inner = isCat ? renderToStaticMarkup(CatalogTile({ c: p as never, locale, t })) : `<ul class="cards">${renderToStaticMarkup(ProductCard({ p: p!, locale, t }))}</ul>`;
  return `<!doctype html><html lang="${locale}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>${fontFaces}
${read('src/styles/home.css')}
${read('src/components/home/art/_shared.css')}
${artCss}
.home{${fontVars}} .home .front{display:block} .harness{padding:48px 24px;max-width:${isCat ? '54rem' : '27rem'};margin:0 auto}
@media (max-width:700px){.harness{padding:32px 16px}}</style></head>
<body><div class="home"><main><section class="sec sec-fronts"><div class="sec-inner"><div class="fronts">
<article class="front" data-front="${p!.frente}"><div class="front-body harness">${inner}</div></article>
</div></div></section></main></div></body></html>`;
}

// ── Lint estático del CSS: ámbito de los selectores, prefijo de los @keyframes, sin URL externas. ──
function lintCss(css: string): string[] {
  const errors: string[] = [];
  const src = css.replace(/\/\*[\s\S]*?\*\//g, '');
  if (!/^\s*@layer home\s*\{/.test(src)) errors.push('la hoja debe empezar por @layer home { … }');
  for (const m of src.matchAll(/@keyframes\s+([\w-]+)/g)) if (!m[1].startsWith(`art-${id}-`)) errors.push(`@keyframes ${m[1]}: debe empezar por art-${id}-`);
  for (const m of src.matchAll(/url\(\s*['"]?([^'")]+)/g)) if (!m[1].startsWith(`#art-${id}-`)) errors.push(`url(${m[1]}): solo referencias internas #art-${id}-…`);
  // Selectores de estilo: lo que precede a «{» fuera de @-reglas y de los pasos de @keyframes.
  let depth = 0;
  let buf = '';
  const stack: string[] = [];
  for (const ch of src) {
    if (ch === '{') {
      const head = buf.trim();
      const inKeyframes = stack.some((s) => s.startsWith('@keyframes'));
      if (head && !head.startsWith('@') && !inKeyframes) {
        for (const sel of head.split(/,(?![^(]*\))/).map((x) => x.trim())) {
          const ok = (sel.startsWith('.home') || sel.startsWith('html[data-motion')) && sel.includes(`.art-${id}`);
          if (!ok) errors.push(`selector fuera de ámbito: «${sel}» (debe empezar por .home y nombrar .art-${id})`);
        }
      }
      stack.push(head);
      depth++;
      buf = '';
    } else if (ch === '}') {
      stack.pop();
      depth--;
      buf = '';
    } else if (ch === ';') buf = '';
    else buf += ch;
  }
  if (depth !== 0) errors.push('llaves desequilibradas');
  return errors;
}

const fontkit = createRequire(import.meta.url)('next/dist/compiled/@next/font/dist/fontkit').default;
const openFont = fontkit.default ?? fontkit;
const charsets = Object.fromEntries(Object.entries(FONTS).map(([k, f]) => [`H-${k}`, new Set<number>(openFont(readFileSync(new URL(`src/app/fonts/${f}.woff2`, ROOT))).characterSet)]));

const report: Record<string, unknown> = { id, catalog: isCat, out: OUT, errors: [] as string[], warnings: [] as string[], shots: [] as string[] };
const errors = report.errors as string[];
const warnings = report.warnings as string[];
errors.push(...lintCss(artCss));
const minCss = (await transform(artCss, { loader: 'css', minify: true })).code;
report.cssBytes = { raw: Buffer.byteLength(minCss), gzip: gzipSync(minCss).length };
const cssBudget = isCat ? 9000 : 4500;
if (Buffer.byteLength(minCss) > cssBudget) errors.push(`CSS minificado ${Buffer.byteLength(minCss)} B > ${cssBudget} B`);

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
try {
  for (const locale of ['es', 'en'] as Locale[]) {
    const file = `${OUT}/${id}-${locale}.html`;
    writeFileSync(file, page(locale));
    const url = `file://${file}`;
    const host = isCat ? '.cat-scene' : '.card';
    const box = isCat ? '.cat-scene' : '.card-art';
    for (const [tag, vp, mobile, motion] of [
      ['desk', { width: 1280, height: isCat ? 1400 : 900 }, false, 'no-preference'],
      ['mob', { width: 390, height: 844 }, true, 'no-preference'],
      ['reduce', { width: 1280, height: isCat ? 1400 : 900 }, false, 'reduce'],
    ] as const) {
      if (locale === 'en' && tag !== 'desk') continue;
      const pg = await browser.newPage({ viewport: vp, isMobile: mobile, hasTouch: mobile, reducedMotion: motion, deviceScaleFactor: 1 });
      // tsx (esbuild con keepNames) envuelve las funciones con __name: las que pasan a la página lo necesitan allí.
      await pg.addInitScript('globalThis.__name = (f) => f');
      const pageErrors: string[] = [];
      pg.on('pageerror', (e) => pageErrors.push(e.message));
      await pg.goto(url);
      await pg.evaluate(() => document.fonts.ready);
      const target = pg.locator(isCat ? '.cat' : '.card');
      await pg.waitForTimeout(300);
      const shot = (name: string) => {
        const f = `${OUT}/${id}-${locale}-${name}.png`;
        (report.shots as string[]).push(f);
        return target.screenshot({ path: f });
      };
      await shot(`${tag}-a`);
      if (tag === 'desk') {
        await pg.waitForTimeout(1700);
        await shot('desk-b');
        await pg.locator(host).hover();
        await pg.waitForTimeout(1300);
        await shot('desk-active');
        if (isCat) {
          await pg.locator('.cat-kinds li').first().hover();
          await pg.waitForTimeout(700);
          await shot('desk-kind');
        }
        await pg.mouse.move(0, 0);
      }
      if (locale === 'es') {
        const facts = await pg.evaluate(
          ({ id, box }) => {
            // En las escenas, la pieza va dentro de .cat-art (display: contents; ArtBox) y se mide contra .cat-scene.
            const holder = document.querySelector(`${box} > .cat-art`) ?? document.querySelector(box)!;
            const art = holder.querySelector(':scope > .art') as HTMLElement | null;
            const root = holder.firstElementChild as HTMLElement | null;
            const running = () => document.getAnimations().filter((a) => a.playState === 'running' && art && a.effect && 'target' in a.effect && art.contains((a.effect as KeyframeEffect).target as Node)).length;
            const texts: { ch: string; family: string }[] = [];
            if (art) {
              const w = document.createTreeWalker(art, NodeFilter.SHOW_TEXT);
              for (let n = w.nextNode(); n; n = w.nextNode()) {
                const fam = getComputedStyle(n.parentElement!).fontFamily.split(',')[0].trim().replace(/^['"]|['"]$/g, '');
                for (const ch of n.textContent ?? '') if (ch.trim()) texts.push({ ch, family: fam });
              }
            }
            const rect = art?.getBoundingClientRect();
            const boxEl = document.querySelector(box) as HTMLElement;
            const boxRect = { width: boxEl.clientWidth, height: boxEl.clientHeight };
            const html = art?.outerHTML ?? '';
            return {
              rootOk: !!art && art === root && art.classList.contains(`art-${id}`) && art.getAttribute('aria-hidden') === 'true',
              fills: !!rect && Math.abs(rect.width - boxRect.width) < 2 && Math.abs(rect.height - boxRect.height) < 2,
              elements: art ? art.querySelectorAll('*').length : 0,
              focusable: art ? art.querySelectorAll('a,button,input,select,textarea,[tabindex],summary').length : 0,
              forbidden: /<(script|style|img|iframe|video|audio|link)\b/i.test(html) || /\s(href|src)=["']https?:/i.test(html),
              badIds: [...(art?.querySelectorAll('[id]') ?? [])].map((e) => e.id).filter((x) => !x.startsWith(`art-${id}-`)),
              running: running(),
              texts,
              html,
            };
          },
          { id, box },
        );
        if (tag === 'desk') {
          if (!facts.rootOk) errors.push(`la raíz de la caja debe ser <… class="art art-${id}" aria-hidden="true">`);
          if (!facts.fills) errors.push('la raíz no llena su caja (.art ya es position:absolute; inset:0)');
          if (facts.focusable) errors.push(`${facts.focusable} elementos enfocables dentro del arte`);
          if (facts.forbidden) errors.push('marcado prohibido: <script>, <style>, <img>, <iframe>, <video>, <link> o URL externa');
          if (facts.badIds.length) errors.push(`id sin prefijo art-${id}-: ${facts.badIds.join(', ')}`);
          const gz = gzipSync(facts.html).length;
          report.markupBytes = { raw: Buffer.byteLength(facts.html), gzip: gz };
          const mBudget = isCat ? 8000 : 3000;
          if (Buffer.byteLength(facts.html) > mBudget) errors.push(`marcado ${Buffer.byteLength(facts.html)} B > ${mBudget} B`);
          report.elements = facts.elements;
          if (facts.elements > (isCat ? 260 : 90)) warnings.push(`${facts.elements} elementos: muchos para animar`);
          report.runningAnimations = facts.running;
          const missing: Record<string, string> = {};
          for (const { ch, family } of facts.texts) {
            const set = charsets[family];
            if (!set) missing[family] = 'familia fuera de la home: usa --f-code, --f-math, --f-greek, --f-display o --f-sans';
            else if (!set.has(ch.codePointAt(0)!)) missing[family] = (missing[family] ?? '') + ch;
          }
          if (Object.keys(missing).length) errors.push(`glifos fuera del subconjunto de su familia: ${JSON.stringify(missing)}`);
          // Pausa del grafo: ninguna animación del arte sigue corriendo.
          await pg.evaluate(() => document.documentElement.setAttribute('data-motion', 'paused'));
          await pg.waitForTimeout(100);
          const stillRunning = await pg.evaluate(
            ({ box }) => {
              const art = document.querySelector(`${box} > .art, ${box} > .cat-art > .art`);
              return document.getAnimations().filter((a) => a.playState === 'running' && art && (a.effect as KeyframeEffect)?.target && art.contains((a.effect as KeyframeEffect).target as Node)).length;
            },
            { box },
          );
          if (stillRunning) errors.push(`${stillRunning} animaciones siguen con html[data-motion=paused]`);
        }
        if (tag === 'reduce' && facts.running) errors.push(`${facts.running} animaciones corren con prefers-reduced-motion: reduce`);
      }
      if (pageErrors.length) errors.push(`errores en la página: ${pageErrors.join(' | ')}`);
      await pg.close();
    }
  }
} finally {
  await browser.close();
}
report.ok = errors.length === 0;
writeFileSync(`${OUT}/report.json`, JSON.stringify(report, null, 1));
console.log(JSON.stringify(report, null, 1));
