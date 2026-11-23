/**
 * The product promises as code checks (05 §10). Fails if any is broken.
 *
 * 1. No streaks, consecutive-day counts, points, badges or percentages of days.
 * 2. No network request from src/ (the allow-list below is empty), no external <link> or script.
 * 3. «ما تكتبه لا يغادر جهازك», exactly; never «لا شيء يغادر جهازك».
 * 4. No claim that the content was reviewed by scholars.
 * 5. Pinch zoom is never blocked; days come from src/lib/dates.ts; colours only from tokens.css.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = join(import.meta.dir, '..');
const SRC = join(ROOT, 'src');

/** Files allowed to make a network request, with the reason. Empty in the first release. */
const NETWORK_ALLOW_LIST: string[] = [];

/** Interface sentences that mention streaks or consecutive days only to promise their absence. */
const PROMISE_PHRASES = ['بلا سلاسل', 'بلا نقاط', 'لا نقاط', 'ولا أيام متتالية', 'لا أيام متتالية', 'حافظ على سلسلتك'];

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return name === 'generated' ? [] : walk(path);
    return /\.(ts|tsx|css|html)$/.test(name) ? [path] : [];
  });
}

const failures: string[] = [];
const fail = (file: string, line: number, message: string) => failures.push(`${relative(ROOT, file)}:${line}: ${message}`);

function scan(file: string, rules: [RegExp, string][]) {
  const lines = readFileSync(file, 'utf8').split('\n');
  lines.forEach((text, i) => {
    for (const [re, message] of rules) if (re.test(text)) fail(file, i + 1, message);
  });
}

const isTest = (f: string) => /\.test\.tsx?$/.test(f);
const srcFiles = walk(SRC);

for (const file of srcFiles) {
  const rel = relative(ROOT, file);
  const rules: [RegExp, string][] = [
    [/\b(streaks?|consecutive|badges?|points|leaderboard)\b/i, 'streaks, consecutive days, points and badges are not part of قريب'],
    [/new Date\(\s*['"`]\d{4}-\d{2}-\d{2}['"`]\s*\)/, 'use parseLocalDateString(): new Date("YYYY-MM-DD") reads UTC'],
    [/user-scalable\s*=\s*no|maximum-scale/, 'never block pinch zoom'],
    [/لا شيء يغادر جهازك/, 'the promise is «ما تكتبه لا يغادر جهازك», exactly'],
    [/مراجَ?ع(ة)? من (ال)?علماء|راجعه العلماء|مراجَع علميًا/, 'do not claim scholarly review before every card shown is approved'],
  ];
  if (!isTest(file)) {
    // Tests may build the UTC day on purpose, to show that it differs.
    rules.push([/toISOString\(\)\.(slice\(0,\s*10\)|split\(['"]T['"]\)\[0\])/, 'use toLocalDateString() from src/lib/dates.ts: toISOString() is the UTC day']);
  }
  if (!NETWORK_ALLOW_LIST.includes(rel) && !isTest(file)) {
    rules.push([/\bfetch\(|XMLHttpRequest|sendBeacon|new WebSocket|EventSource\(/, 'no network request from src/ (allow-list is empty)']);
  }
  if (!rel.endsWith('styles/tokens.css')) {
    rules.push(
      [/#[0-9a-fA-F]{3,8}\b(?![-\w])/, 'colours come from tokens.css only (hex found)'],
      [/\brgba?\(|\bhsla?\(/, 'colours come from tokens.css only (rgb/hsl found)'],
      [/\b(bg|text|border|fill|stroke|from|to|ring)-(white|black|red|blue|green|gray|grey|slate|zinc|yellow|amber|teal|emerald)\b/, 'use semantic colour utilities, not named colours'],
    );
  }
  scan(file, rules);
}

// Percentages and streak words in interface text, except the promise phrases.
const copyFile = join(SRC, 'copy', 'ar.ts');
readFileSync(copyFile, 'utf8').split('\n').forEach((text, i) => {
  let t = text;
  for (const p of PROMISE_PHRASES) t = t.split(p).join('');
  if (/متتالي|سلسل|نقاط|شارة|٪|%/.test(t)) fail(copyFile, i + 1, 'no streaks, points, badges or percentages in interface text');
});
if (!readFileSync(copyFile, 'utf8').includes('ما تكتبه لا يغادر جهازك')) failures.push('src/copy/ar.ts: the privacy promise «ما تكتبه لا يغادر جهازك» is missing');

// index.html: nothing loaded from another origin, zoom allowed.
const html = join(ROOT, 'index.html');
scan(html, [
  [/<link[^>]+href=["']https?:\/\//, 'no <link> to another origin'],
  [/<script[^>]+src=["']https?:\/\//, 'no script from another origin'],
  [/user-scalable\s*=\s*no|maximum-scale/, 'never block pinch zoom'],
]);

if (failures.length) {
  failures.forEach((f) => console.error('✗ ' + f));
  console.error(`check-promises: ${failures.length} broken`);
  process.exit(1);
}
console.log(`check-promises: ${srcFiles.length} files in src/ and index.html keep every promise`);
