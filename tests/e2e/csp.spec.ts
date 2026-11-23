import { expect, test } from '@playwright/test';
import fs from 'node:fs';
import { liveThrough, skipOnboarding } from './helpers';

/**
 * The Content-Security-Policy of vercel.json, applied to the preview server's responses:
 * the app must work with no violation, and it must request nothing outside its own origin.
 */
const vercel = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
const csp: string = vercel.headers[0].headers.find((h: { key: string }) => h.key === 'Content-Security-Policy').value;

test('works under the production CSP and never leaves its origin', async ({ page, baseURL }) => {
  const origin = new URL(baseURL!).origin;
  const outside: string[] = [];
  const violations: string[] = [];
  page.on('request', (r) => {
    const u = new URL(r.url());
    if (!['data:', 'blob:'].includes(u.protocol) && u.origin !== origin) outside.push(r.url());
  });
  page.on('console', (m) => {
    if (/Content Security Policy/i.test(m.text())) violations.push(m.text());
  });
  await page.route('**/*', async (route) => {
    const response = await route.fetch();
    await route.fulfill({ response, headers: { ...response.headers(), 'content-security-policy': csp } });
  });
  await skipOnboarding(page);
  await page.goto('./#/today');
  await page.getByRole('button', { name: /عِش الدعاء/ }).click();
  await liveThrough(page, { note: 'سطر' });
  await page.getByRole('button', { name: 'مشاركة الدعاء' }).click();
  await expect(page.getByRole('img', { name: 'صورة الدعاء للمشاركة' })).toBeVisible({ timeout: 10_000 });
  await page.keyboard.press('Escape');
  for (const hash of ['#/library', '#/notebook', '#/calendar', '#/settings']) {
    await page.goto(`./${hash}`);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  }
  expect(violations).toEqual([]);
  expect(outside).toEqual([]);
});

test('works offline after the first visit', async ({ page, context }) => {
  await skipOnboarding(page);
  await page.goto('./#/today');
  await expect(page.locator('article h2').first()).toBeVisible();
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await expect(page.locator('article h2').first()).toBeVisible();
  await context.setOffline(true);
  await page.reload();
  await expect(page.locator('article h2').first()).toBeVisible();
  await page.goto('./#/calendar');
  await expect(page.getByRole('heading', { name: 'المداومة' })).toBeVisible();
  await context.setOffline(false);
});
