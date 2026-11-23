import type { Page } from '@playwright/test';

export const SHOTS = process.env.SHOTS_DIR;

/** Marks onboarding done so a test starts on Today (what a returning user has). */
export async function skipOnboarding(page: Page, extra: Record<string, unknown> = {}) {
  await page.addInitScript((extra) => {
    if (sessionStorage.getItem('seeded')) return;
    sessionStorage.setItem('seeded', '1');
    localStorage.setItem('qareeb:onboarding:v1', JSON.stringify({ state: { completedAt: '2026-11-20T10:00:00.000Z' }, version: 1 }));
    for (const [k, v] of Object.entries(extra)) localStorage.setItem(k, JSON.stringify({ state: v, version: 1 }));
  }, extra);
}

export async function appKeys(page: Page): Promise<string[]> {
  return page.evaluate(() => Object.keys(localStorage).filter((k) => k.startsWith('qareeb:')).sort());
}

export async function stored<T>(page: Page, key: string): Promise<T | null> {
  return page.evaluate((key) => {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw).state : null;
  }, key);
}

export async function shot(page: Page, name: string) {
  if (SHOTS) await page.screenshot({ path: `${SHOTS}/${name}.png`, fullPage: false });
}

/** Walks «عِش الدعاء» to the end using «أظهر النص كاملًا» on each step. */
export async function liveThrough(page: Page, opts: { intention?: string; note?: string; need?: string; shots?: string } = {}) {
  const dialog = page.getByRole('dialog', { name: 'عِش الدعاء' });
  await dialog.waitFor();
  for (let i = 0; i < 5; i++) {
    const showAll = dialog.getByRole('button', { name: 'أظهر النص كاملًا' });
    if (await showAll.isVisible()) await showAll.click();
    if (opts.shots && (i === 0 || i === 4)) await shot(page, `${opts.shots}-step${i + 1}`);
    await dialog.getByRole('button', { name: i === 4 ? 'يا ربّ' : 'التالي' }).click();
  }
  if (opts.intention) await dialog.getByRole('button', { name: opts.intention }).click();
  if (opts.shots) await shot(page, `${opts.shots}-intention`);
  await dialog.getByRole('button', { name: 'متابعة' }).click();
  if (opts.note) {
    await dialog.getByRole('textbox').fill(opts.note);
    if (opts.shots) await shot(page, `${opts.shots}-notebook`);
    await dialog.getByRole('button', { name: 'احفظ في الدفتر' }).click();
  } else {
    await dialog.getByRole('button', { name: 'إتمام' }).click();
  }
  if (opts.need) {
    await dialog.getByRole('textbox').fill(opts.need);
    await dialog.getByRole('button', { name: 'أضف إلى دعواتي' }).click();
  } else {
    await dialog.getByRole('button', { name: 'لا الآن' }).click();
  }
  await page.getByText('جعله الله دعاءً مستجابًا').waitFor();
  if (opts.shots) await shot(page, `${opts.shots}-closing`);
  await dialog.waitFor({ state: 'detached', timeout: 5000 });
}
