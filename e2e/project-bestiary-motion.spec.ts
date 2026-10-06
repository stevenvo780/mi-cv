import { expect, test } from './fixtures';
import { decodePng } from './pixels';
import { calendarSnapshot, projectSnapshot } from './project-data';

function changedFraction(a: Buffer, b: Buffer) {
  const first = decodePng(a), next = decodePng(b);
  expect([next.width, next.height]).toEqual([first.width, first.height]);
  let changed = 0;
  for (let i = 0; i < first.data.length; i += 4) {
    if (Math.max(...[0, 1, 2].map((channel) => Math.abs(first.data[i + channel] - next.data[i + channel]))) > 8) changed++;
  }
  return changed / (first.width * first.height);
}

test('las criaturas tienen movimiento real, pausa exacta y anatomías diferentes', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: 'no-preference' });
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
  await canvas.scrollIntoViewIfNeeded();
  await page.mouse.move(5, 5);
  let still = await canvas.screenshot();
  await expect.poll(async () => {
    await page.waitForTimeout(800);
    const next = await canvas.screenshot();
    const equal = next.equals(still);
    still = next;
    return equal;
  }, { timeout: 30_000 }).toBe(true);
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
