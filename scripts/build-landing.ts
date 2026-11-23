/**
 * Builds the static landing page into landing/dist: plain HTML and CSS on the
 * app's tokens and self-hosted fonts, no JavaScript. Deploy it as its own
 * Vercel project (05 §12); the app link comes from src/config.ts.
 *
 *   LANDING_URL=https://… bun scripts/build-landing.ts
 */
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { APP_URL } from '../src/config';

const ROOT = join(import.meta.dir, '..');
const OUT = join(ROOT, 'landing', 'dist');
const LANDING_URL = process.env.LANDING_URL ?? APP_URL;

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
const html = readFileSync(join(ROOT, 'landing', 'index.html'), 'utf8').replaceAll('%APP_URL%', APP_URL).replaceAll('%LANDING_URL%', LANDING_URL);
writeFileSync(join(OUT, 'index.html'), html);
cpSync(join(ROOT, 'landing', 'landing.css'), join(OUT, 'landing.css'));
cpSync(join(ROOT, 'landing', 'assets'), join(OUT, 'assets'), { recursive: true });
cpSync(join(ROOT, 'src', 'styles', 'tokens.css'), join(OUT, 'tokens.css'));
mkdirSync(join(OUT, 'fonts'));
for (const f of ['NotoSansArabic-400.arabic.woff2', 'NotoSansArabic-400.latin.woff2', 'NotoSansArabic-500.arabic.woff2', 'NotoSansArabic-600.arabic.woff2', 'NotoSansArabic-700.arabic.woff2', 'NotoKufiArabic-700.arabic.woff2', 'NotoKufiArabic-700.latin.woff2', 'OFL-NotoSansArabic.txt', 'OFL-NotoKufiArabic.txt']) {
  try { cpSync(join(ROOT, 'public', 'fonts', f), join(OUT, 'fonts', f)); } catch { /* not every weight exists */ }
}
for (const [from, to] of [['public/favicon.svg', 'favicon.svg'], ['public/og-image.png', 'og-image.png'], ['public/icons/apple-touch-icon.png', 'apple-touch-icon.png'], ['public/icons/lockup-on-light.svg', 'lockup-on-light.svg'], ['public/icons/lockup-on-dark.svg', 'lockup-on-dark.svg']]) {
  cpSync(join(ROOT, from), join(OUT, to));
}
writeFileSync(join(OUT, 'vercel.json'), JSON.stringify({ headers: [{ source: '/(.*)', headers: [
  { key: 'Content-Security-Policy', value: "default-src 'self'; img-src 'self' data:; style-src 'self'; font-src 'self'; script-src 'none'; frame-ancestors 'none'; base-uri 'self'; form-action 'none'" },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
] }] }, null, 2));
console.log(`build-landing: landing/dist (app link ${APP_URL})`);
