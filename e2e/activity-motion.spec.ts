import type { ActivitySnapshot } from '../src/activity/model';
import { expect, test } from './fixtures';
import { decodePng } from './pixels';

test.use({ video: { mode: 'on', size: { width: 1440, height: 900 } } });

function snapshot(): ActivitySnapshot {
  const today = new Date().toISOString().slice(0, 10);
  const end = Date.parse(`${today}T00:00:00Z`);
  return {
    version: 1, source: 'github', metric: 'contributions', updatedAt: new Date().toISOString(), highlights: [],
    days: Array.from({ length: 365 }, (_, i) => ({ date: new Date(end - (364 - i) * 86_400_000).toISOString().slice(0, 10), count: i % 19 === 0 ? 0 : (i * 17) % 80 })),
  };
}

function changedFraction(a: Buffer, b: Buffer) {
  const first = decodePng(a), next = decodePng(b);
  expect([next.width, next.height]).toEqual([first.width, first.height]);
  let changed = 0;
  for (let i = 0; i < first.data.length; i += 4) {
    if (Math.max(...[0, 1, 2].map((channel) => Math.abs(first.data[i + channel] - next.data[i + channel]))) > 8) changed++;
  }
  return changed / (first.width * first.height);
}

test('la escultura se mueve de verdad, se detiene y cambia de forma aun en pausa', async ({ page }) => {
  const data = snapshot();
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.route('**/api/activity', (route) => route.fulfill({ json: { status: 'ready', snapshot: data } }));
  await page.goto('/es/actividad');
  const canvas = page.locator('.activity-scene canvas');
  await expect(page.locator('.activity-stage.has-webgl')).toBeAttached({ timeout: 45_000 });
  await expect(canvas).toBeVisible({ timeout: 45_000 });
  await canvas.scrollIntoViewIfNeeded();
  await page.mouse.move(5, 5);
  await page.waitForTimeout(2200);
  const a = await canvas.screenshot({ path: '/workspace/MySites/.previews/actividad-v2-motion-a.png' });
  await page.waitForTimeout(1800);
  const b = await canvas.screenshot({ path: '/workspace/MySites/.previews/actividad-v2-motion-b.png' });
  expect(changedFraction(a, b), 'cambia la escultura, no solo el indicador de carga').toBeGreaterThan(0.003);
  await page.getByRole('button', { name: 'Pausar animación', exact: true }).click();
  await page.mouse.move(5, 5);
  let still = await canvas.screenshot();
  await expect.poll(async () => {
    await page.waitForTimeout(1000);
    const next = await canvas.screenshot();
    const same = next.equals(still);
    still = next;
    return same;
  }, { timeout: 45_000, message: 'la pausa realmente detiene el canvas' }).toBe(true);
  const year = still;
  await page.getByRole('button', { name: 'Último mes', exact: true }).click();
  await page.mouse.move(5, 5);
  await page.waitForTimeout(2800);
  const month = await canvas.screenshot({ path: '/workspace/MySites/.previews/actividad-v2-month.png' });
  expect(changedFraction(year, month)).toBeGreaterThan(0.01);
  await page.getByRole('button', { name: 'Última semana', exact: true }).click();
  await page.mouse.move(5, 5);
  await page.waitForTimeout(2800);
  const week = await canvas.screenshot({ path: '/workspace/MySites/.previews/actividad-v2-week.png' });
  expect(changedFraction(month, week)).toBeGreaterThan(0.01);
  await page.reload();
  await expect(page.getByRole('button', { name: 'Reanudar animación', exact: true })).toBeVisible();
  expect(errors).toEqual([]);
});

test('la reproducción y el teclado recorren días reales también en móvil', async ({ page }) => {
  const data = snapshot();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.route('**/api/activity', (route) => route.fulfill({ json: { status: 'ready', snapshot: data } }));
  await page.goto('/es/actividad');
  await expect(page.locator('.activity-stage.has-webgl')).toBeAttached({ timeout: 45_000 });
  await expect(page.locator('.activity-scene canvas')).toBeVisible({ timeout: 45_000 });
  await page.getByRole('button', { name: 'Reproducir el periodo', exact: true }).click();
  await expect(page.getByLabel('Explorar una fecha')).not.toHaveValue(data.days.at(-1)!.date);
  await page.getByRole('button', { name: 'Detener reproducción', exact: true }).click();
  const range = page.getByRole('slider', { name: 'Recorrer los días', exact: true });
  await range.focus();
  await page.keyboard.press('Home');
  await expect(page.getByLabel('Explorar una fecha')).toHaveValue(data.days[0].date);
  await page.keyboard.press('End');
  await expect(page.getByLabel('Explorar una fecha')).toHaveValue(data.days.at(-1)!.date);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: '/workspace/MySites/.previews/actividad-v2-mobile.png', fullPage: true });
});

test('la pérdida de WebGL conserva fechas, cifras y navegación', async ({ page }) => {
  const data = snapshot();
  await page.route('**/api/activity', (route) => route.fulfill({ json: { status: 'ready', snapshot: data } }));
  await page.goto('/es/actividad');
  const canvas = page.locator('.activity-scene canvas');
  await expect(page.locator('.activity-stage.has-webgl')).toBeAttached({ timeout: 45_000 });
  await expect(canvas).toBeVisible({ timeout: 45_000 });
  await canvas.evaluate((element: HTMLCanvasElement) => {
    const context = element.getContext('webgl2');
    if (!context) throw new Error('no se creó el contexto WebGL');
    const extension = context.getExtension('WEBGL_lose_context');
    if (!extension) throw new Error('el navegador de prueba no permite simular pérdida de contexto');
    extension.loseContext();
  });
  await expect(page.locator('.activity-day[tabindex="0"]')).toBeVisible();
  await expect(page.locator('.activity-day')).toHaveCount(365);
  await expect(page.locator('.activity-metrics > div').first().locator('dd')).toHaveText(new Intl.NumberFormat('es').format(data.days.reduce((total, day) => total + day.count, 0)));
  await page.getByLabel('Explorar una fecha').fill(data.days[0].date);
  await expect(page.locator('.activity-day-value')).toContainText(String(data.days[0].count));
});
