/**
 * bun run build-landing: the static landing page into dist-landing/ (no
 * JavaScript in the browser). LANDING_SITE_URL is its own address and
 * LANDING_APP_URL the app's; both default to the free Vercel address until a
 * domain is chosen (decision ٧).
 */
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT } from './lib/paths.ts';

const site = process.env.LANDING_SITE_URL ?? 'https://qareeb-landing.vercel.app/';
const app = process.env.LANDING_APP_URL ?? 'https://qareeb.vercel.app/';
const out = join(ROOT, 'dist-landing');
rmSync(out, { recursive: true, force: true });
mkdirSync(join(out, 'brand'), { recursive: true });

const html = readFileSync(join(ROOT, 'landing', 'index.html'), 'utf8').replaceAll('{{SITE_URL}}', site).replaceAll('{{APP_URL}}', app);
writeFileSync(join(out, 'index.html'), html);
cpSync(join(ROOT, 'landing', 'landing.css'), join(out, 'landing.css'));
cpSync(join(ROOT, 'landing', 'shots'), join(out, 'shots'), { recursive: true });
// Same fonts and tokens as the app; the font URLs in tokens.css are absolute (/fonts/…).
cpSync(join(ROOT, 'src', 'styles', 'tokens.css'), join(out, 'tokens.css'));
cpSync(join(ROOT, 'public', 'fonts'), join(out, 'fonts'), { recursive: true });
for (const f of ['favicon.svg', 'apple-touch-icon.png', 'lockup-on-light.svg', 'lockup-on-dark.svg', 'og-image-1200x630.png']) {
  cpSync(join(ROOT, 'public', 'brand', f), join(out, 'brand', f));
}
console.log(`build-landing: dist-landing/ (app link ${app})`);
