import { expect, type Page } from '@playwright/test';

export const KEYS = ['settings', 'onboarding', 'welcome', 'completions', 'notebook', 'my-duas', 'favorites', 'drafts'].map((k) => `qareeb:${k}:v1`);

export async function seed(page: Page, data: Record<string, unknown>) {
  await page.goto('/');
  await page.evaluate((d) => {
    localStorage.clear();
    for (const [k, v] of Object.entries(d)) localStorage.setItem(k, JSON.stringify({ state: { value: v }, version: 1 }));
  }, data);
}

export async function stored<T = unknown>(page: Page, key: string): Promise<T | null> {
  return page.evaluate((k) => {
    const raw = localStorage.getItem(k);
    return raw ? JSON.parse(raw).state.value : null;
  }, key);
}

export const ONBOARDED = { 'qareeb:onboarding:v1': { completedAt: '2026-11-20T06:00:00.000Z' } };

/** Walks «عِش الدعاء» from the first step to the closing. */
export async function liveThrough(page: Page, opts: { note?: string; intention?: string } = {}) {
  await page.getByRole('button', { name: /عِش الدعاء/ }).click();
  for (let i = 0; i < 5; i++) {
    const showAll = page.getByRole('button', { name: 'أظهر النص كاملًا' });
    if (await showAll.isVisible()) await showAll.click();
    await page.getByRole('button', { name: i === 4 ? 'يا ربّ' : 'التالي', exact: true }).click();
  }
  if (opts.intention) await page.getByRole('button', { name: opts.intention }).click();
  await page.getByRole('button', { name: 'متابعة' }).click();
  if (opts.note) {
    await page.getByRole('textbox').fill(opts.note);
    await page.getByRole('button', { name: 'احفظ في الدفتر' }).click();
  } else {
    await page.getByRole('button', { name: 'إتمام' }).click();
  }
  await page.getByRole('button', { name: 'لا الآن' }).click();
  await expect(page.getByText('جعله الله دعاءً مستجابًا')).toBeVisible();
  await expect(page.getByRole('dialog')).toBeHidden({ timeout: 5000 });
}
