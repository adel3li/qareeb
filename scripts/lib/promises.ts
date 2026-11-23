/**
 * The product promises as code checks (docs/handoff/05-technical-blueprint.md §10).
 * Pure: takes file contents, returns violations, so it is tested on samples.
 */

export interface SourceFile {
  path: string;
  text: string;
}

export interface Violation {
  path: string;
  line: number;
  rule: string;
  excerpt: string;
}

/** Network calls allowed in src/: none in the first version. */
export const NETWORK_ALLOW_LIST: string[] = [];

/** Interface copy that names streaks only to promise their absence. */
export const STREAK_COPY_ALLOWED = ['بلا سلاسل', 'ولا أيام متتالية', 'لا نقاط، ولا أيام متتالية'];

const RULES: { rule: string; pattern: RegExp; applies: (path: string) => boolean }[] = [
  { rule: 'no streaks, points or badges in code', pattern: /\b(streaks?|consecutive|badges?|points|leaderboard|score)\b/i, applies: (p) => p.startsWith('src/') },
  { rule: 'no network request from src/', pattern: /\bfetch\s*\(|XMLHttpRequest|sendBeacon|new\s+WebSocket|EventSource\s*\(/, applies: (p) => p.startsWith('src/') && !NETWORK_ALLOW_LIST.includes(p) },
  { rule: 'no UTC day keys', pattern: /toISOString\(\)\s*\.\s*(slice\(\s*0\s*,\s*10\s*\)|split\(\s*['"]T['"]\s*\)\s*\[\s*0\s*\])/, applies: (p) => !p.endsWith('.test.ts') },
  { rule: 'no new Date("YYYY-MM-DD")', pattern: /new Date\(\s*['"`]\d{4}-\d{2}-\d{2}['"`]\s*\)/, applies: (p) => p.startsWith('src/') && !p.endsWith('.test.ts') },
  { rule: 'pinch zoom stays allowed', pattern: /user-scalable\s*=\s*no|maximum-scale/i, applies: (p) => p.endsWith('.html') || p.startsWith('src/') },
  { rule: 'no external <link> or <script> in html', pattern: /<(link|script)[^>]+(href|src)=["']https?:\/\//i, applies: (p) => p.endsWith('.html') },
  { rule: 'colours only through tokens', pattern: /#[0-9a-fA-F]{3,8}\b(?![\w-])|\brgba?\(|\bhsla?\(/, applies: (p) => p.startsWith('src/') && !p.endsWith('tokens.css') && !p.endsWith('.test.ts') && !p.endsWith('.json') },
  { rule: 'no developer tools in production', pattern: /\b(devMode|developerMode|debugPanel)\b/, applies: (p) => p.startsWith('src/') },
  { rule: 'the privacy promise is written exactly', pattern: /لا شيء يغادر جهازك/, applies: () => true },
  { rule: 'no claim of scholarly review', pattern: /مراجَع من العلماء|مراجع من العلماء|راجعه العلماء|مراجَع علميًا/, applies: (p) => p.startsWith('src/') || p.endsWith('.html') },
];

const STREAK_COPY = /متتالي|سلاسل|سلسلة/;

export function checkPromises(files: SourceFile[]): Violation[] {
  const out: Violation[] = [];
  for (const file of files) {
    const lines = file.text.split('\n');
    lines.forEach((line, i) => {
      for (const r of RULES) {
        if (r.applies(file.path) && r.pattern.test(line)) out.push({ path: file.path, line: i + 1, rule: r.rule, excerpt: line.trim().slice(0, 120) });
      }
      if (file.path.startsWith('src/') && STREAK_COPY.test(line) && !STREAK_COPY_ALLOWED.some((ok) => line.includes(ok))) {
        out.push({ path: file.path, line: i + 1, rule: 'streak words only where they promise their absence', excerpt: line.trim().slice(0, 120) });
      }
    });
  }
  return out;
}
