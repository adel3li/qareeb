import { expect, test } from '@playwright/test';
import { liveThrough, skipOnboarding, stored } from './helpers';

test.beforeEach(async ({ page }) => {
  await page.clock.install({ time: new Date(2026, 10, 23, 9, 0, 0) });
  await skipOnboarding(page, { 'qareeb:welcome:v1': { doneOn: '2026-11-20' } });
});

test('notebook: write now, edit, delete with confirmation', async ({ page }) => {
  await page.goto('./#/notebook');
  await expect(page.getByRole('heading', { name: 'دفترك ينتظر' })).toBeVisible();
  await page.getByRole('button', { name: 'اكتب الآن' }).click();
  const sheet = page.getByRole('dialog', { name: 'اكتب ما وجدته' });
  await sheet.getByRole('textbox').fill('سطر أول');
  await expect(sheet.getByText('ما تكتبه لا يغادر جهازك.')).toBeVisible();
  await sheet.getByRole('button', { name: 'احفظ' }).click();
  await expect(page.getByText('سطر أول')).toBeVisible();
  await expect(page.getByRole('heading', { name: /١٣ جمادى الآخرة ١٤٤٨/ })).toBeVisible();

  await page.getByRole('button', { name: 'تعديل ما كتبتَه' }).click();
  await page.getByRole('dialog').getByRole('textbox').fill('سطر معدّل');
  await page.getByRole('dialog').getByRole('button', { name: 'احفظ' }).click();
  await expect(page.getByText('سطر معدّل')).toBeVisible();

  await page.getByRole('button', { name: 'حذف ما كتبتَه' }).click();
  const confirm = page.getByRole('alertdialog', { name: 'تحذف ما كتبتَه؟' });
  await confirm.getByRole('button', { name: 'تراجع' }).click();
  await expect(page.getByText('سطر معدّل')).toBeVisible();
  await page.getByRole('button', { name: 'حذف ما كتبتَه' }).click();
  await page.getByRole('alertdialog').getByRole('button', { name: 'احذف' }).click();
  await expect(page.getByText('سطر معدّل')).toHaveCount(0);
});

test('دعواتي: add a need, mark it answered with how, no counts', async ({ page }) => {
  await page.goto('./#/notebook');
  await page.getByRole('tab', { name: 'دعواتي' }).click();
  await expect(page.getByText('اكتب ما تحتاجه. لن يراه أحد غيرك.')).toBeVisible();
  await page.getByRole('button', { name: 'أضف حاجة' }).first().click();
  await page.getByRole('dialog').getByLabel('الحاجة').fill('حاجة للتجربة');
  await page.getByRole('dialog').getByRole('button', { name: 'احفظ' }).click();
  await expect(page.getByText('حاجة للتجربة')).toBeVisible();

  await page.getByRole('switch', { name: 'استُجيبت؟' }).click();
  const how = page.getByRole('dialog', { name: 'كيف استجاب الله؟' });
  await how.getByRole('textbox').fill('هكذا استُجيبت');
  await how.getByRole('button', { name: 'احفظ' }).click();
  await expect(page.getByText('حاجة للتجربة')).toHaveCount(0);
  await page.getByRole('radio', { name: 'استُجيبت' }).click();
  await expect(page.getByText('هكذا استُجيبت')).toBeVisible();
  await expect(page.getByRole('radio', { name: 'استُجيبت' })).toHaveText('استُجيبت');
  const needs = await stored<{ items: { answeredAt?: string }[] }>(page, 'qareeb:my-duas:v1');
  expect(needs?.items[0].answeredAt).toBe('2026-11-23');
});

