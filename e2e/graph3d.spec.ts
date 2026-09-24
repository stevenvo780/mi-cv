import { writeFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import type { Page } from '@playwright/test';
import { GRAPH_STATS } from '../src/graph/generated/stats';
import { TIERS } from '../src/graph/runtime/quality';
import { SECTIONS } from '../src/graph/scene/choreography';
// Sin hits reales a GA: medición en 204 y gtag.js de pega (e2e/fixtures.ts).
import { expect, test } from './fixtures';
import { brighter, count, decodePng, regions, white } from './pixels';

const SHOTS = '/workspace/.scratch-steven-redesign/shots';

/**
 * Errores de consola y de página, y violaciones de CSP (también las que no llegan a la consola). Solo cuenta el tipo
 * `error`: el aviso de SwiftShader `THREE.WebGLRenderer: KHR_parallel_shader_compile extension not supported` es un
 * `warning` (three compila sin esa extensión y sondea el estado de los programas), no un error, y no entra.
 */
async function watchErrors(page: Page) {
  const errors: string[] = [];
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  page.on('pageerror', (e) => errors.push(e.message));
  await page.addInitScript(() => {
    document.addEventListener('securitypolicyviolation', (e) => console.error(`CSP: ${e.violatedDirective} ${e.blockedURI}`));
  });
  return errors;
}

async function openLive(page: Page, query = 'gl=force') {
  await page.goto(`/es?${query}`);
  await page.mouse.move(320, 240);
  await expect(page.locator('.stage[data-state="live"]')).toBeAttached({ timeout: 60_000 });
  await page.waitForTimeout(1500);
}

async function findNode(page: Page) {
  const { width, height } = page.viewportSize()!;
  for (let y = height * 0.3; y < height * 0.72; y += 22) {
    for (let x = width * 0.28; x < width * 0.72; x += 22) {
      await page.mouse.move(x, y);
      await page.waitForTimeout(90);
      if (await page.locator('.graph-tip').isVisible()) return true;
    }
  }
  return false;
}

/** Pausa la animación y deja el puntero sobre la barra (contenido: la escena no recibe paralaje ni hover). */
async function pause(page: Page) {
  await page.locator('.graph-motion').click();
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'paused');
  await page.mouse.move(5, 5);
}

/**
 * Con la animación en pausa, la escena solo pinta mientras la cámara (scroll, foco, paralaje) no llega a su pose.
 * Devuelve la captura del escenario cuando lleva STILL_MS sin cambiar (capturas cada segundo). En SwiftShader un frame
 * cuesta cientos de ms, más de un segundo con la suite en paralelo, y cada uno avanza como mucho 50 ms del reloj de la
 * escena: llegar a una pose tarda segundos, no 1–2 s. El worker no se puede instrumentar desde la página, así que aquí
 * se mira la imagen; con `?worker=off`, `settled` cuenta frames.
 */
async function stillStage(page: Page) {
  let last = await page.locator('.stage').screenshot();
  let since = Date.now();
  await expect
    .poll(
      async () => {
        await page.waitForTimeout(1000);
        const next = await page.locator('.stage').screenshot();
        if (!next.equals(last)) since = Date.now();
        last = next;
        return Date.now() - since >= STILL_MS;
      },
      { message: 'la escena en pausa no llegó a quedarse quieta', timeout: 150_000, intervals: [0] },
    )
    .toBe(true);
  return last;
}
const STILL_MS = 3000;

/** Deja en la página solo el escenario: el contenido pasa a opacidad 0 (sigue en su sitio y recibe el puntero). */
async function hideContent(page: Page) {
  await page.addStyleTag({ content: '.home > :not(main), .home main > :not(.stage) { opacity: 0 !important; transition: none !important; }' });
}

