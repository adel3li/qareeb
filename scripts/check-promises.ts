/**
 * The product promises as code checks (docs/handoff/05-technical-blueprint.md §10).
 * Runs in CI; prints every violation as file:line and exits 1 if there is any.
 *
 * Usage: bun scripts/check-promises.ts
 */
import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from './lib/paths';

export interface Violation {
  file: string;
  line: number;
  rule: string;
  text: string;
}

/** Files under src/ allowed to make a network request. Empty: nothing in src/ talks to a server. */
export const NETWORK_ALLOW_LIST: string[] = [];

/** Phrases that mention streaks only to promise their absence. */
export const STREAK_WORD_ALLOW_LIST = ['بلا سلاسل', 'لا سلاسل', 'ولا سلاسل', 'لا أيام متتالية', 'ولا أيام متتالية', 'ولا «أيام متتالية»', 'لا «أيام متتالية»'];

export const PRIVACY_PROMISE = 'ما تكتبه لا يغادر جهازك';

const PALETTE =
  'red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|slate|gray|grey|zinc|neutral|stone';
const UTILITY = 'bg|text|border|ring|fill|stroke|from|to|via|outline|decoration|shadow|accent|caret|divide|placeholder|border-[trblxyse]';

interface LineRule {
  rule: string;
  test: (line: string, file: string) => boolean;
  /** Only files for which this returns true are checked. */
  applies?: (file: string) => boolean;
}

const stripMarks = (s: string) => s.normalize('NFD').replace(/[ً-ٰٟ]/g, '');
const isTokens = (f: string) => f === 'src/styles/tokens.css';

export const SRC_RULES: LineRule[] = [
  {
    rule: 'no streaks, consecutive days, badges or points',
    test: (l) => /\b(streaks?|consecutive|badges?|points?)\b/i.test(l),
  },
  {
    rule: 'Arabic streak words only where they promise their absence (STREAK_WORD_ALLOW_LIST)',
    test: (l) => {
      let rest = l;
      for (const ok of STREAK_WORD_ALLOW_LIST) rest = rest.split(ok).join('');
      return /متتالي|سلاسل|سلسل/.test(rest);
    },
  },
  {
    rule: 'no network request from src/ (NETWORK_ALLOW_LIST is empty)',
    test: (l, f) => !NETWORK_ALLOW_LIST.includes(f) && /\bfetch\s*\(|XMLHttpRequest|sendBeacon|\bWebSocket\b|\bEventSource\b/.test(l),
  },
  {
    rule: 'day keys come from src/lib/dates.ts, never the UTC day',
    // Tests may show the wrong way on purpose, to prove the right one differs.
    applies: (f) => !/\.test\.tsx?$/.test(f),
    test: (l) =>
      /toISOString\(\)\s*\.\s*(slice|substring|substr)\(\s*0\s*,\s*10\s*\)/.test(l) ||
      /toISOString\(\)\s*\.\s*split\(\s*['"]T['"]\s*\)/.test(l) ||
      /new Date\(\s*['"`]\d{4}-\d{2}-\d{2}['"`]\s*\)/.test(l),
  },
  {
    rule: 'never block zoom',
    test: (l) => /user-scalable\s*=\s*no|maximum-scale/i.test(l),
  },
  {
    rule: 'colours only from tokens.css: no hex, rgb(), hsl() or oklch() in components',
    applies: (f) => !isTokens(f),
    test: (l) =>
      /(?<![\w&/#])#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})(?![\w-])/.test(l) || /\b(?:rgba?|hsla?|oklch|oklab)\(/i.test(l),
  },
  {
    rule: 'no Tailwind default palette or named colours',
    test: (l) =>
      new RegExp(`\\b(?:${UTILITY})-(?:${PALETTE})-\\d{2,3}\\b`).test(l) || new RegExp(`\\b(?:${UTILITY})-(?:white|black)\\b`).test(l),
  },
  {
    rule: 'the privacy promise is worded exactly: «ما تكتبه لا يغادر جهازك», never «لا شيء يغادر جهازك»',
    test: (l) => /لا شيء يغادر جهازك/.test(stripMarks(l)),
  },
  {
    rule: 'never claim scholarly review before every card shown is approved',
    test: (l) => /مراجع من العلماء|راجعه العلماء|مراجع علميا|مراجعة من العلماء/.test(stripMarks(l)),
  },
];

function walk(dir: string, out: string[] = []): string[] {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'generated' || entry.name === 'node_modules') continue;
      walk(full, out);
    } else if (/\.(ts|tsx|js|jsx|css|html|json)$/.test(entry.name)) out.push(full);
  }
  return out;
}

/** Applies the line rules to one file's text. Exported for tests. */
export function checkText(file: string, text: string, rules: LineRule[] = SRC_RULES): Violation[] {
  const out: Violation[] = [];
  text.split('\n').forEach((line, i) => {
    for (const r of rules) {
      if (r.applies && !r.applies(file)) continue;
      if (r.test(line, file)) out.push({ file, line: i + 1, rule: r.rule, text: line.trim().slice(0, 140) });
    }
  });
  return out;
}

export function checkIndexHtml(file: string, text: string): Violation[] {
  const out: Violation[] = [];
  text.split('\n').forEach((line, i) => {
    if (/<(link|script)\b[^>]*\b(href|src)\s*=\s*["'](https?:)?\/\//i.test(line)) {
      out.push({ file, line: i + 1, rule: 'no <link> or <script> to another origin', text: line.trim() });
    }
    if (/user-scalable\s*=\s*no|maximum-scale/i.test(line)) out.push({ file, line: i + 1, rule: 'never block zoom', text: line.trim() });
  });
  return out;
}

export function runAll(root = ROOT): Violation[] {
  const rel = (f: string) => path.relative(root, f).split(path.sep).join('/');
  const violations: Violation[] = [];
  for (const file of walk(path.join(root, 'src'))) {
    violations.push(...checkText(rel(file), fs.readFileSync(file, 'utf8')));
  }
  for (const html of ['index.html', 'landing/index.html']) {
    const file = path.join(root, html);
    if (fs.existsSync(file)) violations.push(...checkIndexHtml(html, fs.readFileSync(file, 'utf8')));
  }
  const copyFile = path.join(root, 'src/copy/ar.ts');
  if (!fs.existsSync(copyFile) || !fs.readFileSync(copyFile, 'utf8').includes(PRIVACY_PROMISE)) {
    violations.push({ file: 'src/copy/ar.ts', line: 0, rule: `the privacy promise «${PRIVACY_PROMISE}» must be in the interface copy, word for word`, text: '' });
  }
  return violations;
}

if (import.meta.main) {
  const violations = runAll();
  for (const v of violations) console.log(`✗ ${v.file}:${v.line}  ${v.rule}\n    ${v.text}`);
  console.log(violations.length ? `check-promises: ${violations.length} violations` : 'check-promises: every promise holds');
  process.exit(violations.length ? 1 : 0);
}
