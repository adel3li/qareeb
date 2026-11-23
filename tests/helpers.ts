import { expect, test, type Page } from '@playwright/test';

/** The instant at which the wall clock reads y-m-d hh:mm in the browser's time zone (the project's timezoneId). */
export function localInstant(y: number, m: number, d: number, hh = 10, mm = 0): Date {
  const tz = (test.info().project.use.timezoneId as string | undefined) ?? 'UTC';
  const wall = Date.UTC(y, m - 1, d, hh, mm);
  const offsetAt = (instant: number) => {
    const parts = Object.fromEntries(
      new Intl.DateTimeFormat('en-US', { timeZone: tz, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
        .formatToParts(new Date(instant))
        .map((p) => [p.type, p.value]),
    );
    return Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour, +parts.minute) - instant;
  };
  let instant = wall - offsetAt(wall);
  instant = wall - offsetAt(instant);
  return new Date(instant);
}

/** Sets the browser clock to a local wall time. */
export async function at(page: Page, y: number, m: number, d: number, hh = 10, mm = 0) {
  await page.clock.install({ time: localInstant(y, m, d, hh, mm) });
}

export async function seed(page: Page, data: Record<string, unknown>) {
  await page.addInitScript((entries) => {
    if (sessionStorage.getItem('seeded')) return;
    for (const [k, v] of Object.entries(entries)) localStorage.setItem(k, JSON.stringify({ state: v, version: 1 }));
    sessionStorage.setItem('seeded', '1');
  }, data);
}

export const onboarded = { 'qareeb:onboarding:v1': { completedAt: '2026-11-01T10:00:00.000Z' } };

/** Goes through the five steps with «أظهر النص كاملًا», then the intention, journal and need. */
export async function liveThrough(page: Page, opts: { intention?: string; journal?: string; need?: string } = {}) {
  await page.getByRole('button', { name: /عِش الدعاء|أعِد التأمل/ }).first().click();
  const dialog = page.getByRole('dialog', { name: 'عِش الدعاء' });
  await expect(dialog).toBeVisible();
  for (let i = 0; i < 5; i++) {
    await showAll(page);
    await dialog.getByRole('button', { name: i === 4 ? 'يا ربّ' : 'التالي', exact: true }).click();
  }
  if (opts.intention) await dialog.getByRole('button', { name: opts.intention }).click();
  await dialog.getByRole('button', { name: 'متابعة' }).click();
  if (opts.journal) {
    await dialog.getByRole('textbox').fill(opts.journal);
    await dialog.getByRole('button', { name: 'احفظ في الدفتر' }).click();
  } else await dialog.getByRole('button', { name: 'إتمام' }).click();
  if (opts.need) {
    await dialog.getByLabel('حاجتك').fill(opts.need);
    await dialog.getByRole('button', { name: 'أضف إلى دعواتي' }).click();
  } else await dialog.getByRole('button', { name: 'لا الآن' }).click();
  await expect(page.getByText('جعله الله دعاءً مستجابًا')).toBeVisible();
  await page.clock.runFor(2500);
  await expect(dialog).toBeHidden();
}

export async function storedKeys(page: Page): Promise<string[]> {
  return page.evaluate(() => Object.keys(localStorage).filter((k) => k.startsWith('qareeb:')).sort());
}

/** Presses «أظهر النص كاملًا» when the step still has text to reveal (a one-sentence step has none). */
export async function showAll(page: Page) {
  const button = page.getByRole('dialog', { name: 'عِش الدعاء' }).getByRole('button', { name: 'أظهر النص كاملًا' });
  if (await button.isVisible()) await button.click();
}
