import { expect, test } from '@playwright/test';
import { at, liveThrough, localInstant, storedKeys } from './helpers';

test('first run: onboarding, the welcome dua, completing it, then the daily dua tomorrow @tz', async ({ page }) => {
  await at(page, 2026, 11, 23, 10);
  await page.goto('/');
  // Nothing is written before the user does something.
  await expect(page.getByRole('heading', { name: 'لكلّ دعاءٍ قصة' })).toBeVisible();
  expect(await storedKeys(page)).toEqual([]);

  // Four slides, back and next.
  await page.getByRole('button', { name: 'التالي' }).click();
  await expect(page.getByRole('heading', { name: 'من الترديد إلى الحضور' })).toBeVisible();
  await page.getByRole('button', { name: 'رجوع' }).click();
  await expect(page.getByRole('heading', { name: 'لكلّ دعاءٍ قصة' })).toBeVisible();
  for (let i = 0; i < 3; i++) await page.getByRole('button', { name: 'التالي' }).click();
  await page.getByRole('button', { name: 'ابدأ بدعاء اليوم' }).click();

  // The welcome dua, until it is lived.
  await expect(page.getByText('دعاء الترحيب')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'دعاء الهداية في الفاتحة' })).toBeVisible();
  expect(await storedKeys(page)).toEqual(['qareeb:onboarding:v1']);

  await liveThrough(page, { intention: 'في السجود', journal: 'سطر للاختبار' });
  await expect(page.getByText('دعوتَ الله اليوم بهذا الدعاء')).toBeVisible();
  // Still the welcome dua, shown as done, for the rest of the day.
  await expect(page.getByRole('heading', { name: 'دعاء الهداية في الفاتحة' })).toBeVisible();

  const completions = await page.evaluate(() => JSON.parse(localStorage.getItem('qareeb:completions:v1')!).state.items);
  expect(completions).toEqual([expect.objectContaining({ date: '2026-11-23', duaId: 'dua_0001', intention: 'sujood' })]);

  // Tomorrow: the rotation, not the welcome dua.
  await page.clock.setSystemTime(localInstant(2026, 11, 24, 10));
  await page.reload();
  await expect(page.getByText('دعاء الترحيب')).toBeHidden();
  await expect(page.getByRole('button', { name: /عِش الدعاء/ })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'دعاء الهداية في الفاتحة' })).toBeHidden();
});

test('skip from the first slide goes straight to Today', async ({ page }) => {
  await at(page, 2026, 11, 23, 10);
  await page.goto('/');
  await page.getByRole('button', { name: 'تخطَّ' }).click();
  await expect(page.getByText('دعاء الترحيب')).toBeVisible();
});
