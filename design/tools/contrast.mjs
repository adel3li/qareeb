// Checks every colour pair the design system promises, in both themes of design/system/tokens.json.
// Prints a Markdown table; exits 1 if any pair is below its minimum.
// Usage: node design/tools/contrast.mjs
import fs from 'node:fs';

const tokens = JSON.parse(fs.readFileSync(new URL('../system/tokens.json', import.meta.url), 'utf8'));
const themes = tokens.color.themes.map((t) => t.id);
const byName = Object.fromEntries(tokens.color.tokens.map((t) => [t.name, t.value]));
const value = (name, theme) => (typeof byName[name] === 'string' ? byName[name] : byName[name][theme] ?? byName[name][themes[0]]);

const rgb = (h) => {
  const m = String(h).match(/^#([0-9a-f]{6})$/i);
  if (!m) throw new Error(`not an opaque hex colour: ${h}`);
  return [0, 2, 4].map((i) => parseInt(m[1].slice(i, i + 2), 16));
};
const lum = (c) => c.map((v) => v / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)).reduce((s, v, i) => s + v * [0.2126, 0.7152, 0.0722][i], 0);
const ratio = (a, b) => { const [x, y] = [lum(rgb(a)), lum(rgb(b))].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

// [foreground, background, minimum]
const PAIRS = [
  ...['page', 'surface', 'surface-raised', 'surface-sunken'].map((bg) => ['text', bg, 7]),
  ...['page', 'surface', 'surface-raised'].map((bg) => ['text-body', bg, 4.5]),
  ...['page', 'surface', 'surface-raised', 'surface-sunken'].map((bg) => ['text-muted', bg, 4.5]),
  ...['page', 'surface', 'surface-raised'].map((bg) => ['accent', bg, 3]),
  ['cta-text', 'cta', 4.5], ['cta-text', 'cta-hover', 4.5],
  ['cta', 'page', 3], ['cta', 'surface', 3], ['cta', 'surface-raised', 3],
  ['sacred-quran', 'sacred-bg', 7], ['sacred-hadith', 'sacred-bg', 7], ['sacred-hadith', 'surface', 7],
  ['success', 'surface', 4.5], ['success', 'surface-sunken', 4.5], ['danger', 'surface', 4.5], ['danger', 'surface-raised', 4.5],
  ['focus-ring', 'page', 3], ['focus-ring', 'surface', 3], ['focus-ring', 'surface-raised', 3],
];

let failed = 0;
const rows = ['| pair | ' + themes.join(' | ') + ' | min |', '|---|' + themes.map(() => '---:|').join('') + '---:|'];
for (const [fg, bg, min] of PAIRS) {
  const cells = themes.map((t) => { const r = ratio(value(fg, t), value(bg, t)); if (r < min) failed++; return `${r.toFixed(2)}${r < min ? ' ✗' : ''}`; });
  rows.push(`| \`${fg}\` on \`${bg}\` | ${cells.join(' | ')} | ${min} |`);
}
console.log(rows.join('\n'));
if (failed) { console.error(`\n${failed} pair(s) below the minimum`); process.exit(1); }
