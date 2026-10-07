import { expect, test } from './fixtures';
import { authorizedProjectSnapshot, calendarSnapshot, projectSnapshot } from './project-data';

test('el bestiario conserva cifras, jerarquía y navegación accesible en los tres periodos', async ({ page }) => {
  const data = projectSnapshot();
  let requests = 0;
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.route('**/api/activity', (route) => route.fulfill({ json: { status: 'ready', snapshot: calendarSnapshot() } }));
  await page.route('**/api/activity/projects', (route) => { requests++; return route.fulfill({ json: { status: 'ready', snapshot: data } }); });
  await page.goto('/es/actividad');
  await expect(page.locator('.activity-stage')).toBeVisible();
  expect(requests, 'los datos por proyecto no se solicitan mientras solo se visita la escena superior').toBe(0);
  const bestiary = page.locator('.project-bestiary');
  await bestiary.scrollIntoViewIfNeeded();
  const rows = bestiary.locator('.pb-project-row');
  await expect(rows).toHaveCount(12);
  await expect(rows.first()).toHaveAttribute('data-project-id', 'cauce-v3');
  await expect(bestiary.locator('.pb-count')).toHaveText(new Intl.NumberFormat('es').format(1253));
  await rows.first().focus();
  await page.keyboard.press('ArrowDown');
  await expect(rows.nth(1)).toBeFocused();
  await expect(rows.nth(1)).toHaveAttribute('aria-pressed', 'true');
  await expect(bestiary.locator('.pb-specimen-identity h3')).toHaveText('Mouseîon');
  await bestiary.getByRole('button', { name: 'Proyectos: última semana', exact: true }).click();
  const quiet = bestiary.locator('.pb-project-row[data-project-id="clawbar"]');
  await quiet.click();
  await expect(bestiary.locator('.pb-count')).toHaveText('0');
  await expect(quiet).toHaveAttribute('aria-label', 'clawbar · 0 commits');
  await bestiary.getByRole('button', { name: 'Proyectos: último mes', exact: true }).click();
  await expect(bestiary.locator('.pb-count')).toHaveText('0');
  await bestiary.getByRole('button', { name: 'Proyectos: último año', exact: true }).click();
  await expect(bestiary.locator('.pb-count')).toHaveText('4');
  await expect(bestiary.locator('.pb-species-strip .pb-species')).toHaveCount(6);
  await expect(bestiary.locator('.pb-scene-fallback svg')).toBeVisible();
  await expect(bestiary.locator('.beast-scene canvas')).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('una fuente indisponible no se convierte en una clasificación vacía con ceros', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.route('**/api/activity', (route) => route.fulfill({ json: { status: 'ready', snapshot: calendarSnapshot() } }));
  await page.route('**/api/activity/projects', (route) => route.fulfill({ json: { status: 'unavailable', snapshot: null } }));
  await page.goto('/es/actividad');
  const bestiary = page.locator('.project-bestiary');
  await bestiary.scrollIntoViewIfNeeded();
  await expect(bestiary.getByRole('status')).toContainText('Todavía no hay un registro');
  await expect(bestiary.locator('.pb-project-row')).toHaveCount(0);
  await expect(bestiary.locator('.pb-count')).toHaveText('—');
  await expect(bestiary.locator('.pd-instrument')).toHaveCount(0);
  await expect(bestiary.locator('.beast-dominion')).toHaveCount(0);
  await expect(bestiary.getByRole('button', { name: 'Reintentar proyectos' })).toBeEnabled();
});

test('la versión inglesa conserva los nombres propios y explica el alcance de la métrica', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.route('**/api/activity', (route) => route.fulfill({ json: { status: 'ready', snapshot: calendarSnapshot() } }));
  await page.route('**/api/activity/projects', (route) => route.fulfill({ json: { status: 'ready', snapshot: projectSnapshot() } }));
  await page.goto('/en/actividad');
  const bestiary = page.locator('.project-bestiary');
  await bestiary.scrollIntoViewIfNeeded();
  await expect(bestiary.locator('.pb-project-row')).toHaveCount(12);
  await expect(bestiary.locator('.pb-provenance')).toContainText('default branch');
  await expect(bestiary.getByRole('button', { name: 'Projects: last week', exact: true })).toBeEnabled();
});

test('el registro autorizado incluye privados sin inventar enlaces y permite recorrer toda la lista', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.route('**/api/activity', (route) => route.fulfill({json:{status:'ready',snapshot:calendarSnapshot()}}));
  await page.route('**/api/activity/projects', (route) => route.fulfill({json:{status:'ready',snapshot:authorizedProjectSnapshot()}}));
  await page.goto('/es/actividad');
  const bestiary = page.locator('.project-bestiary');
  await bestiary.scrollIntoViewIfNeeded();
  const rows = bestiary.locator('.pb-project-row');
  await expect(rows).toHaveCount(29);
  await expect(bestiary.locator('.pb-specimen-identity h3')).toHaveText('Argos');
  await expect(bestiary.locator('.pb-specimen-footer a')).toHaveCount(0);
  await expect(bestiary.locator('.pb-provenance')).toContainText('privados');
  await rows.first().focus();
  await page.keyboard.press('End');
  await expect(rows.last()).toBeFocused();
  await expect(rows.last()).toHaveAttribute('aria-pressed','true');
  await expect(rows.last()).toBeInViewport();
  expect(await bestiary.locator('.pb-ranking').evaluate((list) => list.scrollHeight > list.clientHeight)).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('un fallo de sincronización conserva el registro autorizado anterior y avisa', async ({ page }) => {
  await page.clock.install({time:new Date()});
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.route('**/api/activity', (route) => route.fulfill({json:{status:'ready',snapshot:calendarSnapshot()}}));
  let requests = 0;
  await page.route('**/api/activity/projects', (route) => ++requests === 1
    ? route.fulfill({json:{status:'ready',snapshot:authorizedProjectSnapshot()}})
    : requests === 2 ? route.fulfill({status:503,json:{status:'unavailable',snapshot:null}})
    : route.fulfill({json:{status:'ready',snapshot:projectSnapshot()}}));
  await page.goto('/es/actividad');
  const bestiary = page.locator('.project-bestiary');
  await bestiary.scrollIntoViewIfNeeded();
  await expect(bestiary.locator('.pb-project-row')).toHaveCount(29);
  const count = await bestiary.locator('.pb-count').innerText();
  await page.clock.fastForward(3_600_100);
  await page.evaluate(() => window.dispatchEvent(new Event('focus')));
  await expect(bestiary.getByRole('status')).toContainText('Se conserva el último registro');
  await expect(bestiary.locator('.pb-project-row')).toHaveCount(29);
  await expect(bestiary.locator('.pb-count')).toHaveText(count);
  await expect(bestiary.locator('.pb-provenance')).toContainText('privados');
  await page.clock.fastForward(3_600_100);
  await page.evaluate(() => window.dispatchEvent(new Event('focus')));
  await expect(bestiary.getByRole('status')).toContainText('Se conserva el último registro');
  await expect(bestiary.locator('.pb-project-row')).toHaveCount(29);
  await expect(bestiary.locator('.pb-count')).toHaveText(count);
});