test('el grafo 3D arranca en el worker, pinta y se anima', async ({ page }) => {
  const errors = await watchErrors(page);
  await openLive(page);
  const a = await page.locator('.stage').screenshot({ path: `${SHOTS}/3d-hero.png` });
  await page.waitForTimeout(800);
  const b = await page.locator('.stage').screenshot();
  expect(a.length).toBeGreaterThan(20_000);
  expect(a.equals(b)).toBe(false);
  expect(page.workers(), 'la escena corre en un worker').toHaveLength(1);
  expect(errors).toEqual([]);
});

test('hover sobre un nodo muestra su ficha', async ({ page }) => {
  await openLive(page);
  expect(await findNode(page)).toBe(true);
  await expect(page.locator('.graph-tip .graph-tip-label')).not.toBeEmpty();
  await page.screenshot({ path: `${SHOTS}/3d-hover.png` });
});

test('la pausa detiene la animación y persiste', async ({ page }) => {
  await openLive(page);
  const button = page.locator('.graph-motion');
  await expect(button).toHaveAttribute('aria-pressed', 'false');
  await button.click();
  await expect(button).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'paused');
  await page.mouse.move(5, 5);
  // Con la animación en marcha, el reloj mueve pulsos y respiración en cada frame y dos capturas nunca coinciden.
  const a = await stillStage(page);
  await page.waitForTimeout(1500);
  const b = await page.locator('.stage').screenshot();
  expect(a.equals(b)).toBe(true);
  await page.reload();
  await page.mouse.move(320, 240);
  await expect(page.locator('.graph-motion')).toHaveAttribute('aria-pressed', 'true', { timeout: 60_000 });
});

test('el scroll recorre las cinco formas sin errores', async ({ page }) => {
  const errors = await watchErrors(page);
  await openLive(page);
  // En pausa, para capturar cada forma cuando la cámara llega a su pose (stillStage).
  await pause(page);
  for (const section of ['metodo', 'trayectoria', 'frentes', 'prueba', 'contacto']) {
    await page.locator(`[data-section="${section}"]`).scrollIntoViewIfNeeded();
    await page.evaluate((s) => document.querySelector(`[data-section="${s}"]`)!.scrollIntoView({ block: 'center' }), section);
    await stillStage(page);
    await page.screenshot({ path: `${SHOTS}/3d-${section}.png` });
  }
  expect(errors).toEqual([]);
});

test('el foco de teclado en un producto mueve la cámara hacia su nodo', async ({ page }) => {
  await openLive(page);
  // En pausa y sin contenido delante, la captura solo cambia si la cámara se mueve (no por los pulsos ni por el anillo
  // de foco del enlace). El enlace entra en pantalla antes: si focus() desplazara la página, el scroll también la movería.
  await pause(page);
  await hideContent(page);
  const link = page.locator('[data-node="producto:nlp-to-logic"] a').first();
  await link.scrollIntoViewIfNeeded();
  const before = await stillStage(page);
  const scrollY = await page.evaluate(() => window.scrollY);
  await link.evaluate((a: HTMLElement) => a.focus({ preventScroll: true }));
  await page.waitForTimeout(1800);
  const after = await page.locator('.stage').screenshot();
  expect(await page.evaluate(() => window.scrollY)).toBe(scrollY);
  expect(before.equals(after)).toBe(false);
});

test('fallback en el hilo principal (?worker=off) también pinta', async ({ page }) => {
  const errors = await watchErrors(page);
  await openLive(page, 'gl=force&worker=off');
  await page.locator('.stage').screenshot({ path: `${SHOTS}/3d-fallback.png` });
  expect(page.workers(), 'sin worker: la escena va en el hilo principal').toHaveLength(0);
  expect(errors).toEqual([]);
});

