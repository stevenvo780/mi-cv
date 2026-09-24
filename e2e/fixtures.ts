import { test as base, expect, type BrowserContext, type Page, type Request } from '@playwright/test';

/**
 * Ningún e2e manda hits reales a la propiedad de GA de producción (G-E5NMYWLXER). Analytics.tsx carga gtag.js con la
 * primera interacción o 5 s después de load, así que cualquier scroll o clic de un test lo dispararía.
 *
 * Todos los tests importan `test` y `expect` de aquí. Por cada contexto del navegador:
 * - Las peticiones a hosts de medición (GA4, señales de Google, Ads) se responden aquí con 204 y no salen.
 * - gtag.js se sirve con un stub vacío (200, application/javascript), sin red. El test de GA pide el real con
 *   `test.use({ realGtag: true })`.
 * - Un listener de requests comprueba al final que ninguna petición a un host de medición salió sin pasar por la
 *   ruta. Si alguna sale, el test falla y la lista.
 * - Antes de cerrar, silencia a Google en cada página. Al descargarse (pagehide), gtag manda balizas keepalive que no
 *   pasan por las rutas de Playwright ni emiten el evento `request`. Medido con un proxy y el NetLog de Chrome: al
 *   navegar a about:blank, la de GA llegaba a www.google-analytics.com, y al cerrar el contexto, la de diagnóstico de
 *   la etiqueta (googletagmanager.com/td) llegó a enviar sus cabeceras. Por eso se activa el opt-out oficial de GA
 *   (`window['ga-disable-<ID>'] = true`) y un script de inicio, que envuelve fetch y sendBeacon desde antes de que
 *   cargue gtag, descarta en la página lo que vaya a Google a partir de esa señal. playwright.config.ts deja además
 *   sin DNS los hosts de medición (no googletagmanager.com, del que el test de GA pide gtag.js).
 *
 * Bajo la CSP de producción, Chromium bloquea antes de llegar a la capa de red: una petición que viola la CSP no
 * alcanza la ruta y deja su evento securitypolicyviolation, así que las rutas no tapan violaciones.
 *
 * Un contexto creado a mano (`browser.newContext()`) no pasa por este fixture: llama a `guardMeasurement(context)`.
 */

export const GTAG_URL = 'https://www.googletagmanager.com/gtag/js';
/** La propiedad de producción, la de src/components/Analytics.tsx. */
export const GA_ID = 'G-E5NMYWLXER';

const MEASUREMENT_HOSTS = [
  /(^|\.)google-analytics\.com$/,
  /(^|\.)analytics\.google\.com$/,
  /(^|\.)doubleclick\.net$/,
  /(^|\.)googlesyndication\.com$/,
  /(^|\.)googleadservices\.com$/,
  // www.google.com/g/collect, /ads/ga-audiences y sus variantes por país (google.com.co, google.es…).
  /(^|\.)google\.[a-z]{2,3}(\.[a-z]{2})?$/,
];

/** Host de medición: todo googletagmanager.com salvo el propio gtag.js, y los dominios de GA, señales y Ads. */
export function isMeasurement(url: string | URL): boolean {
  const { protocol, hostname, pathname } = typeof url === 'string' ? new URL(url) : url;
  if (protocol !== 'https:' && protocol !== 'http:') return false;
  if (/(^|\.)googletagmanager\.com$/.test(hostname)) return pathname !== '/gtag/js';
  return MEASUREMENT_HOSTS.some((host) => host.test(hostname));
}

const isGtag = (url: URL) => url.href.startsWith(GTAG_URL);

export interface MeasurementGuard {
  /** Peticiones a hosts de medición que respondió la ruta (no salieron), por host. */
  intercepted: () => Record<string, number>;
  /** Peticiones a hosts de medición que no pasaron por la ruta (método y URL, sin la query). */
  leaked: () => string[];
}

