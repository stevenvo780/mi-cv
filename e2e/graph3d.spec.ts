import { writeFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import type { Page } from '@playwright/test';
import { GRAPH_STATS } from '../src/graph/generated/stats';
import { TIERS } from '../src/graph/runtime/quality';
import { SECTIONS } from '../src/graph/scene/choreography';
// Sin hits reales a GA: medición en 204 y gtag.js de pega (e2e/fixtures.ts).
import { expect, test } from './fixtures';
import { brighter, count, decodePng, margins, regions, white } from './pixels';

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

/**
 * Tope de una espera: `cap`, o menos si al test le queda menos presupuesto (con RESERVE_MS de margen). Así, si la espera
 * falla, su mensaje sale antes que el timeout del test; si no, el fallo llega como «Test timeout of … exceeded» sin decir
 * qué se esperaba. `test.info().timeout` se lee en cada llamada: vale también con test.slow() o test.setTimeout().
 */
function waitCap(cap: number) {
  const left = testStart + test.info().timeout - Date.now() - RESERVE_MS;
  if (left <= 0) throw new Error(`sin presupuesto para otra espera: quedan ${left + RESERVE_MS} ms del test`);
  return Math.min(cap, left);
}
let testStart = 0;
test.beforeEach(() => {
  testStart = Date.now();
});
/** Margen para el cierre del test (capturas, fixture de medición) y para el propio mensaje de la espera. */
const RESERVE_MS = 15_000;

async function openLive(page: Page, query = 'gl=force') {
  await page.goto(`/es?${query}`);
  await page.mouse.move(320, 240);
  await expect(page.locator('.stage[data-state="live"]')).toBeAttached({ timeout: waitCap(60_000) });
  await page.waitForTimeout(1500);
}

/** Lleva la sección al centro de la ventana (el progreso de la sección, a la mitad). */
async function scrollToSection(page: Page, section: string) {
  await page.evaluate((s) => document.querySelector(`[data-section="${s}"]`)!.scrollIntoView({ block: 'center' }), section);
}
/** Las secciones después del hero, en el orden del DOM: cada una con su forma (clusters, lemniscata). */
const WALK = SECTIONS.filter((s) => s !== 'hero');

/** Barre el centro de la ventana hasta que aparece la ficha de un nodo; devuelve dónde quedó el puntero, o null. */
async function findNode(page: Page) {
  const { width, height } = page.viewportSize()!;
  for (let y = height * 0.3; y < height * 0.72; y += 22) {
    for (let x = width * 0.28; x < width * 0.72; x += 22) {
      await page.mouse.move(x, y);
      await page.waitForTimeout(90);
      if (await page.locator('.graph-tip').isVisible()) return { x, y };
    }
  }
  return null;
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
  const start = Date.now();
  let last = await page.locator('.stage').screenshot();
  let since = start;
  await expect
    .poll(
      async () => {
        await page.waitForTimeout(1000);
        const next = await page.locator('.stage').screenshot();
        if (!next.equals(last)) since = Date.now();
        last = next;
        return Date.now() - since >= STILL_MS;
      },
      { message: 'la escena en pausa no llegó a quedarse quieta', timeout: waitCap(STILL_CAP_MS), intervals: [0] },
    )
    .toBe(true);
  console.log(`stillStage: quieta tras ${((Date.now() - start) / 1000).toFixed(1)} s`);
  return last;
}
const STILL_MS = 3000;
/** Medido con la suite completa (proyecto 3d con 6 workers): de 27 a 50 s por llamada. */
const STILL_CAP_MS = 120_000;

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
  expect(await findNode(page)).not.toBeNull();
  await expect(page.locator('.graph-tip .graph-tip-label')).not.toBeEmpty();
  await page.screenshot({ path: `${SHOTS}/3d-hover.png` });
});

// Las tarjetas de los catálogos son contenido (CONTENT en GraphStage): el puntero sobre ellas no abre la ficha de un
// nodo, y un clic en su fondo no abre su sitio. Se busca un nodo en el hero y se pone encima, con un estilo de prueba,
// la tarjeta de Kósmos: la ficha se cierra; sin ella, vuelve (control).
test('el puntero sobre la tarjeta de un catálogo es contenido, no grafo', async ({ page }) => {
  await openLive(page);
  const node = await findNode(page);
  expect(node).not.toBeNull();
  const tip = page.locator('.graph-tip');
  for (const selector of ['.cat[data-cat="complexlab"]']) {
    const cover = await page.addStyleTag({
      // Sin sus hijos (visibility: hidden no recibe el puntero), el puntero cae en el fondo de la tarjeta, no en un enlace.
      // La tarjeta vive en su frente (.front.reveal): la animación de entrada del frente (transform) sería el bloque
      // contenedor del position: fixed y la tarjeta no cubriría la pantalla, así que también se apaga.
      content: `.home .reveal:has(${selector}) { animation: none !important; } .home ${selector} { position: fixed !important; inset: 0 !important; z-index: 20 !important; animation: none !important; } .home ${selector} > * { visibility: hidden !important; }`,
    });
    await page.mouse.move(node!.x + 1, node!.y + 1);
    await expect(tip, `${selector} delante del nodo`).toBeHidden({ timeout: waitCap(20_000) });
    await cover.evaluate((el) => (el as Element).remove());
    await page.mouse.move(node!.x, node!.y);
    await expect(tip, `control: sin ${selector}, el nodo vuelve a responder`).toBeVisible({ timeout: waitCap(20_000) });
  }
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
  await expect(page.locator('.graph-motion')).toHaveAttribute('aria-pressed', 'true', { timeout: waitCap(60_000) });
});

