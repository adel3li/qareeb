// Checks every token pair the identity brief (docs/handoff/10-identity-brief.md) sets a minimum for,
// in every direction and theme of design/tokens.css. Prints a Markdown table; exits 1 on any failure.
// Usage: node design/tools/contrast.mjs
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../tokens.css', import.meta.url), 'utf8');
const blocks = [...css.matchAll(/\[data-dir='(\w+)'\]\[data-theme='(\w+)'\]\s*\{([^}]*)\}/g)];

const hex = (h) => {
  const m = h.trim().match(/^#([0-9a-f]{6})$/i);
  return m ? [0, 2, 4].map((i) => parseInt(m[1].slice(i, i + 2), 16)) : null;
};
const lum = ([r, g, b]) =>
  [r, g, b]
    .map((c) => c / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
    .reduce((s, c, i) => s + c * [0.2126, 0.7152, 0.0722][i], 0);
const ratio = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

// [foreground, background, minimum, why]
const PAIRS = [
  ['text', 'surface', 7, 'long sacred and body text'],
  ['text', 'page', 7, ''],
  ['text-body', 'surface', 4.5, ''],
  ['text-muted', 'surface', 4.5, 'labels and dates'],
  ['text-muted', 'page', 4.5, ''],
  ['text-muted', 'surface-sunken', 4.5, 'placeholders in fields'],
  ['text-muted', 'surface-raised', 4.5, 'tab labels'],
  ['accent', 'surface', 3, 'non-text identity marks'],
  ['accent', 'page', 3, ''],
  ['cta-text', 'cta', 4.5, 'primary button'],
  ['cta-text', 'cta-hover', 4.5, ''],
  ['cta', 'page', 3, 'button edge against the page'],
  ['sacred-quran', 'sacred-bg', 7, ''],
  ['sacred-hadith', 'sacred-bg', 7, ''],
  ['success', 'surface', 4.5, ''],
  ['danger', 'surface', 4.5, ''],
  ['focus-ring', 'page', 3, ''],
  ['focus-ring', 'surface', 3, ''],
];

let failed = 0;
const rows = [];
for (const [, dir, theme, body] of blocks) {
  const t = Object.fromEntries([...body.matchAll(/--([\w-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]));
  for (const [fg, bg, min] of PAIRS) {
    const bgv = t[bg] === 'transparent' ? t.surface : t[bg];
    const a = hex(t[fg]);
    const b = hex(bgv);
    if (!a || !b) continue;
    const r = ratio(a, b);
    const ok = r >= min;
    if (!ok) failed++;
    rows.push(`| ${dir} | ${theme} | \`${fg}\` on \`${bg}\` | ${r.toFixed(2)} | ${min} | ${ok ? '✓' : '✗'} |`);
  }
}
console.log('| direction | theme | pair | ratio | min | |\n|---|---|---|---:|---:|---|');
console.log(rows.join('\n'));
if (failed) {
  console.error(`\n${failed} pair(s) below the minimum`);
  process.exit(1);
}
