import { AsyncLocalStorage } from 'node:async_hooks';
import { beforeAll, describe, expect, it } from 'vitest';
import { SITE } from '@/lib/site';

// next/server necesita AsyncLocalStorage global (en Next lo instala el runtime) para cargarse fuera de él.
(globalThis as { AsyncLocalStorage?: typeof AsyncLocalStorage }).AsyncLocalStorage ??= AsyncLocalStorage;

type ProxyModule = typeof import('@/proxy');
let mod: ProxyModule;
let NextRequest: typeof import('next/server').NextRequest;
let doesMatch: typeof import('next/experimental/testing/server').unstable_doesMiddlewareMatch;

beforeAll(async () => {
  mod = await import('@/proxy');
  ({ NextRequest } = await import('next/server'));
  ({ unstable_doesMiddlewareMatch: doesMatch } = await import('next/experimental/testing/server'));
});

function run(path: string, acceptLanguage?: string) {
  const headers = acceptLanguage === undefined ? undefined : { 'accept-language': acceptLanguage };
  return mod.proxy(new NextRequest(`${SITE}${path}`, { headers }));
}

describe('proxy: redirecciones (spec §4.1)', () => {
  it.each([
    ['es-CO,es;q=0.9', '/es'],
    ['es', '/es'],
    ['en-US,en;q=0.9', '/en'],
    [undefined, '/en'],
    ['fr-FR,fr;q=0.9', '/en'],
  ])('/ con Accept-Language %s → %s (307)', (header, target) => {
    const res = run('/', header);
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toBe(`${SITE}${target}`);
  });

  it('/ conserva la query (UTM) al redirigir', () => {
    const res = run('/?utm_source=linkedin&utm_medium=cv', 'es-CO');
    expect(res.headers.get('location')).toBe(`${SITE}/es?utm_source=linkedin&utm_medium=cv`);
  });

  it('las rutas sin locale van a /en conservando la query', () => {
    expect(run('/lore').headers.get('location')).toBe(`${SITE}/en/lore`);
    expect(run('/lore?ref=x').headers.get('location')).toBe(`${SITE}/en/lore?ref=x`);
    expect(run('/lore', 'es').status).toBe(307);
  });

  // El og:image antiguo (sin locale) que tienen en caché LinkedIn y WhatsApp.
  it('/opengraph-image → /en/opengraph-image', () => {
    const res = run('/opengraph-image');
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toBe(`${SITE}/en/opengraph-image`);
  });

  it.each(['/es', '/en', '/es/lore', '/en/filosofia', '/en/opengraph-image'])('%s pasa sin redirigir', (path) => {
    const res = run(path, 'es');
    expect(res.headers.get('location')).toBeNull();
    expect(res.headers.get('x-middleware-next')).toBe('1');
  });
});

describe('proxy: Accept-Language con pesos q', () => {
  it.each([
    ['pt-BR,pt;q=0.9,es;q=0.8,en;q=0.7', 'es'],
    ['ES', 'es'],
    ['en;q=0.5, es;q=0.9', 'es'],
    ['es;q=0, en', 'en'],
    ['es;q=0', 'en'],
    ['*', 'en'],
    ['de, en-GB;q=0.8, es;q=0.8', 'en'],
    ['es-419;q=0.8, fr', 'es'],
    ['', 'en'],
  ])('%s → %s', (header, locale) => {
    expect(mod.preferredLocale(header)).toBe(locale);
  });
  it('sin cabecera → en', () => {
    expect(mod.preferredLocale(null)).toBe('en');
  });
});

describe('proxy: matcher', () => {
  const matches = (url: string) => doesMatch({ config: mod.config, url });

  it.each(['/', '/lore', '/opengraph-image', '/es', '/en/lore', '/en/opengraph-image'])('%s entra en el proxy', (url) => {
    expect(matches(url)).toBe(true);
  });

  // Si entraran, irían a /en/sitemap.xml (404) o a /en/graph/… y romperían el SEO y el póster. El asistente
  // (/api/assistant) redirigido a /en/api/assistant sería un 404 para cada pregunta.
  it.each(['/sitemap.xml', '/robots.txt', '/graph/poster.b146b168ba.svg', '/_next/static/chunks/main.js', '/_next/image', '/icon.svg', '/favicon.ico', '/api/assistant'])(
    '%s no entra en el proxy',
    (url) => {
      expect(matches(url)).toBe(false);
    },
  );
});
