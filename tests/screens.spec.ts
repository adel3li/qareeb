import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { ONBOARDED, seed, stored } from './helpers';

const SAMPLE = {
  ...ONBOARDED,
  'qareeb:welcome:v1': { doneOn: '2026-11-20' },
  'qareeb:completions:v1': [{ date: '2026-11-22', duaId: 'dua_0002', completedAt: '2026-11-22T06:00:00.000Z', intention: 'now' }],
  'qareeb:notebook:v1': [{ id: 'n1', date: '2026-11-22', duaId: 'dua_0002', text: 'سطر تجريبي', createdAt: '2026-11-22T06:00:00.000Z', updatedAt: '2026-11-22T06:00:00.000Z' }],
  'qareeb:favorites:v1': ['dua_0003'],
};

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-11-23T12:00:00+03:00'));
});

test('every tab has its address, kept on reload; unknown addresses go to Today', async ({ page }) => {
  await seed(page, SAMPLE);
  for (const [hash, heading] of [['#/library', 'المكتبة'], ['#/notebook', 'الدفتر'], ['#/calendar', 'المداومة'], ['#/settings', 'الإعدادات']]) {
    await page.goto(`/${hash}`);
    await page.reload();
    await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible();
  }
  await page.goto('/#/dua/dua_0003');
  await expect(page.getByRole('heading', { level: 1, name: 'دعاء أبي بكر' })).toBeVisible();
  await page.goto('/#/nowhere');
  await expect(page).toHaveURL(/#\/today$/);
});

test('library search ignores vowel marks and letter forms', async ({ page }) => {
  await seed(page, { ...SAMPLE, 'qareeb:completions:v1': [...SAMPLE['qareeb:completions:v1'], { date: '2026-11-21', duaId: 'dua_0003', completedAt: '2026-11-21T06:00:00.000Z' }] });
  await page.goto('/#/library');
  await page.reload();
  await page.getByRole('searchbox').fill('يُونُس');
  await expect(page.getByRole('link', { name: /دعاء يونس/ })).toBeVisible();
  await expect(page.getByRole('link', { name: /دعاء أبي بكر/ })).toBeHidden();
  await page.getByRole('searchbox').fill('ابي بكر');
  await expect(page.getByRole('link', { name: /دعاء أبي بكر/ })).toBeVisible();
});

test('a dialog covers the screen after scrolling, traps focus, closes with Escape and returns focus', async ({ page }) => {
  await seed(page, SAMPLE);
  await page.goto('/#/settings');
  await page.reload();
  await page.mouse.wheel(0, 2000);
  const erase = page.getByRole('button', { name: 'امسح كل بياناتي' });
  await erase.click();
  const dialog = page.getByRole('alertdialog');
  await expect(dialog).toBeVisible();
  const vp = page.viewportSize()!;
  // Measured once the sheet has risen into place.
  await expect.poll(async () => { const b = (await dialog.boundingBox())!; return b.y >= 0 && b.y + b.height <= vp.height + 1; }).toBe(true);
  for (let i = 0; i < 6; i++) {
    await page.keyboard.press('Tab');
    expect(await dialog.evaluate((d) => d.contains(document.activeElement))).toBe(true);
  }
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(erase).toBeFocused();
});

test('notebook: delete asks first; دعواتي: answered with how', async ({ page }) => {
  await seed(page, SAMPLE);
  await page.goto('/#/notebook');
  await page.reload();
  await page.getByRole('button', { name: 'حذف ما كتبته' }).click();
  await page.getByRole('button', { name: 'تراجع' }).click();
  await expect(page.getByText('سطر تجريبي')).toBeVisible();
  await page.getByRole('button', { name: 'حذف ما كتبته' }).click();
  await page.getByRole('button', { name: 'احذف' }).click();
  await expect(page.getByText('سطر تجريبي')).toBeHidden();

  await page.getByRole('tab', { name: 'دعواتي' }).click();
  await page.getByRole('button', { name: 'أضف حاجة' }).click();
  await page.getByLabel('حاجتك').fill('حاجة تجريبية');
  await page.getByRole('button', { name: 'احفظ' }).click();
  await page.getByRole('switch', { name: 'استُجيبت؟' }).click();
  await page.getByRole('textbox').fill('كيف تجريبي');
  await page.getByRole('button', { name: 'احفظ' }).click();
  await page.getByRole('radio', { name: 'استُجيبت' }).click();
  await expect(page.getByText('كيف تجريبي')).toBeVisible();
  const needs = await stored<{ answeredAt?: string; answerNote?: string }[]>(page, 'qareeb:my-duas:v1');
  expect(needs?.[0]).toMatchObject({ answerNote: 'كيف تجريبي' });
  expect(needs?.[0].answeredAt).toBeTruthy();
  // No counts on answered prayers.
  await expect(page.getByRole('radio', { name: /\d|[٠-٩]/ })).toHaveCount(0);
});

test('calendar moves by real Hijri months and never past the current one', async ({ page }) => {
  await seed(page, SAMPLE);
  await page.goto('/#/calendar');
  await page.reload();
  const month = page.locator('#month-title');
  await expect(month).toHaveText('جمادى الآخرة ١٤٤٨ هـ');
  await expect(page.getByRole('button', { name: 'الشهر التالي' })).toBeDisabled();
  for (const name of ['جمادى الأولى', 'ربيع الآخر', 'ربيع الأول', 'صفر', 'محرم', 'ذو الحجة']) {
    await page.getByRole('button', { name: 'الشهر السابق' }).click();
    await expect(month).toContainText(name);
  }
});

test('settings: theme on <html> only; text size corrected on blur', async ({ page }) => {
  await seed(page, SAMPLE);
  await page.goto('/#/settings');
  await page.reload();
  await page.getByRole('radio', { name: 'داكن' }).click();
  expect(await page.evaluate(() => document.documentElement.dataset.theme)).toBe('dark');
  expect(await page.locator('[data-theme]').count()).toBe(1);
  const field = page.getByLabel('حجم النص بالبكسل');
  await field.fill('١');
  expect(await page.evaluate(() => document.documentElement.style.fontSize)).toBe('');
  await field.fill('١٨');
  await field.blur();
  expect(await page.evaluate(() => document.documentElement.style.fontSize)).toBe('18px');
});

test('import: a damaged file changes nothing; a backup is summarised before replacing', async ({ page }) => {
  await seed(page, SAMPLE);
  await page.goto('/#/settings');
  await page.reload();
  const before = await page.evaluate(() => JSON.stringify(localStorage));
  await page.locator('input[type=file]').setInputFiles({ name: 'x.json', mimeType: 'application/json', buffer: Buffer.from('{"app":"qareeb"') });
  await expect(page.getByRole('heading', { name: 'تعذّر الاستيراد' })).toBeVisible();
  expect(await page.evaluate(() => JSON.stringify(localStorage))).toBe(before);
  await page.keyboard.press('Escape');

  const backup = { app: 'qareeb', backupVersion: 1, exportedAt: '2026-11-22T10:00:00.000Z', data: { settings: { theme: 'light', fontScale: 16, showMyDuasInFlow: false }, completions: [], notebook: [], myDuas: [], favorites: ['dua_0002'] } };
  await page.locator('input[type=file]').setInputFiles({ name: 'b.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(backup)) });
  await expect(page.getByText('في هذه النسخة:')).toBeVisible();
  expect(await page.evaluate(() => JSON.stringify(localStorage))).toBe(before);
  await page.getByRole('button', { name: 'استبدل بياناتي' }).click();
  expect(await stored(page, 'qareeb:favorites:v1')).toEqual(['dua_0002']);
});

test('works offline after the first visit', async ({ page, context }) => {
  await seed(page, SAMPLE);
  await page.reload();
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await expect(page.locator('article h2').first()).toBeVisible();
  await context.setOffline(true);
  await page.reload();
  await expect(page.locator('article h2').first()).toBeVisible();
  await page.goto('/#/calendar');
  await expect(page.getByRole('heading', { level: 1, name: 'المداومة' })).toBeVisible();
});

test('no critical accessibility violations on the main screens', async ({ page }) => {
  await seed(page, SAMPLE);
  for (const hash of ['#/today', '#/library', '#/notebook', '#/calendar', '#/settings', '#/dua/dua_0003']) {
    await page.goto(`/${hash}`);
    await page.reload();
    await page.locator('main h1').first().waitFor();
    const result = await new AxeBuilder({ page }).analyze();
    const serious = result.violations.filter((v) => v.impact === 'critical' || v.impact === 'serious');
    expect(serious.map((v) => `${hash} ${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);
  }
});
