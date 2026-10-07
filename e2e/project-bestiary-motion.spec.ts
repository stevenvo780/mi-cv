import { expect, test } from './fixtures';
import { decodePng } from './pixels';
import { calendarSnapshot, projectSnapshot } from './project-data';

function changedFraction(a: Buffer, b: Buffer, threshold = 8) {
  const first = decodePng(a), next = decodePng(b);
  expect([next.width, next.height]).toEqual([first.width, first.height]);
  let changed = 0;
  for (let i = 0; i < first.data.length; i += 4) {
    if (Math.max(...[0, 1, 2].map((channel) => Math.abs(first.data[i + channel] - next.data[i + channel]))) > threshold) changed++;
  }
  return changed / (first.width * first.height);
}

function maximumPixelDifference(a: Buffer, b: Buffer) {
  const first = decodePng(a), next = decodePng(b);
  expect([next.width, next.height]).toEqual([first.width, first.height]);
  let maximum = 0;
  for (let index = 0; index < first.data.length; index++) maximum = Math.max(maximum, Math.abs(first.data[index] - next.data[index]));
  return maximum;
}

test('las criaturas tienen movimiento real, pausa sin renders y anatomías diferentes', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.addInitScript(() => {
    const proof = globalThis as typeof globalThis & { __beastDraws: number };
    proof.__beastDraws = 0;
    for (const key of ['drawArrays', 'drawElements'] as const) {
      const original = WebGL2RenderingContext.prototype[key];
      WebGL2RenderingContext.prototype[key] = function (...args: Parameters<typeof original>) {
        if (this.canvas instanceof HTMLCanvasElement && this.canvas.closest('.beast-scene')) proof.__beastDraws++;
        return Reflect.apply(original, this, args);
      };
    }
  });
  await page.route('**/api/activity', (route) => route.fulfill({ json: { status: 'ready', snapshot: calendarSnapshot() } }));
  await page.route('**/api/activity/projects', (route) => route.fulfill({ json: { status: 'ready', snapshot: projectSnapshot() } }));
  await page.goto('/es/actividad');
  const bestiary = page.locator('.project-bestiary');
  await bestiary.locator('.pb-specimen-visual').scrollIntoViewIfNeeded();
  await expect(bestiary.locator('.pb-exhibit.has-webgl')).toBeAttached({ timeout: 45_000 });
  const canvas = bestiary.locator('.beast-scene canvas');
  await expect(canvas).toBeVisible();
  await page.mouse.move(5, 5);
  await page.waitForTimeout(2200);
  const a = await canvas.screenshot({ path: '/workspace/MySites/.previews/bestiary-motion-a.png' });
  await page.waitForTimeout(1800);
  const b = await canvas.screenshot({ path: '/workspace/MySites/.previews/bestiary-motion-b.png' });
  expect(changedFraction(a, b), 'el cuerpo y los apéndices se mueven, además de la interfaz').toBeGreaterThan(.003);
  await bestiary.getByRole('button', { name: 'Pausar criaturas', exact: true }).click();
  await expect(bestiary.locator('.beast-dominion')).toHaveAttribute('data-paused', 'true');
  expect(await bestiary.locator('.bd-orbit-first').evaluate((ring) => getComputedStyle(ring).animationPlayState)).toBe('paused');
  expect(await bestiary.locator('.pd-project[data-apex="true"] .pd-core').first().evaluate((core) => getComputedStyle(core, '::before').animationPlayState)).toBe('paused');
  await canvas.scrollIntoViewIfNeeded();
  await page.mouse.move(5, 5);
  await page.waitForTimeout(1200);
  const drawCount = () => page.evaluate(() => (globalThis as typeof globalThis & { __beastDraws: number }).__beastDraws);
  const frozenDraws = await drawCount();
  expect(frozenDraws, 'la instrumentación observó dibujos reales antes de la pausa').toBeGreaterThan(0);
  const clock = () => bestiary.evaluate((element) => element.getAnimations({ subtree: true }).map((animation) => ({ state: animation.playState, time: animation.currentTime })));
  const frozenClock = await clock();
  expect(frozenClock.every((animation) => animation.state === 'paused')).toBe(true);
  let still = await canvas.screenshot();
  await expect.poll(async () => {
    await page.waitForTimeout(800);
    const next = await canvas.screenshot();
    // Transparent blurred SVG layers can round a few composite channels by one unit.
    // Compare decoded pixels, then separately prove zero GL draws and frozen CSS clocks.
    const equal = maximumPixelDifference(still, next) <= 1 && changedFraction(still, next, 0) < .001;
    still = next;
    return equal;
  }, { timeout: 30_000 }).toBe(true);
  expect(await drawCount(), 'la pausa no produce ningún nuevo dibujo WebGL').toBe(frozenDraws);
  expect(await clock(), 'la pausa congela también el halo y los adornos').toEqual(frozenClock);
  const hydra = still;
  await bestiary.locator('.pb-project-row[data-project-id="clavis"]').click();
  await canvas.scrollIntoViewIfNeeded();
  await page.mouse.move(5, 5);
  await page.waitForTimeout(2300);
  const moth = await canvas.screenshot({ path: '/workspace/MySites/.previews/bestiary-moth.png' });
  expect(changedFraction(hydra, moth), 'la polilla tiene otra anatomía').toBeGreaterThan(.02);
  await bestiary.locator('.pb-project-row[data-project-id="clawbar"]').click();
  await canvas.scrollIntoViewIfNeeded();
  await page.mouse.move(5, 5);
  await page.waitForTimeout(2300);
  const sprout = await canvas.screenshot({ path: '/workspace/MySites/.previews/bestiary-sprout.png' });
  expect(changedFraction(moth, sprout), 'el brote tiene otra silueta y escala').toBeGreaterThan(.02);
  await expect(bestiary.locator('.pb-specimen-identity h3')).toHaveText('clawbar');
  expect(errors).toEqual([]);
});

test('sin WebGL o con movimiento reducido se conservan el proyecto y todos sus recuentos', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.route('**/api/activity', (route) => route.fulfill({ json: { status: 'ready', snapshot: calendarSnapshot() } }));
  await page.route('**/api/activity/projects', (route) => route.fulfill({ json: { status: 'ready', snapshot: projectSnapshot() } }));
  await page.goto('/es/actividad');
  const bestiary = page.locator('.project-bestiary');
  await bestiary.locator('.pb-specimen-visual').scrollIntoViewIfNeeded();
  await expect(bestiary.locator('.pb-exhibit.has-webgl')).toBeAttached({ timeout: 45_000 });
  await bestiary.locator('.beast-scene canvas').evaluate((element: HTMLCanvasElement) => {
    const extension = element.getContext('webgl2')?.getExtension('WEBGL_lose_context');
    if (!extension) throw new Error('context loss unavailable');
    extension.loseContext();
  });
  await expect(bestiary.locator('.pb-scene-fallback svg')).toBeVisible();
  await expect(bestiary.locator('.pb-count')).toHaveText(new Intl.NumberFormat('es').format(1253));
  await bestiary.locator('.pb-project-row[data-project-id="specorganon"]').click();
  await expect(bestiary.locator('.pb-count')).toHaveText('595');
  await expect(bestiary.locator('.pb-scene-fallback svg')).toHaveAttribute('data-kind', 'sentinel');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(bestiary.locator('.beast-scene canvas')).toHaveCount(0);
  await expect(bestiary.getByRole('button', { name: 'Pausar criaturas' })).toBeDisabled();
});
