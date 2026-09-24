import { createHash } from 'node:crypto';
import { gzipSync } from 'node:zlib';
import { expect, test, type Page } from '@playwright/test';

const SITE = 'https://www.stevenvallejo.com';
const SHOTS = '/workspace/.scratch-steven-redesign/shots';

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
      await expect(page.locator('.stage-poster svg')).toBeAttached();
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

// next/font 16 publica el nombre real de la familia: dos instancias de Cormorant Garamond con la misma cara
// (peso y estilo) hacen que gane la última y el navegador baje una copia sin precargar del mismo archivo.
test('cada fuente se descarga una vez y las precargadas se usan', async ({ page }) => {
  const fonts: Promise<{ url: string; hash: string }>[] = [];
  page.on('response', (r) => {
    if (r.request().resourceType() === 'font') fonts.push(r.body().then((b) => ({ url: r.url(), hash: createHash('sha1').update(b).digest('hex') })));
  });
  await page.goto('/es', { waitUntil: 'networkidle' });
  const list = await Promise.all(fonts);
  const byHash = Object.groupBy(list, (f) => f.hash);
  expect(Object.values(byHash).filter((g) => g!.length > 1)).toEqual([]);
  const preloads = await page.$$eval('link[rel="preload"][as="font"]', (ls) => ls.map((l) => (l as HTMLLinkElement).href));
  expect(preloads.length).toBeGreaterThan(0);
  for (const href of preloads) expect(list.map((f) => f.url), href).toContain(href);
});

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

test('404 reales', async ({ page }) => {
  expect((await page.goto('/es/no-existe'))!.status()).toBe(404);
  expect((await page.goto('/en/filosofia-x'))!.status()).toBe(404);
});
