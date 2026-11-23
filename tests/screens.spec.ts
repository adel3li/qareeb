import { expect, test } from '@playwright/test';
import { at, onboarded, seed } from './helpers';

test.beforeEach(async ({ page }) => {
  await seed(page, {
    ...onboarded,
    'qareeb:welcome:v1': { doneOn: '2026-11-14' },
    'qareeb:completions:v1': {
      items: [
        { date: '2026-11-18', duaId: 'dua_0003', completedAt: '2026-11-18T18:00:00.000Z', intention: 'after_prayer' },
        { date: '2026-11-20', duaId: 'dua_0002', completedAt: '2026-11-20T18:00:00.000Z' },
      ],
    },
    'qareeb:favorites:v1': { ids: ['dua_0002'] },
  });
  await at(page, 2026, 11, 23, 10);
});

test('library: lived duas, favourites, and search that ignores marks', async ({ page }) => {
  await page.goto('/#/library');
  await expect(page.getByRole('link', { name: /دعاء يونس/ })).toBeVisible();
  await expect(page.getByRole('link', { name: /دعاء أبي بكر/ })).toBeVisible();
  await page.getByRole('searchbox').fill('يُونُس');
  await expect(page.getByRole('link', { name: /دعاء يونس/ })).toBeVisible();
  await expect(page.getByRole('link', { name: /دعاء أبي بكر/ })).toBeHidden();
  await page.getByRole('searchbox').fill('كلمة لا توجد');
  await expect(page.getByRole('heading', { name: 'لا نتائج' })).toBeVisible();
  await page.getByRole('tab', { name: 'المفضلة' }).click();
  await page.getByRole('searchbox').fill('');
  await expect(page.getByRole('link', { name: /دعاء يونس/ })).toBeVisible();
  await expect(page.getByRole('link', { name: /دعاء أبي بكر/ })).toBeHidden();
});

test('notebook: write now, edit, delete with confirmation; دعواتي answered with how', async ({ page }) => {
  await page.goto('/#/notebook');
  await expect(page.getByRole('heading', { name: 'لم تكتب شيئًا بعد' })).toBeVisible();
  await page.getByRole('button', { name: 'اكتب الآن' }).click();
  await page.getByRole('dialog').getByRole('textbox').fill('سطر أول');
  await page.getByRole('dialog').getByRole('button', { name: 'احفظ' }).click();
  await expect(page.getByText('سطر أول')).toBeVisible();
  await page.getByRole('button', { name: 'تعديل ما كتبته' }).click();
  await page.getByRole('dialog').getByRole('textbox').fill('سطر معدّل');
  await page.getByRole('dialog').getByRole('button', { name: 'احفظ' }).click();
  await expect(page.getByText('سطر معدّل')).toBeVisible();
  await page.getByRole('button', { name: 'حذف ما كتبته' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'احذف' }).click();
  await expect(page.getByText('سطر معدّل')).toBeHidden();

  await page.getByRole('tab', { name: 'دعواتي' }).click();
  await expect(page).toHaveURL(/#\/notebook\/my-duas$/);
  await expect(page.getByRole('heading', { name: 'اكتب ما تحتاجه. لن يراه أحد غيرك.' })).toBeVisible();
  await page.getByRole('button', { name: 'أضف حاجة' }).click();
  await page.getByLabel('حاجتك').fill('حاجة للاختبار');
  await page.getByRole('dialog').getByRole('button', { name: 'احفظ' }).click();
  await page.getByRole('switch', { name: 'استُجيبت؟' }).click();
  await page.getByRole('dialog').getByRole('textbox').fill('هكذا استُجيبت');
  await page.getByRole('dialog').getByRole('button', { name: 'احفظ' }).click();
  await expect(page.getByRole('tab', { name: 'استُجيبت', selected: true })).toBeVisible();
  await expect(page.getByText('هكذا استُجيبت')).toBeVisible();
  // No counts anywhere on the screen.
  await expect(page.getByRole('main')).not.toContainText(/[٠-٩]+ (حاجة|دعوة)/);
});

test('calendar: real Hijri months, a lived day, an empty day', async ({ page }) => {
  await page.goto('/#/calendar');
  await expect(page.getByRole('heading', { name: 'جمادى الآخرة ١٤٤٨ هـ', exact: true })).toBeVisible();
  await page.getByRole('button', { name: /الجمعة، ١٠، عشتَ فيه دعاءً/ }).click();
  await expect(page.getByRole('heading', { name: 'دعاء يونس' })).toBeVisible();
  await page.getByRole('button', { name: /^الأحد، ٥$/ }).click();
  await expect(page.getByText('لا بأس، فاليوم التالي ينتظرك')).toBeVisible();
  await page.getByRole('button', { name: 'الشهر السابق' }).click();
  await expect(page.getByRole('heading', { name: 'جمادى الأولى ١٤٤٨ هـ', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'الشهر التالي' }).click();
  await expect(page.getByRole('heading', { name: 'جمادى الآخرة ١٤٤٨ هـ', exact: true })).toBeVisible();
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'أضف تذكيرًا إلى تقويمك' }).click();
  await page.getByRole('button', { name: 'نزّل ملف التقويم' }).click();
  expect((await download).suggestedFilename()).toBe('qareeb-reminder.ics');
});

