import { expect, test } from '@playwright/test';
import { ONBOARDED, seed, stored } from './helpers';

const DONE_WELCOME = { ...ONBOARDED, 'qareeb:welcome:v1': { doneOn: '2026-11-20' } };

test('the dua of the day changes at midnight while the app stays open', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-11-23T23:59:00+03:00') });
  await seed(page, DONE_WELCOME);
  await page.reload();
  const title = page.locator('article h2').first();
  const before = await title.textContent();
  const dateBefore = await page.locator('main h1').textContent();
  await page.clock.runFor(2 * 60_000);
  await expect(page.locator('main h1')).not.toHaveText(dateBefore!);
  await expect(title).not.toHaveText(before!);
});

test('the same dua for everyone on the same date, and the stored id is kept for past days', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-11-23T12:00:00+03:00'));
  await seed(page, { ...DONE_WELCOME, 'qareeb:completions:v1': [{ date: '2026-11-21', duaId: 'dua_0003', completedAt: '2026-11-21T06:00:00.000Z' }] });
  await page.reload();
  const today = await page.locator('article h2').first().textContent();
  await seed(page, DONE_WELCOME);
  await page.reload();
  await expect(page.locator('article h2').first()).toHaveText(today!);

  await seed(page, { ...DONE_WELCOME, 'qareeb:completions:v1': [{ date: '2026-11-21', duaId: 'dua_0003', completedAt: '2026-11-21T06:00:00.000Z' }] });
  await page.goto('/#/calendar');
  await page.reload();
  await page.getByRole('button', { name: /السبت ١١/ }).click();
  await expect(page.getByText('دعاء أبي بكر')).toBeVisible();
});

test('closing «عِش الدعاء» early records nothing and keeps the writing as a draft', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-11-23T12:00:00+03:00'));
  await seed(page, DONE_WELCOME);
  await page.reload();
  await page.getByRole('button', { name: /عِش الدعاء/ }).click();
  for (let i = 0; i < 5; i++) {
    const showAll = page.getByRole('button', { name: 'أظهر النص كاملًا' });
    if (await showAll.isVisible()) await showAll.click();
    await page.getByRole('button', { name: i === 4 ? 'يا ربّ' : 'التالي', exact: true }).click();
  }
  await page.getByRole('button', { name: 'متابعة' }).click();
  await page.getByRole('textbox').fill('سطر لم يُحفظ');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('heading', { name: 'أتغلق قبل الإتمام؟' })).toBeVisible();
  await page.getByRole('button', { name: 'أغلق', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeHidden();
  expect(await stored(page, 'qareeb:completions:v1')).toBeNull();
  const drafts = await stored<Record<string, { notebookText: string }>>(page, 'qareeb:drafts:v1');
  expect(Object.values(drafts!)[0].notebookText).toBe('سطر لم يُحفظ');
});

test('«أظهر النص كاملًا» shows every sentence and the pacing never hides them again', async ({ page }) => {
  await seed(page, DONE_WELCOME);
  await page.reload();
  await page.getByRole('button', { name: /عِش الدعاء/ }).click();
  const next = page.getByRole('button', { name: /التالي/ });
  await expect(next).toHaveAttribute('aria-disabled', 'true');
  await page.getByRole('button', { name: 'أظهر النص كاملًا' }).click();
  const count = await page.locator('[aria-live="polite"] p').count();
  await page.waitForTimeout(3500);
  await expect(page.locator('[aria-live="polite"] p')).toHaveCount(count);
  await expect(page.getByRole('button', { name: 'التالي', exact: true })).not.toHaveAttribute('aria-disabled', 'true');
});
