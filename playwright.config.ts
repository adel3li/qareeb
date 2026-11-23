import { defineConfig, devices } from '@playwright/test';
import { existsSync } from 'node:fs';

// In the cloud environment a Chromium is pre-installed; CI installs Playwright's own.
const LOCAL_CHROMIUM = '/opt/pw-browsers/chromium';

export default defineConfig({
  testDir: 'tests',
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://localhost:4174',
    locale: 'ar-SA',
    timezoneId: 'Asia/Riyadh',
    trace: 'off',
    launchOptions: existsSync(LOCAL_CHROMIUM) ? { executablePath: LOCAL_CHROMIUM } : {},
  },
  projects: [
    { name: 'phone', use: { ...devices['Desktop Chrome'], viewport: { width: 390, height: 844 } } },
    { name: 'small', use: { ...devices['Desktop Chrome'], viewport: { width: 360, height: 640 } }, testMatch: /layout\.spec/ },
  ],
  webServer: {
    // Runs against the production build (bun run build first).
    command: 'bunx vite preview --port 4174 --strictPort',
    port: 4174,
    reuseExistingServer: !process.env.CI,
  },
});
