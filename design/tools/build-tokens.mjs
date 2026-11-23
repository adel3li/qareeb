// Generates design/tokens.css, the stylesheet the app copies to src/styles/tokens.css, from the single
// source design/system/tokens.json (the same file the design system page reads).
//
// Light values sit on :root. Dark values apply with prefers-color-scheme unless the user chose light,
// and with data-theme="dark" on <html> when the user chose dark (05-technical-blueprint.md §8).
// Type sizes are rem so the text-size setting scales them; spacing stays px.
// Type variables are --fs-*, --lh-*, --fw-*, so they never collide with the colours --text-body etc.
//
// Usage: node design/tools/build-tokens.mjs
import fs from 'node:fs';

const here = (p) => new URL(p, import.meta.url);
const t = JSON.parse(fs.readFileSync(here('../system/tokens.json'), 'utf8'));
const [light, dark] = t.color.themes.map((x) => x.id);
const pick = (v, theme) => (typeof v === 'string' ? v : v[theme] ?? v[light]);
const decl = (name, v) => `  --${name}: ${v};`;
const rem = (px) => `${+(parseFloat(px) / 16).toFixed(4)}rem`;

const colours = (theme) => t.color.tokens.map((c) => decl(c.name, pick(c.value, theme)));
const shadows = (theme) => (t.shadow?.tokens ?? []).map((s) => decl(s.name, pick(s.value, theme)));
const plain = ['spacing', 'size', 'radius', 'duration', 'easing'].flatMap((f) => (t[f]?.tokens ?? []).map((x) => decl(x.name, x.value)));
const families = Object.entries(t.type.families).map(([k, v]) => decl(`font-${k}`, v));
const type = t.type.groups.flatMap((g) =>
  g.styles.flatMap((s) => {
    const fs_ = parseFloat(s.fontSize);
    const lh = typeof s.lineHeight === 'number' ? s.lineHeight : +(parseFloat(s.lineHeight) / fs_).toFixed(4);
    return [decl(`fs-${s.name}`, rem(s.fontSize)), decl(`lh-${s.name}`, lh), decl(`fw-${s.name}`, s.fontWeight), decl(`ff-${s.name}`, `var(--font-${s.family ?? g.family})`)];
  }),
);
const faces = t.type.fonts.map(
  (f) =>
    `@font-face {\n  font-family: '${f.family}';\n  src: url('/${f.file}') format('woff2');\n  font-weight: ${f.weight};\n  font-style: ${f.style ?? 'normal'};\n  font-display: ${f.family === 'KFGQPC HAFS' ? 'block' : 'swap'};${f.unicodeRange ? `\n  unicode-range: ${f.unicodeRange};` : ''}\n}`,
);
const zero = (t.duration?.tokens ?? []).filter((d) => d.name.startsWith('duration-')).map((d) => decl(d.name, '0ms'));

const css = `/* قريب: design tokens. GENERATED from design/system/tokens.json by design/tools/build-tokens.mjs. Do not edit. */

${faces.join('\n\n')}

:root {
  color-scheme: light;
${colours(light).join('\n')}
${shadows(light).join('\n')}
${plain.join('\n')}
${families.join('\n')}
${type.join('\n')}
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme='light']) {
    color-scheme: dark;
${colours(dark).map((l) => '  ' + l).join('\n')}
${shadows(dark).map((l) => '  ' + l).join('\n')}
  }
}

:root[data-theme='dark'] {
  color-scheme: dark;
${colours(dark).join('\n')}
${shadows(dark).join('\n')}
}

@media (prefers-reduced-motion: reduce) {
  :root {
${zero.map((l) => '  ' + l).join('\n')}
  }
}
`;
fs.writeFileSync(here('../tokens.css'), css);
console.log('wrote design/tokens.css:', t.color.tokens.length, 'colours ×', t.color.themes.length, 'themes,', type.length / 4, 'type styles,', plain.length, 'other tokens');
