import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { gzipSync } from 'node:zlib';
import type { Page } from '@playwright/test';
import { GA_ID, GTAG_URL, expect, test } from './fixtures';

const SITE = 'https://www.stevenvallejo.com';
const SHOTS = '/workspace/.scratch-steven-redesign/shots';

// Subconjuntos de fuente de la home ([locale]/(home)/fonts.ts, spec §3.2 y §5.2), generados por scripts/subset-fonts.sh.
const HOME_FONTS = ['cormorant-hero', 'cormorant-home', 'cormorant-home-italic', 'geist-home', 'jetbrains-home'] as const;
type HomeFont = (typeof HOME_FONTS)[number];
const fontBytes = (name: string) => readFileSync(`src/app/fonts/${name}.woff2`);
const sha1 = (b: Buffer) => createHash('sha1').update(b).digest('hex');
// fontkit viene compilado dentro de next (lo usa next/font/local); next está fijado a 16.3.6.
const fontkit = createRequire(`${process.cwd()}/package.json`)('next/dist/compiled/@next/font/dist/fontkit').default;
const openFont: (buffer: Buffer) => { characterSet: number[] } = fontkit.default ?? fontkit;

function collectErrors(page: Page) {
  const errors: string[] = [];
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  page.on('pageerror', (e) => errors.push(e.message));
  return errors;
}

type CspWindow = Window & { __csp?: string[] };

/** Registra cada evento securitypolicyviolation (también los que no llegan a la consola) en window.__csp. */
async function watchCsp(page: Page) {
  await page.addInitScript(() => {
    document.addEventListener('securitypolicyviolation', (e) => {
      const w = window as CspWindow;
      (w.__csp ??= []).push(`${e.violatedDirective} ${e.blockedURI}`);
    });
  });
  return () => page.evaluate(() => (window as CspWindow).__csp ?? []);
}

/** Baja hasta el final para que monte lo diferido (canvas del portal, chunks con ssr: false) y espera la red. */
async function scrollToEnd(page: Page) {
  await page.evaluate(async () => {
    for (let y = 0; y < document.documentElement.scrollHeight; y += 500) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 50));
    }
  });
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500);
}

/**
 * Texto que pinta cada familia dentro de `root`, por «familia|estilo» (la primera familia de la pila computada):
 * nodos de texto visibles con su text-transform, `content` de ::before/::after y placeholders.
 */
function paintedText(page: Page, root: string) {
  return page.evaluate((root) => {
    const acc: Record<string, string> = {};
    const add = (el: Element, text: string, pseudo: string | null = null) => {
      const cs = getComputedStyle(el, pseudo);
      const key = `${cs.fontFamily.split(',')[0].trim().replace(/["']/g, '')}|${cs.fontStyle}`;
      acc[key] = (acc[key] ?? '') + (cs.textTransform === 'uppercase' ? text.toUpperCase() : text);
    };
    const walker = document.createTreeWalker(document.querySelector(root)!, NodeFilter.SHOW_TEXT);
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      const el = n.parentElement!;
      if (el.closest('script, style, noscript') || !el.checkVisibility()) continue;
      add(el, n.textContent ?? '');
    }
    for (const el of document.querySelectorAll(`${root} *`)) {
      for (const pseudo of ['::before', '::after']) {
        const content = getComputedStyle(el, pseudo).content;
        if (content.startsWith('"')) add(el, JSON.parse(content) as string, pseudo);
      }
      if (el instanceof HTMLInputElement && el.placeholder) add(el, el.placeholder);
    }
    return acc;
  }, root);
}

/** Por archivo de fuente, los caracteres pintados sin glifo en él, salvo los que se aceptan del sistema. */
function missingGlyphs(used: Record<string, string>, files: Record<string, string>, systemGlyphs: Partial<Record<string, string>>) {
  const missing: Record<string, string> = {};
  for (const [key, text] of Object.entries(used)) {
    const file = files[key];
    if (!file) {
      missing[key] = `familia inesperada: ${[...new Set(text)].join('')}`;
      continue;
    }
    const glyphs = new Set(openFont(fontBytes(file)).characterSet);
    const lack = [...new Set(text)].filter((c) => !/\s/.test(c) && !glyphs.has(c.codePointAt(0)!) && !systemGlyphs[file]?.includes(c));
    if (lack.length) missing[file] = (missing[file] ?? '') + lack.join('');
  }
  return missing;
}

