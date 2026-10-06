import type { ActivitySnapshot } from '../src/activity/model';
import { expect, test } from './fixtures';

function fixture(metric: 'contributions' | 'commits' = 'contributions'): ActivitySnapshot {
  const now = new Date();
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const days = Array.from({ length: 365 }, (_, i) => ({ date: new Date(today - (364 - i) * 86_400_000).toISOString().slice(0, 10), count: i % 13 }));
  return { version: 1, source: metric === 'commits' ? 'journal' : 'github', metric, updatedAt: now.toISOString(), days,
    highlights: [{ date: days[364].date, area: 'engineering', title: { es: 'Una visualización verificada', en: 'A verified visualization' } }] };
}

test('la nueva pestaña abre desde la portada, filtra periodos y se recorre con teclado', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const snapshot = fixture();
  await page.route('**/api/activity', (route) => route.fulfill({ json: { status: 'ready', snapshot } }));
  await page.goto('/es');
  const menu = page.locator('.home .menu summary');
  if (await menu.isVisible()) await menu.click();
  await page.getByRole('link', { name: 'Qué estoy haciendo', exact: true }).filter({ visible: true }).first().click();
  await expect(page).toHaveURL(/\/es\/actividad$/);
  await expect(page.locator('#activity-title')).toBeVisible();
  const metric = page.locator('.activity-metrics > div').first().locator('dd');
  const sum = (length: number) => new Intl.NumberFormat('es').format(snapshot.days.slice(-length).reduce((n, d) => n + d.count, 0));
  await expect(metric).toHaveText(sum(365));
  await page.getByRole('button', { name: 'Última semana', exact: true }).click();
  await expect(metric).toHaveText(sum(7));
  await expect(page.locator('.activity-day:not(.outside-window)')).toHaveCount(7);
  await page.getByRole('button', { name: 'Último mes', exact: true }).click();
  await expect(metric).toHaveText(sum(30));
  await expect(page.locator('.activity-day:not(.outside-window)')).toHaveCount(30);
  const selected = page.locator('.activity-day[tabindex="0"]');
  await selected.focus();
  await page.keyboard.press('ArrowLeft');
  await expect(page.getByLabel('Explorar una fecha')).toHaveValue(snapshot.days[363].date);
  await expect(page.locator('.activity-day[tabindex="0"]')).toBeFocused();
  await page.keyboard.press('End');
  await expect(page.getByLabel('Explorar una fecha')).toHaveValue(snapshot.days[364].date);
  await expect(page.getByRole('heading', { name: 'Una visualización verificada' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: `/workspace/MySites/.previews/actividad-${test.info().project.name}.png`, fullPage: true });
});

test('el idioma mantiene la pestaña y la métrica de commits', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const snapshot = fixture('commits');
  await page.route('**/api/activity', (route) => route.fulfill({ json: { status: 'ready', snapshot } }));
  await page.goto('/es/actividad');
  await expect(page.locator('.activity-day-value > span')).toHaveText('commits');
  await expect(page.locator('.activity-day[tabindex="0"]')).toHaveAttribute('aria-label', /commits/);
  await page.getByRole('link', { name: 'EN', exact: true }).click();
  await expect(page).toHaveURL(/\/en\/actividad$/);
  await expect(page.locator('#activity-title')).toBeVisible();
  await expect(page.locator('.activity-day-value > span')).toHaveText('commits');
});

test('una fuente caída no inventa cifras y puede reintentarse', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  let failed = true;
  await page.route('**/api/activity', (route) => route.fulfill(failed ? { status: 503, json: { status: 'unavailable', snapshot: null } } : { json: { status: 'ready', snapshot: fixture() } }));
  await page.goto('/es/actividad');
  await expect(page.getByRole('button', { name: 'Volver a intentar' })).toBeVisible();
  await expect(page.locator('.activity-metrics > div').first().locator('dd')).toHaveText('—');
  await expect(page.locator('.activity-day')).toHaveCount(0);
  failed = false;
  await page.getByRole('button', { name: 'Volver a intentar' }).click();
  await expect(page.locator('.activity-day')).toHaveCount(365);
});

test('avisa cuando la fuente lleva más de 48 horas sin generarse', async ({ page }) => {
  const snapshot = fixture();
  snapshot.updatedAt = new Date(Date.now() - 3 * 86_400_000).toISOString();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.route('**/api/activity', (route) => route.fulfill({ json: { status: 'ready', snapshot } }));
  await page.goto('/es/actividad');
  await expect(page.getByText('Esta sincronización tiene más de 48 horas.', { exact: false })).toBeVisible();
  await expect(page.locator('.activity-scene canvas')).toHaveCount(0);
  await expect(page.locator('.activity-day')).toHaveCount(365);
});
