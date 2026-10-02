import { expect, test } from './fixtures';
import { PORTRAIT } from '../src/app/components/Portrait/portraitData';

for (const locale of ['es', 'en'] as const) {
  test(`/${locale}: historia visible, navegación por capítulos y regreso al catálogo`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(`/${locale}`);
    const history = page.locator('#historia');
    await history.scrollIntoViewIfNeeded();
    await expect(history.getByRole('heading', { level: 2 })).toHaveText(PORTRAIT[locale].heroTitle);
    await expect(history.locator('[data-story-scene] svg')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0);
    await history.locator(`a[href="/${locale}/lore"]`).click();
    await expect(page).toHaveURL(new RegExp(`/${locale}/lore$`));
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(PORTRAIT[locale].heroTitle);
    await page.locator('a[href="#capitulo-4"]').click();
    await expect(page).toHaveURL(/#capitulo-4$/);
    await expect(page.locator('#capitulo-4 h2')).toBeInViewport();
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0);
    await page.locator(`main a[href="/${locale}"]`).first().click();
    await expect(page).toHaveURL(new RegExp(`/${locale}$`));
    await expect(page.locator('.home')).toBeVisible();
    expect(errors).toEqual([]);
  });
}

test('la historia completa permite detener su escena sin ocultar el relato', async ({ page }) => {
  await page.goto('/es/lore');
  const scene = page.locator('[data-story-scene]');
  await expect.poll(() => scene.evaluate((el) => el.getAnimations({ subtree: true }).length)).toBeGreaterThan(0);
  await page.getByRole('checkbox', { name: 'Pausar animación' }).check();
  await expect.poll(() => scene.evaluate((el) => el.getAnimations({ subtree: true }).filter((animation) => animation.playState === 'running').length)).toBe(0);
  await expect(page.locator('#capitulo-7')).toBeAttached();
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});

test.describe('movimiento reducido', () => {
  test.use({ reducedMotion: 'reduce' });
  test('la escena es estática desde la carga y los capítulos siguen accesibles', async ({ page }) => {
    await page.goto('/es/lore');
    const scene = page.locator('[data-story-scene]');
    await expect(scene.locator('svg')).toBeVisible();
    expect(await scene.evaluate((el) => el.getAnimations({ subtree: true }).length)).toBe(0);
    await page.locator('a[href="#capitulo-7"]').click();
    await expect(page.locator('#capitulo-7 h2')).toBeInViewport();
  });
});

test.describe('sin JavaScript', () => {
  test.use({ javaScriptEnabled: false, reducedMotion: 'reduce' });
  test('el relato y el índice llegan completos desde el servidor', async ({ page }) => {
    await page.goto('/es/lore');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(PORTRAIT.es.heroTitle);
    for (let index = 1; index <= PORTRAIT.es.sections.length; index++) {
      await expect(page.locator(`#capitulo-${index}`)).toBeVisible();
      await expect(page.locator(`a[href="#capitulo-${index}"]`)).toBeVisible();
    }
    await page.locator('a[href="#capitulo-7"]').click();
    await expect(page.locator('#capitulo-7 h2')).toBeInViewport();
  });
});