test('settings: theme on <html> only, text size corrected on blur, import errors change nothing, erase', async ({ page }) => {
  await page.clock.resume();
  await page.goto('/#/settings');
  await page.getByRole('radio', { name: 'داكن' }).click();
  expect(await page.evaluate(() => document.documentElement.dataset.theme)).toBe('dark');
  expect(await page.locator('[data-theme]').count()).toBe(1);
  const size = page.getByLabel('حجم النص بالبكسل');
  await size.fill('١');
  expect(await page.evaluate(() => document.documentElement.style.fontSize)).toBe('16px');
  await size.fill('١٨');
  expect(await page.evaluate(() => document.documentElement.style.fontSize)).toBe('16px');
  await size.blur();
  expect(await page.evaluate(() => document.documentElement.style.fontSize)).toBe('18px');

  await page.locator('input[type=file]').setInputFiles({ name: 'bad.json', mimeType: 'application/json', buffer: Buffer.from('{ broken') });
  await expect(page.getByRole('alert')).toContainText('لم يتغير شيء');
  await page.keyboard.press('Escape');

  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'صدّر نسخة احتياطية' }).click();
  const file = await (await download).path();
  await page.getByRole('button', { name: 'امسح كل بياناتي' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'امسح', exact: true }).click();
  expect(await page.evaluate(() => Object.keys(localStorage).filter((k) => k.startsWith('qareeb:')))).toEqual([]);
  await expect(page.getByRole('heading', { name: 'لكلّ دعاءٍ قصة' })).toBeVisible();
  expect(file).toBeTruthy();
});

test('import: a valid backup shows its summary and replaces data after confirmation', async ({ page }) => {
  await page.goto('/#/settings');
  const backup = {
    app: 'qareeb', backupVersion: 1, exportedAt: '2026-11-22T10:00:00.000Z',
    data: {
      settings: { theme: 'light', fontScale: 16, showMyDuasInFlow: true }, onboardingCompletedAt: '2026-11-01T10:00:00.000Z', welcomeDoneOn: '2026-11-02',
      completions: [{ date: '2026-11-21', duaId: 'dua_0003', completedAt: '2026-11-21T10:00:00.000Z' }],
      notebook: [], myDuas: [], favorites: ['dua_0001'],
    },
  };
  await page.locator('input[type=file]').setInputFiles({ name: 'b.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(backup)) });
  const dialog = page.getByRole('dialog', { name: 'استيراد نسخة احتياطية' });
  await expect(dialog).toContainText('١ يوم عشتَ فيها دعاءً');
  await dialog.getByRole('button', { name: 'استبدل بياناتي' }).click();
  const favs = await page.evaluate(() => JSON.parse(localStorage.getItem('qareeb:favorites:v1')!).state.ids);
  expect(favs).toEqual(['dua_0001']);
});

test('dialogs cover the screen and trap focus, after scrolling', async ({ page }) => {
  await page.goto('/#/today');
  await page.mouse.wheel(0, 600);
  await page.getByRole('button', { name: 'مشاركة الدعاء' }).first().click();
  const dialog = page.getByRole('dialog', { name: 'مشاركة الدعاء' });
  await expect(dialog.getByRole('img', { name: 'معاينة الصورة' })).toBeVisible();
  const box = await dialog.boundingBox();
  expect(box && box.y + box.height).toBeLessThanOrEqual(845);
  expect(box && box.y).toBeGreaterThanOrEqual(0);
  await expect(dialog.getByRole('img', { name: 'معاينة الصورة' })).toBeVisible();
  for (let i = 0; i < 12; i++) await page.keyboard.press('Tab');
  expect(await dialog.evaluate((d) => d.contains(document.activeElement))).toBe(true);
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
});
