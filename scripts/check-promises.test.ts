import { describe, expect, it } from 'vitest';
import { checkIndexHtml, checkText } from './check-promises';

const rules = (file: string, text: string) => checkText(file, text).map((v) => v.rule);

describe('check-promises', () => {
  it('flags streaks and points, but not words that contain them', () => {
    expect(rules('src/a.ts', 'const streak = 3;')).toHaveLength(1);
    expect(rules('src/a.ts', 'pointer-events: none;')).toHaveLength(0);
  });

  it('allows Arabic streak words only in promises of their absence', () => {
    expect(rules('src/copy/ar.ts', "x: 'بلا سلاسل، بلا نقاط'")).toHaveLength(0);
    expect(rules('src/copy/ar.ts', "x: 'حافظ على سلسلتك'")).toHaveLength(1);
    expect(rules('src/copy/ar.ts', "x: 'خمسة أيام متتالية'")).toHaveLength(1);
  });

  it('flags network requests', () => {
    expect(rules('src/a.ts', 'await fetch(url)')).toHaveLength(1);
    expect(rules('src/a.ts', 'navigator.sendBeacon(u)')).toHaveLength(1);
  });

  it('flags UTC day keys', () => {
    expect(rules('src/a.ts', 'd.toISOString().slice(0, 10)')).toHaveLength(1);
    expect(rules('src/a.ts', "d.toISOString().split('T')[0]")).toHaveLength(1);
    expect(rules('src/a.ts', "new Date('2026-11-23')")).toHaveLength(1);
  });

  it('flags colours outside tokens.css, but not hash routes', () => {
    expect(rules('src/a.tsx', "style={{ color: '#fff' }}")).toHaveLength(1);
    expect(rules('src/a.css', 'color: rgb(0 0 0);')).toHaveLength(1);
    expect(rules('src/styles/tokens.css', '--page: #e7e4de;')).toHaveLength(0);
    expect(rules('src/a.tsx', "href='#/today'")).toHaveLength(0);
    expect(rules('src/a.tsx', 'className="bg-red-500 text-white"')).toHaveLength(1);
    expect(rules('src/a.tsx', 'className="bg-surface text-text-muted"')).toHaveLength(0);
  });

  it('flags the wrong privacy wording and claims of scholarly review', () => {
    expect(rules('src/copy/ar.ts', "'لا شيء يغادر جهازك'")).toHaveLength(1);
    expect(rules('src/copy/ar.ts', "'ما تكتبه لا يغادر جهازك'")).toHaveLength(0);
    expect(rules('src/copy/ar.ts', "'مراجَع من العلماء'")).toHaveLength(1);
    expect(rules('src/copy/ar.ts', "'والمراجعة العلمية جارية'")).toHaveLength(0);
  });

  it('flags external links and zoom blocking in index.html', () => {
    expect(checkIndexHtml('index.html', '<link rel="stylesheet" href="https://fonts.example/x.css">')).toHaveLength(1);
    expect(checkIndexHtml('index.html', '<link rel="icon" href="favicon.svg">')).toHaveLength(0);
    expect(checkIndexHtml('index.html', '<meta name="viewport" content="width=device-width, maximum-scale=1">')).toHaveLength(1);
  });
});
