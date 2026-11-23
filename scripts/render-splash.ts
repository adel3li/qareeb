/**
 * bun scripts/render-splash.ts: renders public/splash/*.png for every iOS
 * device size, from design/brand/splash-light.svg and splash-dark.svg, with
 * the pre-installed Chromium. Run after the brand files change; the PNGs are committed.
 */
import { mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from 'playwright';
import { ROOT } from './lib/paths.ts';
import { SPLASH_DEVICES, splashFile } from './lib/splash.ts';

mkdirSync(join(ROOT, 'public', 'splash'), { recursive: true });
const browser = await chromium.launch();
for (const scheme of ['light', 'dark'] as const) {
  const svg = readFileSync(join(ROOT, 'design', 'brand', `splash-${scheme}.svg`), 'utf8');
  const ground = /<rect[^>]*fill="([^"]+)"/.exec(svg)?.[1] ?? 'transparent';
  for (const [w, h, dpr] of SPLASH_DEVICES) {
    const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: dpr });
    const sized = svg.replace(/width="\d+" height="\d+"/, `width="${w}" height="${h}" preserveAspectRatio="xMidYMid meet"`);
    await page.setContent(`<html><body style="margin:0;background:${ground}">${sized}</body></html>`);
    await page.screenshot({ path: join(ROOT, 'public', splashFile(scheme, w, h, dpr)) });
    await page.close();
  }
}
await browser.close();
console.log(`render-splash: ${SPLASH_DEVICES.length * 2} images`);
