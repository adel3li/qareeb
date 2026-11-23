import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { SHOTS, skipOnboarding } from './helpers';

/** No serious or critical axe violation on any screen, in either theme. */
for (const theme of ['light', 'dark'] as const) {
  test(`axe: every screen, ${theme}`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: theme });
    await skipOnboarding(page);
    for (const hash of ['#/today', '#/library', '#/notebook', '#/calendar', '#/settings', '#/dua/dua_0003']) {
      await page.goto(`./${hash}`);
      await expect(page.getByText('يُحمَّل…')).toHaveCount(0);
      await expect(page.getByRole('heading').first()).toBeVisible();
      const results = await new AxeBuilder({ page }).analyze();
      const bad = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
      expect(bad.map((v) => `${hash} ${v.id}: ${v.nodes.map((n) => n.target.join(' ')).slice(0, 3).join(' | ')}`)).toEqual([]);
    }
  });
}

test('axe: onboarding and the guided flow', async ({ page }) => {
  await page.goto('./');
  await expect(page.getByRole('heading', { name: 'لكلّ دعاءٍ قصة' })).toBeVisible();
  let results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical').map((v) => v.id)).toEqual([]);
  await page.getByRole('button', { name: 'تخطَّ' }).click();
  await page.getByRole('button', { name: /عِش الدعاء/ }).click();
  await page.getByRole('dialog', { name: 'عِش الدعاء' }).waitFor();
  results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical').map((v) => v.id)).toEqual([]);
});

test('onboarding scrolls on a short screen with the largest text, nothing covered', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 560 });
  await page.addInitScript(() => {
    if (!sessionStorage.getItem('s')) {
      sessionStorage.setItem('s', '1');
      localStorage.setItem('qareeb:settings:v1', JSON.stringify({ state: { theme: 'system', fontScale: 24, showMyDuasInFlow: true }, version: 1 }));
    }
  });
  await page.goto('./');
  for (let i = 0; i < 3; i++) await page.getByRole('button', { name: 'التالي' }).click();
  const start = page.getByRole('button', { name: 'ابدأ بدعاء اليوم' });
  await start.scrollIntoViewIfNeeded();
  await expect(start).toBeInViewport();
  if (SHOTS) await page.screenshot({ path: `${SHOTS}/onboarding-short.png`, fullPage: true });
  await start.click();
  await expect(page.getByText('دعاء الترحيب')).toBeVisible();
});