test('el scroll recorre la forma de cada sección sin errores', async ({ page }) => {
  const errors = await watchErrors(page);
  await openLive(page);
  // Con la animación en marcha, como la ve quien visita la página: morph de cada forma, pulsos, respiración y regulador
  // de calidad mientras la página se desplaza. Las capturas de cada forma en su pose van en los tests de abajo.
  await expect(page.locator('.graph-motion')).toHaveAttribute('aria-pressed', 'false');
  for (const section of WALK) {
    await page.locator(`[data-section="${section}"]`).scrollIntoViewIfNeeded();
    await scrollToSection(page, section);
    await page.waitForTimeout(2200);
  }
  await expect(page.locator('.stage[data-state="live"]'), 'la escena sigue viva al final del recorrido').toBeAttached();
  expect(errors).toEqual([]);
});

// Una captura por forma, cada una en su test: esperar a que la cámara llegue a cada pose cuesta de 27 a 50 s por forma
// en SwiftShader con la suite completa, y las cinco seguidas en un solo test llegaron a 2.7 min, el 90 % de su timeout.
for (const section of WALK) {
  test(`forma de ${section}: captura de la página cuando la cámara llega a su pose`, async ({ page }) => {
    const errors = await watchErrors(page);
    await openLive(page);
    // En pausa, la escena solo pinta hasta que la cámara llega a la pose de la sección: stillStage espera a que se
    // quede quieta.
    await pause(page);
    await scrollToSection(page, section);
    await stillStage(page);
    await page.screenshot({ path: `${SHOTS}/3d-${section}.png` });
    expect(errors).toEqual([]);
  });
}

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
    await expect(explore).toBeVisible({ timeout: waitCap(20_000) });
    await explore.click();
    await expect(page.locator('.stage[data-state="live"]')).toBeAttached({ timeout: waitCap(60_000) });
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
      { message: 'la escena en pausa no llegó a su pose', timeout: waitCap(120_000) },
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
  await expect.poll(async () => (await probeOf(page)).frames, { message: 'la escena no pintó el frame pedido', timeout: waitCap(30_000) }).toBeGreaterThan(frames);
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
 * Parte del escenario que cada capa de aristas tiene que pintar. Medido: del 0.96 % al 18 % según pose y nivel (lo
 * mínimo, las decorativas en reposo de Prueba en T1: atenuada a 0.35 y, en retrato, con la cámara alejada; §3.4). Con la
 * cinta del revés (el fallo de la T3 del plan) ninguna llega al 0.01 %; con la línea base decorativa a 0 o con aristas
 * decorativas de longitud 0 (puntos), las decorativas en reposo se quedan por debajo del 0.1 % (medidos con la cámara
 * de antes; alejarla solo puede bajarlos).
 */
const MIN_SHARE = 0.005;
/**
 * Parte de lo que pintan las decorativas en reposo que va en regiones de ≥ 16 px de lado. Medido: 0.88–0.99 (lo mínimo
 * en Contacto en T1). Con aristas decorativas de longitud 0 (puntos), 0.
 */
const MIN_FILAMENTS = 0.5;
/**
 * Mayor región conexa de blanco puro (los tres canales ≥ 250) que se tolera: ≈ un disco de 16 px. Medido con la mezcla
 * de las aristas de la spec §3.3: 0 px en T3 y, en T1, 12 px como mucho salvo en Contacto, de 61 a 103 px en 6 corridas
 * (pulsos sobre el haz de la lemniscata, más denso en pantalla desde que en retrato la cámara se aleja; antes, de 28 a
 * 74 px). Con la mezcla aditiva de antes, Contacto en T1 llegaba a 769–896 px.
 */
const MAX_WHITE_REGION = 200;
/**
 * Margen mínimo entre la forma (aristas semánticas en reposo) y cada borde del escenario, en fracción de su lado: la forma
 * cabe entera. Medido: en T1 (390 × 844), de 28 px (Contacto, a los lados) en adelante, y en T3 (1440 × 900), de 108 px
 * (Trayectoria, arriba) en adelante. Con las distancias de apaisado también en retrato (antes de la ronda 1 de la Tarea
 * 5), en T1 Método, Trayectoria y Contacto tocaban los dos lados (0 px) y Prueba quedaba a 9 px. Frentes no entra: la
 * cámara visita de cerca el cluster de la sección activa (spec §2, L3) y deja otro contra un borde, en T1 y en T3.
 */
const MIN_MARGIN = 0.03;

