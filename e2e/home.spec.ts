import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { gzipSync } from 'node:zlib';
import { expect, test, type Page } from '@playwright/test';

const SITE = 'https://www.stevenvallejo.com';
const SHOTS = '/workspace/.scratch-steven-redesign/shots';

// Subconjuntos de fuente de la home ([locale]/(home)/fonts.ts, spec §3.2 y §5.2), generados por scripts/subset-fonts.sh.
const HOME_FONTS = ['cormorant-hero', 'cormorant-home', 'cormorant-home-italic', 'geist-home', 'jetbrains-home'] as const;
type HomeFont = (typeof HOME_FONTS)[number];
const fontBytes = (name: HomeFont) => readFileSync(`src/app/fonts/${name}.woff2`);
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
    const used = await page.evaluate(() => {
      const acc: Record<string, string> = {};
      const add = (el: Element, text: string, pseudo: string | null = null) => {
        const cs = getComputedStyle(el, pseudo);
        const key = `${cs.fontFamily.split(',')[0].trim().replace(/"/g, '')}|${cs.fontStyle}`;
        acc[key] = (acc[key] ?? '') + (cs.textTransform === 'uppercase' ? text.toUpperCase() : text);
      };
      const walker = document.createTreeWalker(document.querySelector('.home')!, NodeFilter.SHOW_TEXT);
      for (let n = walker.nextNode(); n; n = walker.nextNode()) {
        const el = n.parentElement!;
        if (el.closest('script, style') || !el.checkVisibility()) continue;
        add(el, n.textContent ?? '');
      }
      for (const el of document.querySelectorAll('.home *')) {
        for (const pseudo of ['::before', '::after']) {
          const content = getComputedStyle(el, pseudo).content;
          if (content.startsWith('"')) add(el, JSON.parse(content) as string, pseudo);
        }
        if (el instanceof HTMLInputElement && el.placeholder) add(el, el.placeholder);
      }
      return acc;
    });
    const missing: Record<string, string> = {};
    for (const [key, text] of Object.entries(used)) {
      const file = FILES[key];
      if (!file) {
        missing[key] = `familia inesperada: ${[...new Set(text)].join('')}`;
        continue;
      }
      const glyphs = new Set(openFont(fontBytes(file)).characterSet);
      const lack = [...new Set(text)].filter((c) => !/\s/.test(c) && !glyphs.has(c.codePointAt(0)!) && !SYSTEM_GLYPHS[file]?.includes(c));
      if (lack.length) missing[file] = lack.join('');
    }
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
});

test('las subpáginas siguen funcionando con su propio canonical', async ({ page }) => {
  for (const path of ['/es/filosofia', '/es/informatica', '/es/ciencias', '/es/enterprise', '/es/lore', '/en/lore']) {
    const errors = collectErrors(page);
    const res = await page.goto(path);
    expect(res!.status(), path).toBe(200);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `${SITE}${path}`);
    expect(await page.locator('meta[property="og:image"]').count(), path).toBeGreaterThan(0);
    expect(errors, path).toEqual([]);
  }
});

test('404 reales y bilingües', async ({ page }) => {
  for (const path of ['/es/no-existe', '/en/filosofia-x']) {
    expect((await page.goto(path))!.status(), path).toBe(404);
    // Ninguno de los dos 404 recibe el locale de la URL: muestran los dos idiomas y enlazan a las dos homes.
    await expect(page.locator('h1 [lang="es"]')).toHaveText('Esta página no existe');
    await expect(page.locator('h1 [lang="en"]')).toHaveText('This page does not exist');
    await expect(page.locator('main a[href="/es"]')).toHaveText('Volver al inicio');
    await expect(page.locator('main a[href="/en"]')).toHaveText('Back to home');
  }
});