test.describe('reduced motion', () => {
  // El contexto del fixture (sin hits a GA) con prefers-reduced-motion: reduce. Un browser.newContext() a mano no
  // pasaría por el fixture. El viewport es el del proyecto 3d.
  test.use({ reducedMotion: 'reduce' });

  test('reduced motion: póster y botón "Explorar en 3D" sin autoplay', async ({ page }) => {
    await page.goto('/es');
    await page.mouse.move(300, 300);
    const explore = page.locator('.graph-explore');
    await expect(explore).toBeVisible({ timeout: 20_000 });
    await explore.click();
    await expect(page.locator('.stage[data-state="live"]')).toBeAttached({ timeout: 60_000 });
    await expect(page.locator('.graph-motion')).toHaveAttribute('aria-pressed', 'true');
  });
});

// ── Aristas y quemados, por píxeles ──────────────────────────────────────────────────────────────────────────────

type Layer = 'edge' | 'node' | 'hub';
interface GlProbe {
  /** Capas que no se dibujan. */
  hide: Layer[];
  /** Si no es null, la capa de aristas se dibuja solo hasta esa instancia: las semánticas van primero (scene/data.ts). */
  edgeInstances: number | null;
  /** Aristas en reposo: sin pulsos (solo la línea base). */
  rest: boolean;
  /** Programas de aristas a los que se pudo quitar los pulsos (el fragment shader con `float pulse = …;`). */
  restPatched: number;
  /** Frames pintados: llamadas de dibujo de la capa de aristas, se oculte o no (una por frame). */
  frames: number;
  /** Fotogramas del navegador (rAF) y el último en el que la escena pintó. */
  ticks: number;
  drawTick: number;
  /** Instancias de arista que pidió la escena en el último frame: semánticas más decorativas del nivel. */
  instances: number;
}
type ProbeWindow = Window & { __glProbe?: GlProbe };

/**
 * Script de inicio: envuelve WebGL2 para reconocer cada capa de GraphScene por su vertex shader (aristas: `aSide`,
 * nodos: `aSize`, hubs: `aScale`) y poder omitirla en el frame siguiente. Al fragment shader de las aristas le añade
 * un uniform propio que anula los pulsos, para ver la línea base en reposo: los pulsos en pausa son puntos sobre la
 * arista y, con 8k satélites, cubren casi tanto como las líneas. Sin ese uniform (vale 0) el shader es el de siempre.
 * El código del sitio no cambia. Solo ve el contexto del hilo principal, así que se usa con `?worker=off`: el
 * fallback, con la misma GraphScene y los mismos shaders que el worker.
 */
