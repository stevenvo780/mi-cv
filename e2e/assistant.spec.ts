import type { Page, Route } from '@playwright/test';
import { expect, test } from './fixtures';

// La barra de accesos y el asistente «Pregúntame». Ningún test llama a la API real: /api/assistant se intercepta
// con page.route y responde aquí, así que no se gasta ni un token.

const WHATSAPP = 'https://wa.me/573046374368?text=Hola%20Steven%2C%20vi%20tu%20portafolio%20y%20quiero%20hablar%20contigo';
const ANSWER = 'Steven es ingeniero de software y filósofo en Medellín. Sus servicios están en https://praxis.stevenvallejo.com.';

type CspWindow = Window & { __csp?: string[] };

/** Intercepta el asistente: guarda cada cuerpo enviado y responde `reply` (texto en streaming o un error). */
async function mockAssistant(page: Page, reply: (route: Route) => Promise<void> = (route) => route.fulfill({ status: 200, contentType: 'text/plain; charset=utf-8', body: ANSWER })) {
  const bodies: unknown[] = [];
  await page.route('**/api/assistant', async (route) => {
    bodies.push(route.request().postDataJSON());
    await reply(route);
  });
  await page.addInitScript(() => {
    document.addEventListener('securitypolicyviolation', (e) => {
      const w = window as CspWindow;
      (w.__csp ??= []).push(`${e.violatedDirective} ${e.blockedURI}`);
    });
  });
  return bodies;
}

/** El botón «Pregúntame» visible: la píldora de la barra (en el móvil, el anillo con la chispa). */
const askButton = (page: Page) => page.locator('.topbar-actions > .ask');

test('la barra lleva los sitios hermanos, las secciones, el idioma, Servicios y WhatsApp', async ({ page }, info) => {
  await page.goto('/es');
  const wa = page.locator('.topbar').getByRole('link', { name: 'WhatsApp' });
  await expect(wa).toBeVisible();
  await expect(wa).toHaveAttribute('href', WHATSAPP);
  await expect(askButton(page)).toBeVisible();
  await expect(page.locator('.topbar .lang')).toBeVisible();
  const expected: [string, string][] = [
    ['CV Informático', 'https://informatico.stevenvallejo.com'],
    ['CV Filósofo', 'https://filosofo.stevenvallejo.com'],
    ['Blog · Scholḗ', 'https://schole.stevenvallejo.com'],
    ['Catálogo', '#frentes'],
    ['Contacto', '#contacto'],
  ];
  let nav = page.locator('nav.topnav');
  if (info.project.name !== 'desktop') {
    // Por debajo de 1280 px van dentro del menú, junto con Servicios y el asistente.
    await expect(nav).toBeHidden();
    await page.locator('details.menu summary').click();
    nav = page.locator('nav.menu-nav');
    await expect(nav.getByRole('link', { name: 'Servicios' })).toHaveAttribute('href', 'https://praxis.stevenvallejo.com');
    await expect(nav.getByRole('button', { name: /Pregúntame/ })).toBeVisible();
  } else {
    await expect(page.locator('.topbar .btn-solid')).toHaveAttribute('href', 'https://praxis.stevenvallejo.com');
  }
  for (const [name, href] of expected) await expect(nav.getByRole('link', { name, exact: true }), name).toHaveAttribute('href', href);
});

test('«Pregúntame» abre el asistente con el primer clic, responde en streaming y se cierra con Escape', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  const bodies = await mockAssistant(page);
  const scripts: string[] = [];
  page.on('request', (r) => r.resourceType() === 'script' && scripts.push(r.url()));
  await page.goto('/es', { waitUntil: 'networkidle' });
  // El panel no forma parte de la carga: ni su HTML ni una llamada al asistente antes del clic.
  await expect(page.locator('.ask-dialog')).toHaveCount(0);
  const before = scripts.length;

  await askButton(page).click();
  const dialog = page.getByRole('dialog', { name: 'Pregúntame' });
  await expect(dialog).toBeVisible();
  expect(scripts.length, 'el código del panel llega con un import() al hacer clic').toBeGreaterThan(before);
  expect(bodies).toHaveLength(0);

  const suggestions = dialog.locator('.ask-suggest button');
  await expect(suggestions).toHaveCount(3);
  const question = (await suggestions.first().textContent())!;
  await suggestions.first().click();
  await expect(dialog.locator('.ask-user')).toContainText(question);
  await expect(dialog.locator('.ask-assistant')).toContainText('ingeniero de software y filósofo');
  await expect(dialog.locator('.ask-assistant a')).toHaveAttribute('href', 'https://praxis.stevenvallejo.com');
  expect(bodies).toEqual([{ messages: [{ role: 'user', content: question }] }]);

  // Segunda pregunta: el historial viaja entero y alterno.
  await dialog.getByRole('textbox', { name: 'Tu pregunta' }).fill('¿Dónde vive?');
  await dialog.getByRole('textbox', { name: 'Tu pregunta' }).press('Enter');
  await expect(dialog.locator('.ask-assistant')).toHaveCount(2);
  expect(bodies[1]).toEqual({
    messages: [
      { role: 'user', content: question },
      { role: 'assistant', content: ANSWER },
      { role: 'user', content: '¿Dónde vive?' },
    ],
  });

  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(askButton(page)).toBeFocused();
  expect(errors).toEqual([]);
  expect(await page.evaluate(() => (window as CspWindow).__csp ?? [])).toEqual([]);
});

test('si se alcanza el límite (429), el asistente lo dice y ofrece WhatsApp y correo', async ({ page }) => {
  await mockAssistant(page, (route) => route.fulfill({ status: 429, contentType: 'application/json', body: '{"error":"rate_limited"}' }));
  await page.goto('/en');
  await askButton(page).click();
  const dialog = page.getByRole('dialog', { name: 'Ask me' });
  await dialog.getByRole('textbox', { name: 'Your question' }).fill('Who is Steven?');
  await dialog.getByRole('button', { name: 'Send' }).click();
  const error = dialog.locator('.ask-error');
  await expect(error).toContainText('question limit');
  await expect(error.getByRole('link', { name: 'WhatsApp' })).toHaveAttribute('href', WHATSAPP);
  await expect(error.getByRole('link', { name: 'Email' })).toHaveAttribute('href', 'mailto:stevenvallejo780@gmail.com');
});

test('desde el menú móvil: el menú se cierra, el panel se abre y al cerrarlo el foco vuelve a «Menú»', async ({ page }, info) => {
  test.skip(info.project.name === 'desktop', 'el menú <details> solo se muestra por debajo de 1280 px');
  await mockAssistant(page);
  await page.goto('/es');
  await page.locator('details.menu summary').click();
  await page.locator('.menu-ask').click();
  await expect(page.locator('.home details.menu[open]')).toHaveCount(0);
  const dialog = page.getByRole('dialog', { name: 'Pregúntame' });
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: 'Cerrar el asistente' }).click();
  await expect(dialog).toBeHidden();
  await expect(page.locator('details.menu summary')).toBeFocused();
});
