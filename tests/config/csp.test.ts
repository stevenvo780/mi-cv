import { afterEach, describe, expect, it, vi } from 'vitest';

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

describe('CSP en producción (next.config.mjs, spec §4.1)', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('img-src se restringe a los dos orígenes exactos de la spec, no a "https:" sin acotar', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    const csp = await loadProdCsp();
    expect(csp).toContain("img-src 'self' data: blob: https://www.google-analytics.com https://www.googletagmanager.com;");
    expect(csp).not.toMatch(/img-src 'self' data: blob: https:[;]/);
  });

  it('connect-src no incluye https://*.analytics.google.com, ausente en la spec', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    const csp = await loadProdCsp();
    expect(csp).toContain("connect-src 'self' https://www.google-analytics.com https://*.google-analytics.com https://www.googletagmanager.com;");
    expect(csp).not.toContain('https://*.analytics.google.com');
  });

  it('coincide exactamente con el bloque CSP de la spec §4.1', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    const csp = await loadProdCsp();
    expect(csp).toBe(
      [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: blob: https://www.google-analytics.com https://www.googletagmanager.com",
        "font-src 'self'",
        "connect-src 'self' https://www.google-analytics.com https://*.google-analytics.com https://www.googletagmanager.com",
        "worker-src 'self' blob:",
        "frame-ancestors 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "object-src 'none'",
        'upgrade-insecure-requests',
      ].join('; '),
    );
  });

  it('no se envía en desarrollo (NODE_ENV !== production)', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    await expect(loadProdCsp()).rejects.toThrow();
  });
});
