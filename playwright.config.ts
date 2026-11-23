import { defineConfig, devices } from '@playwright/test';

/** End-to-end flows on the production build (vite preview). Run with: bun run e2e -- --trace off */
export default defineConfig({
  testDir: 'tests',
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://localhost:4173',
    viewport: { width: 390, height: 844 },
    serviceWorkers: 'block',
    locale: 'ar',
  },
  projects: [
    { name: 'riyadh', use: { ...devices['Desktop Chrome'], viewport: { width: 390, height: 844 }, timezoneId: 'Asia/Riyadh' } },
    { name: 'new-york', use: { ...devices['Desktop Chrome'], viewport: { width: 390, height: 844 }, timezoneId: 'America/New_York' }, grep: /@tz/ },
  ],
  webServer: {
    command: 'bun run build && bunx vite preview --port 4173 --strictPort',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
