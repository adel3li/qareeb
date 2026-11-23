// Rasterises the icon SVGs from design/tools/build-brand.py into the PNG sizes a PWA and iOS need.
// Usage: node design/tools/render-icons.mjs   (uses the pre-installed Playwright Chromium)
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';

const { chromium } = createRequire(import.meta.url)('playwright');
const brand = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../brand');
const out = path.join(brand, 'png');
fs.mkdirSync(out, { recursive: true });

// [source svg, output png, size, transparent corners]
const JOBS = [
  ['icon.svg', 'icon-1024.png', 1024, true],
  ['icon.svg', 'icon-512.png', 512, true],
  ['icon.svg', 'icon-192.png', 192, true],
  ['icon-maskable.svg', 'icon-maskable-512.png', 512, false],
  ['icon-maskable.svg', 'icon-maskable-192.png', 192, false],
  ['icon-full.svg', 'apple-touch-icon.png', 180, false],
  ['favicon.svg', 'favicon-32.png', 32, true],
  ['splash-light.svg', 'splash-light-1179x2556.png', [1179, 2556], false],
  ['splash-dark.svg', 'splash-dark-1179x2556.png', [1179, 2556], false],
];

const browser = await chromium.launch();
const page = await browser.newPage({ deviceScaleFactor: 1 });
for (const [src, dest, size, transparent] of JOBS) {
  const [w, h] = Array.isArray(size) ? size : [size, size];
  const svg = fs.readFileSync(path.join(brand, src), 'utf8');
  await page.setViewportSize({ width: w, height: h });
  await page.setContent(
    `<html><body style="margin:0;background:transparent"><img src="data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}" width="${w}" height="${h}" style="display:block"></body></html>`,
  );
  await page.waitForFunction(() => document.images[0].complete);
  await page.screenshot({ path: path.join(out, dest), omitBackground: transparent, clip: { x: 0, y: 0, width: w, height: h } });
  console.log(dest, `${w}x${h}`);
}

// Link preview (Open Graph), 1200x630: the lockup and one line, set in the UI face.
{
  const font = (f) => fs.readFileSync(path.join(brand, '../system/fonts', f)).toString('base64');
  const lockup = fs.readFileSync(path.join(brand, 'lockup-on-dark.svg')).toString('base64');
  await page.setViewportSize({ width: 1200, height: 630 });
  await page.setContent(`<html dir="rtl"><head><style>
    @font-face{font-family:Q;font-weight:500;src:url(data:font/woff2;base64,${font('NotoSansArabic-500.arabic.woff2')})}
    body{margin:0;width:1200px;height:630px;background:#12110f radial-gradient(60% 70% at 50% 46%,rgba(76,199,186,.13),rgba(76,199,186,0) 70%);
      display:flex;flex-direction:column;align-items:center;justify-content:center;gap:44px}
    p{margin:0;font:500 38px/1.6 Q,sans-serif;color:#cec6b9}
  </style></head><body><img src="data:image/svg+xml;base64,${lockup}" style="height:188px"><p>دعاءٌ واحد كلَّ يوم، من القرآن والسنة</p></body></html>`);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() => document.images[0].complete);
  await page.screenshot({ path: path.join(out, 'og-image-1200x630.png'), clip: { x: 0, y: 0, width: 1200, height: 630 } });
  console.log('og-image-1200x630.png 1200x630');
}
await browser.close();