test('library: lived duas, favourites and Arabic-normalised search; the dua page', async ({ page }) => {
  await page.goto('./#/today');
  await page.getByRole('button', { name: /أضف الدعاء إلى المفضلة/ }).click();
  await page.getByRole('button', { name: /عِش الدعاء/ }).click();
  await liveThrough(page);
  await page.getByRole('link', { name: 'المكتبة' }).click();
  const rows = page.getByRole('tabpanel').getByRole('link');
  await expect(rows).toHaveCount(1);
  const title = (await rows.first().textContent()) ?? '';
  await page.getByRole('searchbox').fill('لا يوجد هذا');
  await expect(page.getByText('لا نتائج')).toBeVisible();
  await page.getByRole('searchbox').fill('دعاء');
  await expect(rows).toHaveCount(1);
  await page.getByRole('tab', { name: 'المفضلة' }).click();
  await expect(page.getByRole('tabpanel').getByRole('link')).toHaveCount(1);
  await page.getByRole('tabpanel').getByRole('link').first().click();
  await expect(page).toHaveURL(/#\/dua\/dua_\d{4}$/);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  expect(title.length).toBeGreaterThan(0);
  await page.getByRole('button', { name: 'رجوع' }).click();
  await expect(page).toHaveURL(/#\/library$/);
});

test('calendar: lived day marked, real Hijri months, day detail, .ics reminder', async ({ page }) => {
  await page.goto('./#/today');
  await page.getByRole('button', { name: /عِش الدعاء/ }).click();
  await liveThrough(page, { intention: 'قبل النوم' });
  await page.getByRole('link', { name: 'المداومة' }).click();
  await expect(page.getByRole('heading', { name: 'جمادى الآخرة ١٤٤٨ هـ', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: /عشتَ فيه دعاءً/ })).toHaveCount(1);
  await expect(page.getByText('النية: قبل النوم')).toBeVisible();
  await expect(page.getByRole('button', { name: 'الشهر التالي' })).toBeDisabled();
  await page.getByRole('button', { name: 'الشهر السابق' }).click();
  await expect(page.getByRole('heading', { name: 'جمادى الأولى ١٤٤٨ هـ', exact: true })).toBeVisible();
  for (let i = 0; i < 5; i++) await page.getByRole('button', { name: 'الشهر السابق' }).click();
  await expect(page.getByRole('heading', { name: 'ذو الحجة ١٤٤٧ هـ', exact: true })).toBeVisible();
  await page.locator('button[data-day]').first().click();
  await expect(page.getByText('لم تعش دعاءً في هذا اليوم. لا بأس، فاليوم التالي ينتظرك.')).toBeVisible();

  await page.getByRole('button', { name: 'أضف تذكيرًا إلى تقويمك' }).click();
  const download = page.waitForEvent('download');
  await page.getByRole('dialog').getByRole('button', { name: 'نزّل ملف التقويم' }).click();
  const file = await download;
  expect(file.suggestedFilename()).toBe('qareeb-2100.ics');
  const text = await (await file.createReadStream()).toArray().then((c) => Buffer.concat(c).toString('utf8'));
  expect(text).toContain('RRULE:FREQ=DAILY');
  expect(text).toContain('DTSTART:20261123T210000');
});

test('settings: theme on <html> only, text size corrected on blur, bad import changes nothing, erase', async ({ page }) => {
  await page.goto('./#/settings');
  await page.getByRole('radio', { name: 'داكن' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  expect(await page.locator('body[data-theme], #root [data-theme]').count()).toBe(0);
  await page.getByRole('radio', { name: 'تلقائي' }).click();
  await expect(page.locator('html')).not.toHaveAttribute('data-theme');

  const size = page.getByLabel('حجم النص بالبكسل');
  await size.fill('١');
  await expect(size).toHaveValue('١');
  await size.fill('١٨');
  await size.blur();
  await expect(page.locator('html')).toHaveCSS('font-size', '18px');
  await size.fill('99');
  await size.blur();
  await expect(size).toHaveValue('٢٤');

  await page.locator('input[type=file]').setInputFiles({ name: 'x.json', mimeType: 'application/json', buffer: Buffer.from('{"app":"other"}') });
  await expect(page.getByRole('dialog', { name: 'لم نستطع قراءة الملف' })).toBeVisible();
  await page.getByRole('dialog').getByRole('button', { name: 'إغلاق' }).first().click();

  await page.getByRole('button', { name: 'امسح كل بياناتي' }).click();
  await page.getByRole('alertdialog').getByRole('button', { name: 'امسح' }).click();
  const keys = await page.evaluate(() => Object.keys(localStorage).filter((k) => k.startsWith('qareeb:')));
  expect(keys).toEqual([]);
  await expect(page.getByRole('heading', { name: 'لكلّ دعاءٍ قصة' })).toBeVisible();
});

test('backup: export then import restores the same data after a confirmed summary', async ({ page }) => {
  await page.goto('./#/today');
  await page.getByRole('button', { name: /عِش الدعاء/ }).click();
  await liveThrough(page, { note: 'سطر', need: 'حاجة' });
  await page.goto('./#/settings');
  const dl = page.waitForEvent('download');
  await page.getByRole('button', { name: 'صدّر نسخة احتياطية' }).click();
  const file = await dl;
  const body = await (await file.createReadStream()).toArray().then((c) => Buffer.concat(c));
  const before = await page.evaluate(() => Object.fromEntries(Object.keys(localStorage).filter((k) => k.startsWith('qareeb:') && k !== 'qareeb:drafts:v1').map((k) => [k, localStorage.getItem(k)])));
  await page.evaluate(() => localStorage.removeItem('qareeb:notebook:v1'));
  await page.locator('input[type=file]').setInputFiles({ name: 'b.json', mimeType: 'application/json', buffer: body });
  const dialog = page.getByRole('dialog', { name: 'استيراد نسخة احتياطية' });
  await expect(dialog.getByText('١ يومًا عشتَ فيها دعاءً')).toBeVisible();
  await expect(dialog.getByText('١ مدخلة في «ما وجدته»')).toBeVisible();
  await dialog.getByRole('button', { name: 'استبدل بياناتي' }).click();
  const after = await page.evaluate(() => Object.fromEntries(Object.keys(localStorage).filter((k) => k.startsWith('qareeb:') && k !== 'qareeb:drafts:v1').map((k) => [k, localStorage.getItem(k)])));
  for (const key of Object.keys(before)) expect(JSON.parse(after[key]!)).toEqual(JSON.parse(before[key]!));
});

test('share sheet: an image that keeps the whole dua, and the copy text', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('./#/today');
  await page.getByRole('button', { name: 'مشاركة الدعاء' }).click();
  const sheet = page.getByRole('dialog', { name: 'مشاركة الدعاء' });
  await expect(sheet.getByRole('img', { name: 'صورة الدعاء للمشاركة' })).toBeVisible({ timeout: 10_000 });
  await sheet.getByRole('radio', { name: 'قصة' }).click();
  await expect(sheet.getByRole('img', { name: 'صورة الدعاء للمشاركة' })).toBeVisible();
  await sheet.getByRole('button', { name: 'انسخ النص' }).click();
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  expect(copied).toMatch(/^«.+»\n﴿/);
  expect(copied).toContain('— قريب');
  expect(copied).toContain('#/dua/dua_');
  await page.keyboard.press('Escape');
  await expect(sheet).toHaveCount(0);
});

test('error-free and nothing beyond the screen width on every route', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  for (const hash of ['#/today', '#/library', '#/notebook', '#/calendar', '#/settings', '#/dua/dua_0003', '#/dua/dua_9999']) {
    await page.goto(`./${hash}`);
    await expect(page.getByText('يُحمَّل…')).toHaveCount(0);
    await page.waitForTimeout(200);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, hash).toBeLessThanOrEqual(0);
  }
  expect(errors).toEqual([]);
});
