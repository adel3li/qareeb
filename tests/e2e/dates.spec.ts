import { expect, test } from '@playwright/test';
import { skipOnboarding } from './helpers';

test.describe('Riyadh at 01:30', () => {
  test.use({ timezoneId: 'Asia/Riyadh' });
  test('the day is the local day, not UTC', async ({ page }) => {
    // 01:30 in Riyadh on 24 November is still 23 November in UTC.
    await page.clock.install({ time: new Date('2026-11-23T22:30:00.000Z') });
    await skipOnboarding(page, { 'qareeb:welcome:v1': { doneOn: '2026-11-20' } });
    await page.goto('./#/today');
    const day = await page.evaluate(() => {
      const d = new Date();
      return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
    });
    expect(day).toBe('2026-11-24');
    await page.getByRole('button', { name: /عِش الدعاء/ }).click();
    const dialog = page.getByRole('dialog', { name: 'عِش الدعاء' });
    for (let i = 0; i < 5; i++) {
      const showAll = dialog.getByRole('button', { name: 'أظهر النص كاملًا' });
      if (await showAll.isVisible()) await showAll.click();
      await dialog.getByRole('button', { name: i === 4 ? 'يا ربّ' : 'التالي' }).click();
    }
    await dialog.getByRole('button', { name: 'تخطَّ' }).click();
    await dialog.getByRole('button', { name: 'إتمام' }).click();
    await dialog.getByRole('button', { name: 'لا الآن' }).click();
    await page.clock.runFor(2500);
    const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('qareeb:completions:v1')!).state.items[0].date);
    expect(stored).toBe('2026-11-24');
  });
});

test('Today rolls over at midnight without a reload', async ({ page }) => {
  await page.clock.install({ time: new Date(2026, 10, 23, 23, 59, 0) });
  await skipOnboarding(page, { 'qareeb:welcome:v1': { doneOn: '2026-11-20' } });
  await page.goto('./#/today');
  const title = page.locator('article h2').first();
  await expect(title).toBeVisible();
  const before = await title.textContent();
  const dateLine = page.locator('header p').nth(1);
  const dateBefore = await dateLine.textContent();
  await page.clock.runFor(2 * 60_000);
  await expect(dateLine).not.toHaveText(dateBefore!);
  const after = await title.textContent();
  expect(after).not.toBe(before);
});
