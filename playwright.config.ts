import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'e2e',
  timeout: 60_000,
  fullyParallel: true,
  use: {
    baseURL: 'http://localhost:3210',
    launchOptions: { executablePath: process.env.PW_CHROME ?? '/usr/bin/google-chrome' },
  },
  webServer: { command: 'npx next start -p 3210', url: 'http://localhost:3210/es', reuseExistingServer: true, timeout: 120_000 },
  projects: [
    { name: 'desktop', use: { viewport: { width: 1440, height: 900 } } },
    { name: 'tablet', use: { viewport: { width: 834, height: 1112 } } },
    { name: 'mobile', use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
  ],
});
