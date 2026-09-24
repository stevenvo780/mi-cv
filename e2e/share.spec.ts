import { expect, test } from './fixtures';

test('el pie de la portada abre la tarjeta con sitios, servicios, blog y catálogos', async ({ page }) => {
  await page.goto('/es');
  await page.locator('footer.footer').getByRole('link', { name: 'Compartir con QR' }).click();
  await expect(page).toHaveURL(/\/es\/compartir$/);
  await expect(page.getByRole('heading', { name: 'Mis sitios' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Áreas' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Catálogos' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Contacto y redes' })).toBeVisible();
  await expect(page.locator('.share-option')).toHaveCount(18);
});

test('cada destino elegido cambia el enlace y el QR se amplía a toda la pantalla', async ({ page }) => {
  await page.goto('/es/compartir');
  await page.locator('.share-option').filter({ hasText: 'Práxis' }).click();
  await expect(page.getByRole('link', { name: /Abrir enlace/ })).toHaveAttribute('href', 'https://praxis.stevenvallejo.com');

  await page.locator('.share-option').filter({ hasText: 'Humanizar' }).click();
  await expect(page.getByRole('link', { name: /Abrir enlace/ })).toHaveAttribute('href', 'https://catalogo.humanizar.tech/');
  const qrButton = page.getByRole('button', { name: 'Mostrar QR grande: Humanizar' });
  await qrButton.focus();
  await page.keyboard.press('Enter');

  const dialog = page.getByRole('dialog', { name: 'Humanizar' });
  await expect(dialog).toBeVisible();
  const bounds = await dialog.boundingBox();
  const viewport = page.viewportSize();
  expect(bounds).not.toBeNull();
  expect(viewport).not.toBeNull();
  expect(bounds!.width).toBeGreaterThanOrEqual(viewport!.width - 2);
  expect(bounds!.height).toBeGreaterThanOrEqual(viewport!.height - 2);
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(qrButton).toBeFocused();

  if (viewport!.width <= 900) {
    await page.getByRole('button', { name: 'Elegir otro destino' }).click();
    await expect(page.locator('.share-option[aria-pressed="true"]')).toBeFocused();
  }
});

test('el QR sigue siendo grande y se puede cerrar con poco alto de pantalla', async ({ page }) => {
  await page.goto('/es/compartir');
  for (const viewport of [{ width: 320, height: 200 }, { width: 667, height: 375 }]) {
    await page.setViewportSize(viewport);
    const trigger = page.getByRole('button', { name: 'Mostrar QR grande: Sitio principal' });
    await trigger.click();
    const dialog = page.getByRole('dialog', { name: 'Sitio principal' });
    await expect(dialog).toBeVisible();
    const qr = await dialog.locator('.share-presentation-code svg').boundingBox();
    expect(qr?.width).toBeGreaterThanOrEqual(260);
    await dialog.evaluate((element) => { element.scrollTop = element.scrollHeight; });
    const close = dialog.getByRole('button', { name: /Cerrar vista ampliada/ });
    await expect(close).toBeInViewport();
    await close.click();
    await expect(trigger).toBeFocused();
  }
});

test('una copia terminada después de cambiar de destino no muestra un aviso incorrecto', async ({ page }) => {
  await page.goto('/es/compartir');
  await page.evaluate(() => {
    const pending = new Promise<void>((resolve) => {
      (window as Window & { finishShareCopy?: () => void }).finishShareCopy = resolve;
    });
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: () => pending },
    });
  });
  await page.getByRole('button', { name: 'Copiar enlace' }).click();
  await page.locator('.share-option').filter({ hasText: 'Práxis' }).click();
  await page.evaluate(() => (window as Window & { finishShareCopy?: () => void }).finishShareCopy?.());
  await expect(page.locator('.share-copy-status')).toHaveText('');
});
