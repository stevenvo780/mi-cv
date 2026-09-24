import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Carga next.config.mjs con NODE_ENV=production (la CSP solo se activa ahí) e
 * inspecciona la cabecera real que produciría `headers()`, no el texto fuente:
 * así la prueba sigue valiendo aunque se reformatee el array `csp`.
 * Se importa con un query param único para evitar el cache de módulos de Node.
 */
async function loadProdCsp(): Promise<string> {
  const url = new URL('../../next.config.mjs', import.meta.url);
  url.search = `t=${Date.now()}-${Math.random()}`;
  const mod = (await import(url.href)) as { default: { headers: () => Promise<{ source: string; headers: { key: string; value: string }[] }[]> } };
  const rules = await mod.default.headers();
  const root = rules.find((r) => r.source === '/:path*');
  const csp = root?.headers.find((h) => h.key === 'Content-Security-Policy');
  if (!csp) throw new Error('No se encontró la cabecera Content-Security-Policy en producción');
  return csp.value;
}

const directives = (csp: string) => Object.fromEntries(csp.split('; ').map((d) => [d.split(' ')[0], d.split(' ').slice(1)]));

/** La CSP de producción de la spec §4.1. */
const PRODUCTION = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://www.google-analytics.com https://www.googletagmanager.com",
  "font-src 'self'",
  "connect-src 'self' https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com",
  "worker-src 'self' blob:",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  'upgrade-insecure-requests',
].join('; ');

describe('CSP en producción (next.config.mjs, spec §4.1)', () => {
  // Fuera de Vercel VERCEL_ENV no existe; se fija para que el entorno de quien ejecuta los tests no cuente.
  beforeEach(() => {
    vi.stubEnv('VERCEL_ENV', '');
  });
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('img-src se restringe a los dos orígenes exactos de la spec, no a "https:" sin acotar', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    const csp = await loadProdCsp();
    expect(csp).toContain("img-src 'self' data: blob: https://www.google-analytics.com https://www.googletagmanager.com;");
    expect(csp).not.toMatch(/img-src 'self' data: blob: https:[;]/);
  });

  // Guía de CSP de Google para GA4: las peticiones de medición también van a *.analytics.google.com.
  it('connect-src admite los orígenes de medición de GA4, incluido https://*.analytics.google.com', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    const connect = directives(await loadProdCsp())['connect-src'];
    expect(connect).toEqual(
      expect.arrayContaining(['https://www.google-analytics.com', 'https://*.google-analytics.com', 'https://*.analytics.google.com', 'https://www.googletagmanager.com']),
    );
  });

  it.each(['', 'production'])('coincide exactamente con el bloque CSP de la spec §4.1 (VERCEL_ENV="%s")', async (vercelEnv) => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('VERCEL_ENV', vercelEnv);
    expect(await loadProdCsp()).toBe(PRODUCTION);
  });

  it('no se envía en desarrollo (NODE_ENV !== production)', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    await expect(loadProdCsp()).rejects.toThrow();
  });
});

// Documentación de Vercel: https://vercel.com/docs/vercel-toolbar/managing-toolbar («Using a Content Security Policy»).
describe('CSP de las previews de Vercel (VERCEL_ENV=preview)', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('añade los orígenes de la Vercel Toolbar y conserva todo lo de producción', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('VERCEL_ENV', 'preview');
    const preview = directives(await loadProdCsp());
    const production = directives(PRODUCTION);
    expect(preview['script-src']).toEqual([...production['script-src'], 'https://vercel.live']);
    expect(preview['style-src']).toEqual([...production['style-src'], 'https://vercel.live']);
    expect(preview['img-src']).toEqual([...production['img-src'], 'https://vercel.live', 'https://vercel.com']);
    expect(preview['font-src']).toEqual([...production['font-src'], 'https://vercel.live', 'https://assets.vercel.com']);
    expect(preview['connect-src']).toEqual([...production['connect-src'], 'https://vercel.live', 'wss://ws-us3.pusher.com']);
    expect(preview['frame-src']).toEqual(["'self'", 'https://vercel.live']);
    for (const d of ['default-src', 'worker-src', 'frame-ancestors', 'base-uri', 'form-action', 'object-src']) expect(preview[d], d).toEqual(production[d]);
  });

  it('en producción no aparece ningún origen de Vercel', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('VERCEL_ENV', 'production');
    expect(await loadProdCsp()).not.toMatch(/vercel|pusher/);
  });
});