function instrumentWebGL() {
  const probe: GlProbe = { hide: [], edgeInstances: null, rest: false, restPatched: 0, frames: 0, instances: 0, ticks: 0, drawTick: 0 };
  (window as ProbeWindow).__glProbe = probe;
  // El bucle de GraphScene pide un rAF por fotograma y, en pausa y en su pose, no pinta: fotogramas sin dibujo = quieta.
  const raf = window.requestAnimationFrame.bind(window);
  let stamp = -1;
  window.requestAnimationFrame = (cb) =>
    raf((t) => {
      if (t !== stamp) {
        stamp = t;
        probe.ticks++;
      }
      cb(t);
    });
  const LAYERS: [Layer, RegExp][] = [
    ['edge', /attribute float aSide;/],
    ['node', /attribute float aSize;/],
    ['hub', /attribute float aScale;/],
  ];
  const shaderLayer = new WeakMap<WebGLShader, Layer>();
  const programLayer = new WeakMap<WebGLProgram, Layer>();
  const active = new WeakMap<WebGL2RenderingContext, WebGLProgram | null>();
  const gl = WebGL2RenderingContext.prototype;
  const { shaderSource, attachShader, useProgram, drawElementsInstanced, drawArraysInstanced } = gl;
  gl.shaderSource = function (shader, source) {
    const layer = LAYERS.find(([, re]) => re.test(source))?.[0];
    if (layer) shaderLayer.set(shader, layer);
    const rest = source.replace(/float pulse = ([^;]+);/, 'float pulse = (1.0 - uE2eRest) * ($1);');
    if (rest !== source) {
      probe.restPatched++;
      source = rest.replace(/void main\(\) \{/, 'uniform float uE2eRest;\nvoid main() {');
    }
    shaderSource.call(this, shader, source);
  };
  gl.attachShader = function (program, shader) {
    const layer = shaderLayer.get(shader);
    if (layer) programLayer.set(program, layer);
    attachShader.call(this, program, shader);
  };
  gl.useProgram = function (program) {
    active.set(this, program);
    useProgram.call(this, program);
  };
  const layerOf = (ctx: WebGL2RenderingContext) => {
    const program = active.get(ctx);
    return program ? programLayer.get(program) : undefined;
  };
  gl.drawElementsInstanced = function (mode, count, type, offset, instances) {
    const layer = layerOf(this);
    if (layer === 'edge') {
      probe.frames++;
      probe.drawTick = probe.ticks;
      probe.instances = instances;
      this.uniform1f(this.getUniformLocation(active.get(this)!, 'uE2eRest'), probe.rest ? 1 : 0);
    }
    if (layer && probe.hide.includes(layer)) return;
    const n = layer === 'edge' && probe.edgeInstances !== null ? Math.min(instances, probe.edgeInstances) : instances;
    drawElementsInstanced.call(this, mode, count, type, offset, n);
  };
  gl.drawArraysInstanced = function (mode, first, count, instances) {
    const layer = layerOf(this);
    if (layer && probe.hide.includes(layer)) return;
    drawArraysInstanced.call(this, mode, first, count, instances);
  };
}

const probeOf = (page: Page) => page.evaluate(() => ({ ...(window as ProbeWindow).__glProbe! }));

/**
 * En pausa: espera a que la escena lleve QUIET_TICKS fotogramas del navegador sin pintar, contados desde la llamada
 * (lo que la movió, un scroll o el puntero, ya ocurrió). No depende de cuánto tarde un frame: el bucle de la escena
 * pide un rAF por fotograma y, mientras la cámara no llega, pinta en cada uno (en reposo, en uno de cada dos).
 */
async function settled(page: Page) {
  const { ticks: since } = await probeOf(page);
  await expect
    .poll(
      async () => {
        const p = await probeOf(page);
        return p.ticks - Math.max(p.drawTick, since);
      },
      { message: 'la escena en pausa no llegó a su pose', timeout: 150_000 },
    )
    .toBeGreaterThanOrEqual(QUIET_TICKS);
}
const QUIET_TICKS = 8;

let nudge = 0;
/** Pinta un frame más de la misma pose con estas capas y devuelve la captura del escenario. */
async function frameWith(page: Page, setup: Partial<Pick<GlProbe, 'hide' | 'edgeInstances' | 'rest'>> = {}) {
  const { frames } = await probeOf(page);
  await page.evaluate((s) => Object.assign((window as ProbeWindow).__glProbe!, { hide: [], edgeInstances: null, rest: false }, s), setup);
  // Un puntero sobre la barra (contenido: inside = false, sin paralaje ni hover) marca la escena como sucia: un frame.
  await page.mouse.move(4 + (nudge++ % 2), 4);
  await expect.poll(async () => (await probeOf(page)).frames, { timeout: 30_000 }).toBeGreaterThan(frames);
  await settled(page);
  const png = await page.locator('.stage').screenshot();
  return { png, px: decodePng(png) };
}

/**
 * Los dos extremos de la escena: T3, con bloom y la capa decorativa entera (escritorio ancho), y T1, sin compositor
 * (halo en shader y tone mapping por fragmento, el nivel del móvil). T2 es T3 con la mitad de satélites.
 */
const LEVELS = [
  { tier: 3, viewport: { width: 1440, height: 900 } },
  { tier: 1, viewport: { width: 390, height: 844 } },
] as const;
/** Píxeles que una capa sube al menos esto en algún canal: se ve (el fondo es casi negro). */
const VISIBLE = 8;
/**
 * Parte del escenario que cada capa de aristas tiene que pintar. Medido: del 1.2 % al 23 % según pose y nivel (lo
 * mínimo, las semánticas en reposo del hero en T3, un grafo pequeño en el centro). Con la cinta del revés (el fallo de
 * la T3 del plan) ninguna llega al 0.01 %; con la línea base decorativa a 0 o con aristas decorativas de longitud 0
 * (puntos), las decorativas en reposo se quedan por debajo del 0.1 %.
 */
const MIN_SHARE = 0.005;
/**
 * Parte de lo que pintan las decorativas en reposo que va en regiones de ≥ 16 px de lado. Medido: 0.69–0.99 (lo mínimo
 * en Prueba en T1, atenuada a 0.35). Con aristas decorativas de longitud 0 (puntos), 0.
 */
const MIN_FILAMENTS = 0.5;
/**
 * Mayor región conexa de blanco puro (los tres canales ≥ 250) que se tolera: ≈ un disco de 16 px. Medido con la mezcla
 * de las aristas de la spec §3.3: 0 px en T3 y, en T1, 4 px como mucho salvo en Contacto, de 28 a 74 px (pulsos sobre
 * el haz de la lemniscata). Con la mezcla aditiva de antes, Contacto en T1 llegaba a 769–896 px.
 */
const MAX_WHITE_REGION = 200;

for (const { tier, viewport } of LEVELS) {
  test.describe(`T${tier} a ${viewport.width}×${viewport.height}`, () => {
    test.use({ viewport });

    for (const section of SECTIONS) {
      test(`pose ${section}: se pintan las aristas, también las de los satélites, y nada se quema a blanco`, async ({ page }, info) => {
        const errors = await watchErrors(page);
        await page.addInitScript(instrumentWebGL);
        await openLive(page, 'gl=force&worker=off');
        await pause(page);
        await hideContent(page);
        await page.evaluate((s) => document.querySelector(`[data-section="${s}"]`)!.scrollIntoView({ block: 'center' }), section);
        await settled(page);

        // La misma pose (en pausa el reloj no corre: pulsos y respiración quietos), con y sin cada capa. «En reposo»,
        // las aristas sin pulsos: solo la línea base.
        const full = await frameWith(page);
        const withoutEdges = await frameWith(page, { hide: ['edge'] });
        const rest = await frameWith(page, { hide: ['node', 'hub'], rest: true });
        const semanticRest = await frameWith(page, { hide: ['node', 'hub'], rest: true, edgeInstances: GRAPH_STATS.edges });
        const background = await frameWith(page, { hide: ['edge', 'node', 'hub'] });
        writeFileSync(`${SHOTS}/3d-forma-t${tier}-${section}.png`, full.png);
        writeFileSync(`${SHOTS}/3d-aristas-t${tier}-${section}.png`, rest.png);

        // El nivel es el que se quiere medir: tantas aristas decorativas como satélites del nivel (1 o 2 por satélite).
        const { instances, restPatched } = await probeOf(page);
        const decor = TIERS[tier].decor;
        expect(instances, 'aristas del nivel').toBeGreaterThanOrEqual(GRAPH_STATS.edges + decor);
        expect(instances, 'aristas del nivel').toBeLessThanOrEqual(GRAPH_STATS.edges + 2 * decor);
        expect(restPatched, 'EDGE_FRAG ya no tiene `float pulse = …;`: actualiza instrumentWebGL').toBeGreaterThan(0);

        const area = full.px.width * full.px.height;
        // Aristas visibles en la escena real, con pulsos y con nodos y hubs delante.
        const inScene = count(brighter(full.px, withoutEdges.px, VISIBLE));
        // En reposo: la línea base de las semánticas, sobre el fondo, y lo que añaden las decorativas a las semánticas.
        const semanticPx = count(brighter(semanticRest.px, background.px, VISIBLE));
        const decorMask = brighter(rest.px, semanticRest.px, VISIBLE);
        const decorPx = count(decorMask);
        // Filamentos que unen cada satélite con su nodo, no puntos: píxeles de regiones conexas de ≥ 16 px de lado.
        const filaments = regions(decorMask, rest.px.width)
          .filter((r) => r.extent >= 16)
          .reduce((n, r) => n + r.area, 0);
        // Blanco puro en la escena real y, como referencia, en las aristas en reposo sin nada delante: ahí convergen los
        // satélites de un nodo pesado (la T3 del plan midió 1.5–3.2 en HDR, solo en el hero).
        const burnt = regions(white(full.px), full.px.width);
        const burntRest = regions(white(rest.px), rest.px.width);
        const stats = {
          instances,
          aristasEnEscena: inScene,
          semanticasEnReposo: semanticPx,
          decorativasEnReposo: decorPx,
          filamentos: +(filaments / Math.max(decorPx, 1)).toFixed(3),
          blancoMayor: burnt[0]?.area ?? 0,
          blancoTotal: burnt.reduce((n, r) => n + r.area, 0),
          blancoMayorEnReposoSinNodos: burntRest[0]?.area ?? 0,
        };
        console.log(`T${tier} ${section}: ${JSON.stringify(stats)}`);
        info.annotations.push({ type: 'píxeles', description: JSON.stringify(stats) });

        expect(inScene / area, 'aristas visibles en la escena').toBeGreaterThan(MIN_SHARE);
        expect(semanticPx / area, 'aristas semánticas en reposo').toBeGreaterThan(MIN_SHARE);
        expect(decorPx / area, 'aristas decorativas en reposo').toBeGreaterThan(MIN_SHARE);
        expect(filaments / decorPx, 'la capa decorativa son filamentos conectados, no puntos').toBeGreaterThan(MIN_FILAMENTS);
        expect(burnt[0]?.area ?? 0, `zona quemada a blanco en ${JSON.stringify(burnt[0])}`).toBeLessThanOrEqual(MAX_WHITE_REGION);
        expect(errors).toEqual([]);
      });
    }
  });
}

// Enmienda H1: lo que la página pide antes de `load` es la ruta crítica (≤ 130 KB, lo mide e2e/home.spec.ts); el
// chunk de GraphStage, el worker y sus chunks, que la puerta pide después (interacción o idle), son el presupuesto
// del 3D. La puerta puede arrancar antes de `networkidle`, así que se separa por el Resource Timing de la página y
// no por el momento en que el test empieza a contar.
test('presupuesto del 3D (chunk de GraphStage, worker y sus chunks) ≤ 175 KB gz', async ({ page, baseURL }) => {
  const sizes = new Map<string, Promise<number>>();
  page.on('response', (r) => {
    const url = r.url();
    if (url.startsWith(baseURL!) && /\.m?js(\?|$)/.test(url) && !sizes.has(url)) sizes.set(url, r.body().then((b) => gzipSync(b).length));
  });
  await page.goto('/es?gl=force');
  await page.mouse.move(320, 240);
  await expect(page.locator('.stage[data-state="live"]')).toBeAttached({ timeout: 60_000 });
  await page.waitForTimeout(1500);
  // Lo que empezó antes de load. El worker y lo que importa no están en el Resource Timing de la página: cuentan.
  const critical = new Set(
    await page.evaluate(() => {
      const load = (performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming).loadEventStart;
      return performance.getEntriesByType('resource').filter((e) => e.startTime < load).map((e) => e.name);
    }),
  );
  const deferred = [...sizes].filter(([url]) => !critical.has(url));
  const total = (await Promise.all(deferred.map(([, size]) => size))).reduce((x, y) => x + y, 0);
  const names = deferred.map(([url]) => url.split('/').pop()).join(', ');
  console.log(`JS del 3D: ${total} B gz (${(total / 1024).toFixed(1)} KB) en ${deferred.length} archivos, margen ${175 * 1024 - total} B: ${names}`);
  expect(total).toBeGreaterThan(0);
  expect(total).toBeLessThanOrEqual(175 * 1024);
});
