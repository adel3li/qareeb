import { expect, test } from '@playwright/test';
import { at, liveThrough, onboarded, seed, showAll } from './helpers';

const welcomeDone = { 'qareeb:welcome:v1': { doneOn: '2026-11-20' } };

test('at 01:30 the day is the local day, not the UTC one @tz', async ({ page }) => {
  await seed(page, { ...onboarded, ...welcomeDone });
  await at(page, 2026, 11, 23, 1, 30);
  await page.goto('/#/today');
  await liveThrough(page);
  const items = await page.evaluate(() => JSON.parse(localStorage.getItem('qareeb:completions:v1')!).state.items);
  expect(items[0].date).toBe('2026-11-23');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('الاثنين');
});

test('midnight with the app open: the dua changes without a reload', async ({ page }) => {
  await seed(page, { ...onboarded, ...welcomeDone });
  await at(page, 2026, 11, 23, 23, 59);
  await page.goto('/#/today');
  const title = page.getByRole('article').getByRole('heading').first();
  const before = await title.textContent();
  await page.clock.runFor(2 * 60_000);
  await expect(title).not.toHaveText(before ?? '');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('الثلاثاء');
});

test('closing the flow early records nothing; unsaved writing is confirmed and kept as a draft', async ({ page }) => {
  await seed(page, { ...onboarded, ...welcomeDone });
  await at(page, 2026, 11, 23, 10);
  await page.goto('/#/today');
  await page.getByRole('button', { name: /عِش الدعاء/ }).click();
  const dialog = page.getByRole('dialog', { name: 'عِش الدعاء' });
  // «التالي» waits for the text; «أظهر النص كاملًا» shows it all and it stays.
  await expect(dialog.getByRole('button', { name: 'التالي', exact: true })).toHaveAttribute('aria-disabled', 'true');
  await showAll(page);
  await page.clock.runFor(30_000);
  await expect(dialog.getByRole('button', { name: 'التالي', exact: true })).not.toHaveAttribute('aria-disabled', 'true');
  for (let i = 0; i < 5; i++) {
    if (i > 0) await showAll(page);
    await dialog.getByRole('button', { name: i === 4 ? 'يا ربّ' : 'التالي', exact: true }).click();
  }
  await dialog.getByRole('button', { name: 'متابعة' }).click();
  await dialog.getByRole('textbox').fill('مسودة للاختبار');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog', { name: 'أتغلق قبل الإتمام؟' })).toBeVisible();
  await page.getByRole('button', { name: 'أغلق', exact: true }).click();
  await expect(dialog).toBeHidden();
  const stored = await page.evaluate(() => ({
    completions: localStorage.getItem('qareeb:completions:v1'),
    drafts: JSON.parse(localStorage.getItem('qareeb:drafts:v1') ?? 'null'),
  }));
  expect(stored.completions).toBeNull();
  expect(Object.values(stored.drafts.state.byDua)[0]).toMatchObject({ notebookText: 'مسودة للاختبار' });
});

test('every tab has an address that survives a reload, and a dua link opens its page', async ({ page }) => {
  await seed(page, onboarded);
  await at(page, 2026, 11, 23, 10);
  for (const [hash, heading] of [['#/library', 'المكتبة'], ['#/notebook', 'الدفتر'], ['#/calendar', 'المداومة'], ['#/settings', 'الإعدادات']]) {
    await page.goto(`/${hash}`);
    await page.reload();
    await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible();
  }
  await page.goto('/#/dua/dua_0003');
  await expect(page.getByRole('heading', { name: 'دعاء علّمه النبي ﷺ أبا بكر' })).toBeVisible();
  await page.goto('/#/dua/dua_9999');
  await expect(page.getByRole('heading', { name: 'لم نجد هذا الدعاء' })).toBeVisible();
});
