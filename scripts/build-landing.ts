/**
 * Builds the static landing page into dist-landing/: landing/ plus the app's tokens, fonts and
 * brand files. No JavaScript in the browser. SITE_URL (the landing page's own address, with a
 * trailing slash) and APP_URL (where the app lives) are open decisions until the domain is chosen
 * (docs/handoff/00-decisions.md §7); they default to relative addresses.
 *
 * Usage: SITE_URL=https://example.app/ APP_URL=https://app.example.app/ bun scripts/build-landing.ts
 */
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dir, '..');
const out = path.join(root, 'dist-landing');
const site = process.env.SITE_URL ?? './';
const app = process.env.APP_URL ?? './app/';

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });
const html = fs.readFileSync(path.join(root, 'landing/index.html'), 'utf8').replaceAll('%SITE_URL%', site).replaceAll('%APP_URL%', app);
fs.writeFileSync(path.join(out, 'index.html'), html);
fs.copyFileSync(path.join(root, 'landing/landing.css'), path.join(out, 'landing.css'));
fs.writeFileSync(path.join(out, 'tokens.css'), fs.readFileSync(path.join(root, 'src/styles/tokens.css'), 'utf8').replaceAll("url('/fonts/", "url('fonts/"));
fs.copyFileSync(path.join(root, 'public/favicon.svg'), path.join(out, 'favicon.svg'));
fs.cpSync(path.join(root, 'public/fonts'), path.join(out, 'fonts'), { recursive: true });
fs.mkdirSync(path.join(out, 'brand'));
for (const f of ['lockup-on-light.svg', 'lockup-on-dark.svg', 'og-image-1200x630.png', 'apple-touch-icon.png']) {
  fs.copyFileSync(path.join(root, 'public/brand', f), path.join(out, 'brand', f));
}
console.log(`build-landing: dist-landing/ (site ${site}, app ${app})`);
