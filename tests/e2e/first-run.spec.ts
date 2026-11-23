import { expect, test } from '@playwright/test';
import { appKeys, liveThrough, shot, stored } from './helpers';

test('a clean browser: onboarding, the welcome dua, the flow, then tomorrow the daily dua', async ({ page }) => {
  await page.clock.install({ time: new Date(2026, 10, 23, 9, 0, 0) });
  await page.goto('./');

  // Nothing is written on first run.
  await expect(page.getByRole('heading', { name: 'لكلّ دعاءٍ قصة' })).toBeVisible();
  expect(await appKeys(page)).toEqual([]);
  await shot(page, 'onboarding-1');

  // Slides, back, then start.
  await page.getByRole('button', { name: 'التالي' }).click();
  await expect(page.getByRole('heading', { name: 'من الترديد إلى الحضور' })).toBeVisible();
  await page.getByRole('button', { name: 'رجوع' }).click();
  await expect(page.getByRole('heading', { name: 'لكلّ دعاءٍ قصة' })).toBeVisible();
  for (let i = 0; i < 3; i++) await page.getByRole('button', { name: 'التالي' }).click();
  await shot(page, 'onboarding-4');
  await page.getByRole('button', { name: 'ابدأ بدعاء اليوم' }).click();

  // The welcome dua first.
  await expect(page.getByText('دعاء الترحيب')).toBeVisible();
  expect(await appKeys(page)).toEqual(['qareeb:onboarding:v1']);
  await page.getByRole('button', { name: /عِش الدعاء/ }).click();
  await liveThrough(page, { intention: 'في السجود', note: 'سطر كتبته للتجربة', shots: 'flow' });

  // Done today, recorded with the dua's id; the welcome stays for the rest of the day.
  await expect(page.getByText('دعوتَ الله اليوم بهذا الدعاء')).toBeVisible();
  await expect(page.getByText('دعاء الترحيب')).toBeVisible();
  const completions = await stored<{ items: { date: string; duaId: string; intention?: string }[] }>(page, 'qareeb:completions:v1');
  expect(completions?.items).toEqual([expect.objectContaining({ date: '2026-11-23', duaId: 'dua_0001', intention: 'sujood' })]);
  expect(await stored(page, 'qareeb:welcome:v1')).toEqual({ doneOn: '2026-11-23' });
  await shot(page, 'today-done');

  // Tomorrow: the daily rotation, not done yet.
  await page.clock.setFixedTime(new Date(2026, 10, 24, 9, 0, 0));
  await page.reload();
  await expect(page.getByRole('button', { name: /عِش الدعاء/ })).toBeVisible();
  await expect(page.getByText('دعاء الترحيب')).toHaveCount(0);
  await expect(page.getByText('دعوتَ الله اليوم بهذا الدعاء')).toHaveCount(0);
});

test('closing the flow in the middle records nothing and keeps the draft', async ({ page }) => {
  await page.addInitScript(() => {
    if (sessionStorage.getItem('seeded')) return;
    sessionStorage.setItem('seeded', '1');
    localStorage.setItem('qareeb:onboarding:v1', JSON.stringify({ state: { completedAt: '2026-11-20T10:00:00.000Z' }, version: 1 }));
  });
  await page.goto('./#/today');
  await page.getByRole('button', { name: /عِش الدعاء/ }).click();
  const dialog = page.getByRole('dialog', { name: 'عِش الدعاء' });
  await expect(dialog.getByRole('button', { name: 'التالي' })).toHaveAttribute('aria-disabled', 'true');
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  expect(await stored(page, 'qareeb:completions:v1')).toBeNull();
});
