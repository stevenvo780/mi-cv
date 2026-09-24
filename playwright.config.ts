import { defineConfig } from '@playwright/test';

// Red de seguridad bajo las rutas de e2e/fixtures.ts: el navegador no resuelve los hosts de medición de Google, así
// que lo que escape a la intercepción de Playwright (p. ej. una baliza keepalive al descargar la página) muere en el
// DNS y no llega a la propiedad de GA. www.googletagmanager.com sí resuelve: el test de GA pide el gtag.js real.
// Un proyecto con sus propios launchOptions parte de LAUNCH y añade sus args, para no perder la regla.
const MEASUREMENT_DNS = ['*.google-analytics.com', 'google-analytics.com', '*.analytics.google.com', '*.doubleclick.net', '*.googlesyndication.com', '*.googleadservices.com', 'google.*', '*.google.*'];
const LAUNCH = {
  executablePath: process.env.PW_CHROME ?? '/usr/bin/google-chrome',
  args: [`--host-resolver-rules=${MEASUREMENT_DNS.map((host) => `MAP ${host} ~NOTFOUND`).join(', ')}`],
};

export default defineConfig({
  testDir: 'e2e',
  timeout: 60_000,
  fullyParallel: true,
  use: {
    baseURL: 'http://localhost:3210',
    launchOptions: LAUNCH,
  },
  webServer: { command: 'npx next start -p 3210', url: 'http://localhost:3210/es', reuseExistingServer: true, timeout: 120_000 },
  projects: [
    { name: 'desktop', testIgnore: /graph3d\.spec\.ts/, use: { viewport: { width: 1440, height: 900 } } },
    { name: 'tablet', testIgnore: /graph3d\.spec\.ts/, use: { viewport: { width: 834, height: 1112 } } },
    { name: 'mobile', testIgnore: /graph3d\.spec\.ts/, use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
    // El grafo 3D con WebGL por SwiftShader (software): solo este proyecto ejecuta graph3d.spec.ts.
    {
      name: '3d',
      testMatch: /graph3d\.spec\.ts/,
      timeout: 180_000,
      use: {
        viewport: { width: 1440, height: 900 },
        // LAUNCH ya lleva el ejecutable y la regla que deja sin DNS los hosts de medición: se conservan.
        launchOptions: { ...LAUNCH, args: [...LAUNCH.args, '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] },
      },
    },
  ],
});
