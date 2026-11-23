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
];

const browser = await chromium.launch();
const page = await browser.newPage({ deviceScaleFactor: 1 });
for (const [src, dest, size, transparent] of JOBS) {
  const svg = fs.readFileSync(path.join(brand, src), 'utf8');
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(
    `<html><body style="margin:0;background:transparent"><img src="data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}" width="${size}" height="${size}" style="display:block"></body></html>`,
  );
  await page.waitForFunction(() => document.images[0].complete);
  await page.screenshot({ path: path.join(out, dest), omitBackground: transparent, clip: { x: 0, y: 0, width: size, height: size } });
  console.log(dest, size);
}
await browser.close();
