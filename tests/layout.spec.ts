import { expect, test } from '@playwright/test';
import { ONBOARDED, seed } from './helpers';

const LARGE = { ...ONBOARDED, 'qareeb:welcome:v1': { doneOn: '2026-11-20' }, 'qareeb:settings:v1': { theme: 'system', fontScale: 24, showMyDuasInFlow: true } };

for (const hash of ['#/today', '#/library', '#/notebook', '#/calendar', '#/settings']) {
  test(`no horizontal scroll at this width with the largest text: ${hash}`, async ({ page }) => {
    await page.clock.setFixedTime(new Date('2026-11-23T12:00:00+03:00'));
    await seed(page, LARGE);
    await page.goto(`/${hash}`);
    await page.reload();
    await page.locator('main h1').first().waitFor();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
}
