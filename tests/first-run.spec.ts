import { expect, test } from '@playwright/test';
import { KEYS, liveThrough, stored } from './helpers';

test('first run: onboarding, the welcome dua, completion, then the daily dua tomorrow', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-11-23T09:00:00+03:00'));
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'لكلّ دعاءٍ قصة' })).toBeVisible();
  // Nothing is written on first run.
  expect(await page.evaluate(() => Object.keys(localStorage))).toEqual([]);

  for (let i = 0; i < 3; i++) await page.getByRole('button', { name: 'التالي' }).click();
  await page.getByRole('button', { name: 'ابدأ بدعاء اليوم' }).click();

  await expect(page.getByText('دعاء الترحيب')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'دعاء الهداية في الفاتحة' })).toBeVisible();
  expect(await page.evaluate(() => Object.keys(localStorage))).toEqual(['qareeb:onboarding:v1']);

  await liveThrough(page, { note: 'سطر تجريبي', intention: 'في السجود' });
  await expect(page.getByText('دعوتَ الله اليوم بهذا الدعاء')).toBeVisible();
  // The welcome dua stays, done, for the rest of the day.
  await expect(page.getByText('دعاء الترحيب')).toBeVisible();

  const completions = await stored<{ date: string; duaId: string; intention?: string }[]>(page, 'qareeb:completions:v1');
  expect(completions).toEqual([expect.objectContaining({ date: '2026-11-23', duaId: 'dua_0001', intention: 'sujood' })]);
  expect(await stored(page, 'qareeb:welcome:v1')).toEqual({ doneOn: '2026-11-23' });
  const notes = await stored<{ text: string; duaId: string; date: string }[]>(page, 'qareeb:notebook:v1');
  expect(notes).toEqual([expect.objectContaining({ text: 'سطر تجريبي', duaId: 'dua_0001', date: '2026-11-23' })]);
  for (const k of await page.evaluate(() => Object.keys(localStorage))) expect(KEYS).toContain(k);

  // Tomorrow: the rotation, not the welcome dua, and not done.
  await page.clock.setFixedTime(new Date('2026-11-24T09:00:00+03:00'));
  await page.reload();
  await expect(page.getByText('دعاء الترحيب')).toBeHidden();
  await expect(page.getByRole('button', { name: /عِش الدعاء/ })).toBeVisible();
  await expect(page.getByText('دعوتَ الله اليوم بهذا الدعاء')).toBeHidden();
});

test('a completion at 01:30 in Riyadh is recorded on the local day, not the UTC day', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-11-23T01:30:00+03:00'));
  await page.goto('/');
  await page.getByRole('button', { name: 'تخطَّ' }).click();
  await liveThrough(page);
  const completions = await stored<{ date: string }[]>(page, 'qareeb:completions:v1');
  expect(completions?.[0].date).toBe('2026-11-23');
});
