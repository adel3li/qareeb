import { expect, test } from '@playwright/test';
import { SHOTS, skipOnboarding } from './helpers';

/**
 * Every screen at 390×844 and 360×640, light and dark, normal and the largest text size:
 * nothing wider than the screen, the sacred text fully inside its frame. With SHOTS_DIR set,
 * a screenshot of each for a person to look at.
 */
const SIZES = [
  { width: 390, height: 844 },
  { width: 360, height: 640 },
];
const THEMES = ['light', 'dark'] as const;
const FONTS = [16, 24];
const ROUTES = ['#/today', '#/library', '#/notebook', '#/calendar', '#/settings', '#/dua/dua_0002', '#/dua/dua_0003'];

for (const size of SIZES)
  for (const theme of THEMES)
    for (const font of FONTS) {
      test(`${size.width}x${size.height} ${theme} ${font}px`, async ({ page }) => {
        await page.setViewportSize(size);
        await page.emulateMedia({ colorScheme: theme });
        await skipOnboarding(page, { 'qareeb:settings:v1': { theme: 'system', fontScale: font, showMyDuasInFlow: true }, 'qareeb:welcome:v1': { doneOn: '2026-11-20' } });
        for (const hash of ROUTES) {
          await page.goto(`./${hash}`);
          await expect(page.getByRole('heading', { level: 1 }).or(page.locator('article h2')).first()).toBeVisible();
          await expect(page.getByText('يُحمَّل…')).toHaveCount(0);
          await page.evaluate(() => document.fonts.ready);
          const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
          expect(overflow, `${hash} overflows`).toBeLessThanOrEqual(0);
          const sacred = page.locator('figure').first();
          if (await sacred.count()) {
            const clipped = await sacred.evaluate((el) => el.scrollHeight > el.clientHeight + 1 || el.scrollWidth > el.clientWidth + 1);
            expect(clipped, `${hash} sacred text clipped`).toBe(false);
          }
          if (SHOTS) await page.screenshot({ path: `${SHOTS}/v-${size.width}-${theme}-${font}-${hash.replace(/[#/]/g, '')}.png`, fullPage: true });
        }
      });
    }

test('wide screens: the tab bar becomes a top bar', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 800 });
  await skipOnboarding(page);
  await page.goto('./#/library');
  await expect(page.getByRole('navigation').filter({ visible: true })).toHaveCount(1);
  const nav = page.getByRole('navigation').filter({ visible: true });
  const box = await nav.boundingBox();
  expect(box!.y).toBeLessThan(100);
  if (SHOTS) await page.screenshot({ path: `${SHOTS}/wide-library.png` });
});