for (const locale of ['es', 'en'] as const) {
  test.describe(`/${locale}`, () => {
    test('estructura, SEO y cero errores de consola', async ({ page }, info) => {
      const errors = collectErrors(page);
      await page.goto(`/${locale}`);
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.locator('html')).toHaveAttribute('lang', locale);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `${SITE}/${locale}`);
      await expect(page.locator('link[rel="alternate"][hreflang="es"]')).toHaveAttribute('href', `${SITE}/es`);
      await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute('href', `${SITE}/en`);
      await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveAttribute('href', `${SITE}/en`);
      await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#05090b');
      await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(1);
      const ld = JSON.parse((await page.locator('script[type="application/ld+json"]').textContent()) ?? '{}');
      expect(ld['@graph'].map((n: { '@type': string }) => n['@type'])).toEqual(['WebSite', 'ProfilePage', 'Person', 'ItemList']);
      // El póster del grafo: archivo con hash en /graph (no SVG inline, spec §5.2), cargado.
      const poster = page.locator('.stage-poster img');
      await expect(poster).toHaveAttribute('src', /^\/graph\/poster\.[0-9a-f]{10}\.svg$/);
      await expect.poll(() => poster.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
      expect(await page.locator('meta[property="og:image"]').count()).toBeGreaterThan(0);
      const title = await page.title();
      expect(title.length).toBeLessThanOrEqual(60);
      const description = await page.locator('meta[name="description"]').getAttribute('content');
      expect(description!.length).toBeLessThanOrEqual(155);
      // Las apariciones van con animation-timeline: view(): en una captura de página completa, lo que queda
      // fuera del viewport sale en su fotograma inicial (opacidad 0). Con movimiento reducido se ve el estado final.
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.screenshot({ path: `${SHOTS}/${info.project.name}-${locale}.png`, fullPage: true });
      expect(errors).toEqual([]);
    });

    // Spec §3.1: todo texto pequeño sobre el escenario lleva scrim. Sin él, sobre un núcleo de nodo casi blanco del
    // póster (que con movimiento reducido no se atenúa), --muted se queda en 2.2:1; con él, ≥ 5.5:1.
    test('ningún texto pequeño se pinta sobre el escenario sin scrim', async ({ page }) => {
      await page.goto(`/${locale}`);
      await page.getByRole('searchbox').fill('zzzz'); // muestra también el aviso de «sin resultados»
      await expect(page.locator('.search-empty')).not.toBeEmpty();
      const bare = await page.evaluate(() => {
        const main = document.querySelector('.home main')!;
        const out = new Set<string>();
        const walker = document.createTreeWalker(main, NodeFilter.SHOW_TEXT);
        for (let n = walker.nextNode(); n; n = walker.nextNode()) {
          const el = n.parentElement!;
          if (!n.textContent!.trim() || el.closest('script, style, .stage') || !el.checkVisibility()) continue;
          // Texto grande (≥ 24 px) queda fuera: el nombre del h1, con su sombra, va en los flancos oscuros del grafo.
          if (parseFloat(getComputedStyle(el).fontSize) >= 24) continue;
          let scrim = false;
          for (let a: Element | null = el; a && a !== main; a = a.parentElement) {
            if (getComputedStyle(a).backgroundColor !== 'rgba(0, 0, 0, 0)') {
              scrim = true;
              break;
            }
          }
          if (!scrim) out.add(`${el.tagName.toLowerCase()}.${[...el.classList].join('.')}: ${n.textContent!.trim().slice(0, 30)}`);
        }
        return [...out];
      });
      expect(bare).toEqual([]);
    });

    test('enlaces internos responden 200', async ({ page, request }) => {
      await page.goto(`/${locale}`);
      const hrefs = await page.$$eval('a[href^="/"]', (as) => [...new Set(as.map((a) => a.getAttribute('href')!.split('#')[0]).filter(Boolean))]);
      for (const href of hrefs) expect((await request.get(href)).status(), href).toBe(200);
    });

    // El póster es una <img> a pantalla completa: Chrome no la toma como candidata a LCP (spec §5.2).
    test('el LCP es el nombre del h1, no el póster', async ({ page }) => {
      await page.goto(`/${locale}`, { waitUntil: 'networkidle' });
      const lcp = await page.evaluate(
        () =>
          new Promise<string>((resolve) => {
            new PerformanceObserver((list) => {
              const entry = list.getEntries().at(-1) as PerformanceEntry & { element?: Element | null };
              resolve(entry.element?.closest('h1') ? 'h1' : (entry.element?.outerHTML.slice(0, 80) ?? 'sin elemento'));
            }).observe({ type: 'largest-contentful-paint', buffered: true });
          }),
      );
      expect(lcp).toBe('h1');
    });

    // Presupuesto de la spec §5. El margen es de unos cientos de bytes y el framework ocupa el 98 % (spec §5.1):
    // si falla, no es ruido. El límite no se sube aquí; cambiarlo lo decide Steven en la spec.
    test('JS del hilo principal ≤ 130 KB gz', async ({ page, baseURL }) => {
      const BUDGET = 130 * 1024;
      const scripts: Promise<number>[] = [];
      page.on('response', (r) => {
        if (r.request().resourceType() === 'script' && r.url().startsWith(baseURL!)) scripts.push(r.body().then((b) => gzipSync(b).length));
      });
      await page.goto(`/${locale}`, { waitUntil: 'networkidle' });
      const total = (await Promise.all(scripts)).reduce((a, b) => a + b, 0);
      console.log(`JS /${locale}: ${total} B gz (${(total / 1024).toFixed(1)} KB), margen ${BUDGET - total} B`);
      expect(total, `JS de /${locale}: ${total} B gz frente a ${BUDGET} B (spec §5.1)`).toBeLessThanOrEqual(BUDGET);
    });
  });
}

