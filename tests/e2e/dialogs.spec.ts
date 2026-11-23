import { expect, test } from '@playwright/test';
import { skipOnboarding } from './helpers';

test('every dialog covers the screen, after scrolling too, and returns focus', async ({ page }) => {
  await skipOnboarding(page, { 'qareeb:welcome:v1': { doneOn: '2026-11-20' } });
  await page.goto('./#/settings');
  await page.mouse.wheel(0, 2000);
  const erase = page.getByRole('button', { name: 'امسح كل بياناتي' });
  await erase.click();
  const dialog = page.getByRole('alertdialog');
  const box = await dialog.boundingBox();
  const vp = page.viewportSize()!;
  expect(box!.y).toBeGreaterThanOrEqual(0);
  expect(box!.y + box!.height).toBeLessThanOrEqual(vp.height);
  // Rendered into document.body, not inside the screen.
  expect(await page.evaluate(() => document.querySelector('[role=alertdialog]')!.closest('#root'))).toBeNull();
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  expect(await page.evaluate(() => Boolean(document.activeElement?.closest('[role=alertdialog]')))).toBe(true);
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(erase).toBeFocused();

  await page.goto('./#/today');
  await page.mouse.wheel(0, 1500);
  await page.getByRole('button', { name: 'مشاركة الدعاء' }).click({ force: true });
  const sheet = page.getByRole('dialog', { name: 'مشاركة الدعاء' });
  const s = await sheet.boundingBox();
  expect(s!.y + s!.height).toBeLessThanOrEqual(vp.height + 1);
});