/**
 * Diferencia máxima, por canal y en todo el escenario, entre el fondo del canvas y la página detrás del póster (spec
 * §3.1). Medido tras el ajuste de la Tarea 6 (fondo sin tone mapping y, con compositor, adelantado a la viñeta y al
 * ACES): 3 niveles en T3 (el grano del EffectPass) y 2 en T1. Con el fondo de antes (halo gaussiano bajo el ACES), 39
 * en T3 y 49 en T1: el fundido póster → canvas azulaba el escenario, y en móvil también las esquinas.
 */
const MAX_BACKGROUND_DIFF = 4;

for (const { tier, viewport } of LEVELS) {
  test.describe(`T${tier} a ${viewport.width}×${viewport.height}`, () => {
    test.use({ viewport });

    test('hero: el fondo del canvas es la página detrás del póster (--ink-0 y el halo de .stage::before)', async ({ page }, info) => {
      const errors = await watchErrors(page);
      // La página sin el grafo del póster: solo --ink-0 y el halo.
      await page.goto('/es?gl=off');
      await hideContent(page);
      await page.addStyleTag({ content: '.home .stage-poster img { visibility: hidden !important; }' });
      const behind = decodePng(await page.locator('.stage').screenshot());
      // El canvas en el hero (la pose de CAMERA0, la del póster), en pausa y sin las capas del grafo: solo su fondo.
      await page.addInitScript(instrumentWebGL);
      await openLive(page, 'gl=force&worker=off');
      await pause(page);
      await hideContent(page);
      await settled(page);
      const { px } = await frameWith(page, { hide: ['edge', 'node', 'hub'] });
      const { instances } = await probeOf(page);
      expect(instances, 'aristas del nivel').toBeGreaterThanOrEqual(GRAPH_STATS.edges + TIERS[tier].decor);
      expect(instances, 'aristas del nivel').toBeLessThanOrEqual(GRAPH_STATS.edges + 2 * TIERS[tier].decor);

      expect([px.width, px.height]).toEqual([behind.width, behind.height]);
      let max = 0;
      let at = 0;
      for (let i = 0; i < px.data.length; i += 4) {
        const d = Math.max(Math.abs(px.data[i] - behind.data[i]), Math.abs(px.data[i + 1] - behind.data[i + 1]), Math.abs(px.data[i + 2] - behind.data[i + 2]));
        if (d > max) [max, at] = [d, i / 4];
      }
      const where = { x: at % px.width, y: Math.floor(at / px.width) };
      const pick = (p: typeof px) => Array.from(p.data.subarray(at * 4, at * 4 + 3));
      const stats = { diferenciaMaxima: max, en: where, pagina: pick(behind), canvas: pick(px) };
      console.log(`T${tier} fondo: ${JSON.stringify(stats)}`);
      info.annotations.push({ type: 'fondo', description: JSON.stringify(stats) });
      expect(max, `el fondo del canvas se aparta de la página: ${JSON.stringify(stats)}`).toBeLessThanOrEqual(MAX_BACKGROUND_DIFF);
      expect(errors).toEqual([]);
    });

    for (const section of SECTIONS) {
      const fit = section === 'frentes' ? '' : ' y la forma cabe entera';
      test(`pose ${section}: se pintan las aristas, también las de los satélites, nada se quema a blanco${fit}`, async ({ page }, info) => {
        const errors = await watchErrors(page);
        await page.addInitScript(instrumentWebGL);
        await openLive(page, 'gl=force&worker=off');
        await pause(page);
        await hideContent(page);
        await scrollToSection(page, section);
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
        const semanticMask = brighter(semanticRest.px, background.px, VISIBLE);
        const semanticPx = count(semanticMask);
        // Encuadre: distancia de las aristas semánticas en reposo (la forma, sin el halo de satélites) a cada borde.
        const framing = margins(semanticMask, semanticRest.px.width);
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
          margenes: framing,
        };
        console.log(`T${tier} ${section}: ${JSON.stringify(stats)}`);
        info.annotations.push({ type: 'píxeles', description: JSON.stringify(stats) });

        expect(inScene / area, 'aristas visibles en la escena').toBeGreaterThan(MIN_SHARE);
        expect(semanticPx / area, 'aristas semánticas en reposo').toBeGreaterThan(MIN_SHARE);
        expect(decorPx / area, 'aristas decorativas en reposo').toBeGreaterThan(MIN_SHARE);
        expect(filaments / decorPx, 'la capa decorativa son filamentos conectados, no puntos').toBeGreaterThan(MIN_FILAMENTS);
        expect(burnt[0]?.area ?? 0, `zona quemada a blanco en ${JSON.stringify(burnt[0])}`).toBeLessThanOrEqual(MAX_WHITE_REGION);
        if (fit) {
          const minX = MIN_MARGIN * full.px.width;
          const minY = MIN_MARGIN * full.px.height;
          const fits = !!framing && Math.min(framing.left, framing.right) >= minX && Math.min(framing.top, framing.bottom) >= minY;
          expect(fits, `la forma cabe en el escenario con ${Math.ceil(minX)} × ${Math.ceil(minY)} px de margen: ${JSON.stringify(framing)}`).toBe(true);
        }
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
  await expect(page.locator('.stage[data-state="live"]')).toBeAttached({ timeout: waitCap(60_000) });
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
