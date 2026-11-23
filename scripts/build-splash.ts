/**
 * Renders the iOS startup images for every size in scripts/lib/splash-sizes.ts
 * from design/brand/splash-{light,dark}.svg into public/splash/. Run after the
 * splash artwork changes; the PNGs are committed.
 *
 *   bun scripts/build-splash.ts
 */
import { chromium } from 'playwright';
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { SPLASH_SIZES, splashFile } from './lib/splash-sizes';

const ROOT = join(import.meta.dir, '..');
const tokens = JSON.parse(readFileSync(join(ROOT, 'design/system/tokens.json'), 'utf8'));
const page = tokens.color.tokens.find((t: { name: string }) => t.name === 'page').value as Record<'light' | 'dark', string>;
mkdirSync(join(ROOT, 'public/splash'), { recursive: true });

const LOCAL = '/opt/pw-browsers/chromium';
const browser = await chromium.launch(existsSync(LOCAL) ? { executablePath: LOCAL } : {});
for (const theme of ['light', 'dark'] as const) {
  const svg = readFileSync(join(ROOT, `design/brand/splash-${theme}.svg`), 'utf8');
  for (const [w, h, r] of SPLASH_SIZES) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: r });
    const p = await ctx.newPage();
    const uri = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
    await p.setContent(`<html><body style="margin:0;background:${page[theme]};height:100vh;display:flex;align-items:center;justify-content:center"><img src="${uri}" style="max-width:100%;max-height:100%;height:100%;object-fit:contain"></body></html>`);
    await p.screenshot({ path: join(ROOT, 'public', splashFile(theme, w, h, r)) });
    await ctx.close();
  }
}
await browser.close();
console.log(`build-splash: ${SPLASH_SIZES.length * 2} images in public/splash/`);