export async function guardMeasurement(context: BrowserContext, { realGtag = false } = {}): Promise<MeasurementGuard> {
  const handled = new WeakSet<Request>();
  const seen: Request[] = [];
  const intercepted: Record<string, number> = {};
  context.on('request', (request) => {
    if (isMeasurement(request.url())) seen.push(request);
  });
  await context.route(isMeasurement, (route) => {
    handled.add(route.request());
    const { hostname } = new URL(route.request().url());
    intercepted[hostname] = (intercepted[hostname] ?? 0) + 1;
    return route.fulfill({ status: 204 });
  });
  if (!realGtag) {
    await context.route(isGtag, (route) => route.fulfill({ status: 200, contentType: 'application/javascript', body: '' }));
  }
  await context.addInitScript(silenceGoogleOnTeardown);
  return {
    intercepted: () => ({ ...intercepted }),
    leaked: () =>
      seen
        // Lo que bloquea la CSP no sale del navegador: no es una fuga (su violación la vigila cada test).
        .filter((request) => !handled.has(request) && !/BLOCKED_BY_CSP/.test(request.failure()?.errorText ?? ''))
        .map((request) => `${request.method()} ${request.url().split('?')[0]}`),
  };
}

type QuietWindow = Window & { __e2eQuiet?: boolean };

/**
 * Script de inicio de cada página: fetch y sendBeacon pasan tal cual hasta que el fixture marca `__e2eQuiet`; desde
 * entonces, lo que va a Google se descarta en la página (las balizas de pagehide al cerrar no pasan por las rutas).
 */
function silenceGoogleOnTeardown() {
  const google = /^https?:\/\/([^/?#]+\.)?(google-analytics\.com|analytics\.google\.com|doubleclick\.net|googletagmanager\.com|google\.[a-z.]+)([:/?#]|$)/;
  const drop = (url: string) => (window as QuietWindow).__e2eQuiet === true && google.test(new URL(url, location.href).href);
  const sendBeacon = navigator.sendBeacon.bind(navigator);
  navigator.sendBeacon = (url, data) => (drop(String(url)) ? true : sendBeacon(url, data));
  const fetch = window.fetch.bind(window);
  window.fetch = (input, init) =>
    drop(input instanceof Request ? input.url : String(input)) ? Promise.resolve(new Response(null, { status: 204 })) : fetch(input, init);
}

/**
 * Antes de cerrar: opt-out oficial de GA y, desde ya, nada a Google desde la página (ver silenceGoogleOnTeardown).
 * Si Analytics.tsx aún no cargó gtag, un `window.gtag` vacío hace que su respaldo de 5 s no lo pida durante el cierre
 * (con el contexto cerrándose, la ruta del stub ya no responde y la petición de gtag.js salía a la red).
 */
async function quietGoogle(page: Page) {
  if (page.isClosed()) return;
  await page
    .evaluate((id) => {
      const w = window as QuietWindow & { gtag?: (...args: unknown[]) => void };
      Object.assign(w, { [`ga-disable-${id}`]: true, __e2eQuiet: true });
      w.gtag ??= () => {};
    }, GA_ID)
    .catch(() => {});
}

export const test = base.extend<{ realGtag: boolean; measurementGuard: MeasurementGuard }>({
  realGtag: [false, { option: true }],
  measurementGuard: [
    async ({ context, realGtag }, use, testInfo) => {
      const guard = await guardMeasurement(context, { realGtag });
      await use(guard);
      await Promise.all(context.pages().map((page) => quietGoogle(page)));
      const leaked = guard.leaked();
      const hosts = Object.entries(guard.intercepted());
      const total = hosts.reduce((n, [, count]) => n + count, 0);
      const detail = hosts.map(([host, count]) => `${host} ×${count}`).join(', ');
      testInfo.annotations.push({ type: 'medición', description: `${total} interceptadas${detail ? ` (${detail})` : ''}, ${leaked.length} sin interceptar` });
      expect(leaked, 'peticiones a hosts de medición que salieron sin interceptar').toEqual([]);
    },
    { auto: true },
  ],
});

export { expect };