for (const locale of ['es', 'en'] as const) {
  // Solo los cinco subconjuntos propios, una vez cada uno: ninguna fuente de Google del layout raíz (son del portal)
  // ni copias duplicadas. Solo se precarga el del h1, el elemento LCP (spec §5.2).
  test(`/${locale} descarga solo sus subconjuntos de fuente y precarga solo el del h1`, async ({ page }) => {
    const fonts: Promise<{ url: string; hash: string }>[] = [];
    page.on('response', (r) => {
      if (r.request().resourceType() === 'font') fonts.push(r.body().then((b) => ({ url: r.url(), hash: sha1(b) })));
    });
    await page.goto(`/${locale}`, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    const list = await Promise.all(fonts);
    const byHash = new Map<string, string>(HOME_FONTS.map((name) => [sha1(fontBytes(name)), name]));
    expect(list.map((f) => byHash.get(f.hash) ?? f.url).sort()).toEqual([...HOME_FONTS].sort());
    const preloads = await page.$$eval('link[rel="preload"][as="font"]', (ls) => ls.map((l) => (l as HTMLLinkElement).href));
    expect(preloads).toHaveLength(1);
    expect(list.find((f) => f.url === preloads[0])?.hash).toBe(sha1(fontBytes('cormorant-hero')));
  });

  // Cada carácter que pinta la home tiene glifo en el subconjunto de su familia; si el contenido trae uno nuevo, se
  // añade en scripts/subset-fonts.sh y se regenera. Excepciones: los que tampoco estaban en las fuentes que servía
  // Google para la home, que siempre se pintaron con una fuente del sistema.
  test(`/${locale} tiene cada carácter en el subconjunto de su familia`, async ({ page }) => {
    const FILES: Record<string, HomeFont> = {
      'cormorantHero|normal': 'cormorant-hero',
      'cormorantHome|normal': 'cormorant-home',
      'cormorantHome|italic': 'cormorant-home-italic',
      'geistHome|normal': 'geist-home',
      'jetbrainsHome|normal': 'jetbrains-home',
    };
    const SYSTEM_GLYPHS: Partial<Record<HomeFont, string>> = { 'cormorant-home': 'ḗ', 'geist-home': 'ḗ', 'jetbrains-home': '→' };
    await page.goto(`/${locale}`);
    const missing = missingGlyphs(await paintedText(page, '.home'), FILES, SYSTEM_GLYPHS);
    expect(missing, 'regenera los subconjuntos con bash scripts/subset-fonts.sh').toEqual({});
  });
}

test('la búsqueda filtra el portafolio', async ({ page }) => {
  await page.goto('/es');
  const search = page.getByRole('searchbox');
  await search.fill('SAT solver');
  await expect(page.locator('[data-node="producto:nlp-to-logic"]')).toBeVisible();
  await expect(page.locator('[data-node="producto:graf"]')).toBeHidden();
  await search.fill('zzzz-inexistente');
  await expect(page.getByText('Sin resultados. Prueba con otro término.')).toBeVisible();
  await expect(page.locator('[data-front]:visible')).toHaveCount(0);
  // Borrar la búsqueda devuelve todo el portafolio.
  expect(await page.locator('[data-front]').count()).toBeGreaterThan(1);
  await search.fill('');
  await expect(page.locator('[data-front]:visible')).toHaveCount(await page.locator('[data-front]').count());
  await expect(page.locator('[data-search]:visible')).toHaveCount(await page.locator('[data-search]').count());
  await expect(page.getByText('Sin resultados. Prueba con otro término.')).toHaveCount(0);
});

// Por debajo de 900 px el índice es un <details> dentro de un <nav>; se cierra al elegir sección y con Escape.
test('el menú móvil es un landmark y se cierra al elegir una sección o con Escape', async ({ page }, info) => {
  test.skip(info.project.name === 'desktop', 'el menú <details> solo se muestra por debajo de 900 px');
  await page.goto('/es');
  const nav = page.getByRole('navigation', { name: 'Menú' });
  await expect(nav).toHaveCount(1);
  const menu = nav.locator('details.menu');
  const open = page.locator('.home details.menu[open]');
  await menu.locator('summary').click();
  await expect(open).toHaveCount(1);
  await menu.getByRole('link', { name: 'Frentes' }).click();
  await expect(page).toHaveURL(/#frentes$/);
  await expect(open).toHaveCount(0);
  await menu.locator('summary').click();
  await expect(open).toHaveCount(1);
  await page.keyboard.press('Escape');
  await expect(open).toHaveCount(0);
  await expect(menu.locator('summary')).toBeFocused();
  await menu.locator('summary').click();
  await page.locator('#frentes h2').click();
  await expect(open).toHaveCount(0);
});

// Red contra errores y violaciones de CSP en el portal, que ahora se bloquean (no solo se informan): los dos
// idiomas, todos los frentes y lore, con lo que monta en diferido tras la hidratación.
const FRENTES = ['filosofia', 'informatica', 'ciencias', 'enterprise'];
// Fuentes del layout raíz que pinta el portal, por «familia|estilo» (scripts/subset-fonts.sh, sección 2).
const PORTAL_FONTS: Record<string, string> = {
  'inter|normal': 'inter-latin',
  // Inter solo trae la cara recta: la nota al pie de lore, en cursiva, la inclina el navegador con esos glifos.
  'inter|italic': 'inter-latin',
  'jetbrains|normal': 'jetbrains-mono-latin',
  'cormorant|normal': 'cormorant-garamond-latin',
  'cormorant|italic': 'cormorant-garamond-italic-latin',
};
// Lo que la fuente de origen no tiene y pinta una fuente del sistema: símbolos de las fichas y «ḗ» (Pinakothḗke) en
// Cormorant, y «Ḗ»/«ḗ» en JetBrains Mono. Lo demás que falte se añade en scripts/subset-fonts.sh.
const PORTAL_SYSTEM_GLYPHS: Record<string, string> = {
  'cormorant-garamond-latin': 'εΠ⚔◈⊢◉⚙◎▣⏱▦⬡ḗ',
  'jetbrains-mono-latin': 'Ḗḗ',
};
for (const locale of ['es', 'en'] as const) {
  test(`/${locale}: las subpáginas funcionan, con su canonical y sin errores ni violaciones de CSP`, async ({ page }) => {
    const violations = await watchCsp(page);
    for (const path of [...FRENTES.map((f) => `/${locale}/${f}`), `/${locale}/lore`]) {
      const errors = collectErrors(page);
      const res = await page.goto(path, { waitUntil: 'networkidle' });
      expect(res!.status(), path).toBe(200);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `${SITE}${path}`);
      expect(await page.locator('meta[property="og:image"]').count(), path).toBeGreaterThan(0);
      // Tarjeta al compartir: título con el nombre e imagen con alt.
      await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', / · Steven Vallejo Ortiz$/);
      await expect(page.locator('meta[property="og:image:alt"]')).toHaveAttribute('content', 'Steven Vallejo Ortiz — Mouseîon');
      // theme-color del portal (#0b1417, su fondo), no el de la home.
      await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#0b1417');
      await scrollToEnd(page);
      expect([...errors, ...(await violations())], path).toEqual([]);
      // Cada carácter que pinta tiene glifo en la fuente de su familia (salvo los que la fuente de origen no tiene).
      expect(missingGlyphs(await paintedText(page, 'body'), PORTAL_FONTS, PORTAL_SYSTEM_GLYPHS), path).toEqual({});
      // --font-cormorant es una sola familia con caras rectas y cursivas: el texto recto del portal (Lore pinta
      // --font-serif a 600) usa la cara recta, no una cursiva sintetizada.
      const cormorant = await page.evaluate(async () => {
        await document.fonts.ready;
        const family = getComputedStyle(document.documentElement).getPropertyValue('--font-cormorant').split(',')[0].trim().replace(/["']/g, '');
        return [...document.fonts].filter((f) => f.family.replace(/["']/g, '') === family).map((f) => `${f.style}|${f.status}`);
      });
      expect(cormorant, path).toContain('normal|loaded');
      expect(cormorant.some((f) => f.startsWith('italic|')), path).toBe(true);
    }
  });
}

// GA solo se carga con la primera interacción (o 5 s después de load), así que ningún otro test lo ve: aquí se
// provoca y se exige que el gtag.js real y su petición de medición pasen la CSP (spec §4.1 y §5). La medición no sale
// del test: el fixture (e2e/fixtures.ts) la responde con 204. La CSP se evalúa antes, en el navegador, así que una
// petición bloqueada nunca llega a esa ruta y deja su violación.
test.describe('GA con el gtag.js real', () => {
  test.use({ realGtag: true });

  test('GA se carga con la primera interacción y no viola la CSP', async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop', 'basta un proyecto: pide gtag.js real a Google');
    const errors = collectErrors(page);
    const violations = await watchCsp(page);
    const collects: string[] = [];
    page.on('request', (r) => {
      if (/\/g\/collect\b/.test(r.url())) collects.push(r.url());
    });
    // Antes del goto: si la carga se alarga más de 5 s, el respaldo de Analytics pide gtag.js sin esperar al ratón.
    const gtag = Promise.race([
      page.waitForResponse((r) => r.url().startsWith(GTAG_URL), { timeout: 20_000 }).then((r) => `HTTP ${r.status()}`),
      page
        .waitForEvent('requestfailed', { predicate: (r) => r.url().startsWith(GTAG_URL), timeout: 20_000 })
        .then((r) => r.failure()?.errorText ?? 'fallo de red'),
    ]).catch(() => 'sin respuesta en 20 s');
    await page.goto('/es', { waitUntil: 'networkidle' });
    await page.mouse.move(400, 400);
    await page.mouse.wheel(0, 600);
    const outcome = await gtag;
    if (outcome !== 'HTTP 200') {
      // Si lo bloqueó la CSP, es un fallo del sitio y no de la red.
      expect(await violations(), `gtag.js: ${outcome}`).toEqual([]);
      test.skip(true, `gtag.js real no alcanzable (${outcome}): sin red hacia www.googletagmanager.com no se puede probar GA bajo la CSP`);
    }
    // Si la CSP bloquea la medición, la petición no sale y la espera muestra las violaciones.
    await expect
      .poll(async () => ({ collect: collects.length > 0, errores: [...errors, ...(await violations())] }), { timeout: 20_000 })
      .toEqual({ collect: true, errores: [] });
    expect(new URL(collects[0]).searchParams.get('tid')).toBe(GA_ID);
    // Lo que gtag pida justo después (p. ej. las señales de Google) también tiene que pasar la CSP.
    await page.waitForTimeout(2000);
    expect([...errors, ...(await violations())]).toEqual([]);
  });
});

// El proxy decide adónde va la URL raíz del dominio y pone el locale a las rutas que no lo llevan (spec §4.1).
test('el proxy redirige la raíz por idioma y deja pasar sitemap y robots', async ({ request }) => {
  const location = async (path: string, headers?: Record<string, string>) => {
    const res = await request.get(path, { headers, maxRedirects: 0 });
    expect(res.status(), path).toBe(307);
    const url = new URL(res.headers()['location'], 'http://localhost'); // next start la manda relativa
    return url.pathname + url.search;
  };
  expect(await location('/', { 'accept-language': 'es-CO,es;q=0.9' })).toBe('/es');
  expect(await location('/', { 'accept-language': 'pt-BR,pt;q=0.9,es;q=0.8' })).toBe('/es');
  expect(await location('/')).toBe('/en');
  expect(await location('/?utm_source=linkedin', { 'accept-language': 'es' })).toBe('/es?utm_source=linkedin');
  expect(await location('/lore')).toBe('/en/lore');
  for (const path of ['/sitemap.xml', '/robots.txt']) expect((await request.get(path, { maxRedirects: 0 })).status(), path).toBe(200);
});

test('404 reales y bilingües', async ({ page }) => {
  for (const path of ['/es/no-existe', '/en/filosofia-x']) {
    expect((await page.goto(path))!.status(), path).toBe(404);
    // Ninguno de los dos 404 recibe el locale de la URL: muestran los dos idiomas y enlazan a las dos homes.
    await expect(page.locator('h1 [lang="es"]')).toHaveText('Esta página no existe');
    await expect(page.locator('h1 [lang="en"]')).toHaveText('This page does not exist');
    await expect(page.locator('main a[href="/es"]')).toHaveText('Volver al inicio');
    await expect(page.locator('main a[href="/en"]')).toHaveText('Back to home');
    await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#05090b');
  }
});
