/**
 * Renders the iOS startup images for each device size from design/brand/splash-{light,dark}.svg
 * into public/splash/, and writes their <link rel="apple-touch-startup-image"> tags into
 * index.html between the splash markers. The design is centred on its page colour, so other
 * aspect ratios (iPads) get the same door on the same ground.
 *
 * Usage: bun scripts/render-splash.ts   (uses the pre-installed Playwright Chromium)
 */
import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dir, '..');
const out = path.join(root, 'public/splash');
fs.mkdirSync(out, { recursive: true });

/** CSS width × height in portrait, and device pixel ratio. */
const DEVICES: [number, number, number][] = [
  [440, 956, 3], // iPhone 16 Pro Max
  [402, 874, 3], // iPhone 16 Pro
  [430, 932, 3], // iPhone 14/15 Pro Max, 15/16 Plus
  [393, 852, 3], // iPhone 14/15 Pro, 15/16
  [428, 926, 3], // iPhone 12/13 Pro Max, 14 Plus
  [390, 844, 3], // iPhone 12/13/14
  [375, 812, 3], // iPhone X/XS/11 Pro, 12/13 mini (scaled)
  [414, 896, 3], // iPhone XS Max, 11 Pro Max
  [414, 896, 2], // iPhone XR, 11
  [360, 780, 3], // iPhone 12/13 mini
  [414, 736, 3], // iPhone 6–8 Plus
  [375, 667, 2], // iPhone SE 2/3, 6–8
  [320, 568, 2], // iPhone SE 1
  [1024, 1366, 2], // iPad Pro 12.9"
  [834, 1194, 2], // iPad Pro 11"
  [820, 1180, 2], // iPad Air
  [810, 1080, 2], // iPad 10.2"
  [768, 1024, 2], // iPad mini, older iPads
  [744, 1133, 2], // iPad mini 6
];

const links: string[] = [];
const browser = await chromium.launch();
const page = await browser.newPage({ deviceScaleFactor: 1 });
for (const scheme of ['light', 'dark'] as const) {
  const svg = fs.readFileSync(path.join(root, `design/brand/splash-${scheme}.svg`), 'utf8');
  const ground = /<rect[^>]*fill="([^"]+)"/.exec(svg)?.[1] ?? 'white';
  const data = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
  for (const [w, h, dpr] of DEVICES) {
    const pw = w * dpr;
    const ph = h * dpr;
    const file = `splash-${scheme}-${pw}x${ph}.png`;
    await page.setViewportSize({ width: pw, height: ph });
    await page.setContent(
      `<html><body style="margin:0;background:${ground};width:${pw}px;height:${ph}px;display:flex;align-items:center;justify-content:center;overflow:hidden"><img src="${data}" style="height:${ph}px;width:auto;max-width:none;display:block"></body></html>`,
    );
    await page.waitForFunction(() => document.images[0].complete);
    await page.screenshot({ path: path.join(out, file), clip: { x: 0, y: 0, width: pw, height: ph } });
    links.push(
      `    <link rel="apple-touch-startup-image" href="splash/${file}" media="(device-width: ${w}px) and (device-height: ${h}px) and (-webkit-device-pixel-ratio: ${dpr}) and (orientation: portrait) and (prefers-color-scheme: ${scheme})" />`,
    );
  }
}
await browser.close();

const indexPath = path.join(root, 'index.html');
const html = fs.readFileSync(indexPath, 'utf8');
const next = html.replace(
  /(<!-- splash:start[^>]*-->\n)[\s\S]*?(\s*<!-- splash:end -->)/,
  `$1${links.join('\n')}$2`,
);
fs.writeFileSync(indexPath, next);
console.log(`render-splash: ${links.length} images in public/splash, index.html updated`);
