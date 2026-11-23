import { describe, expect, it } from 'vitest';
import { checkPromises } from './lib/promises.ts';

const rules = (path: string, text: string) => checkPromises([{ path, text }]).map((v) => v.rule);

describe('check-promises', () => {
  it('flags streaks and points in src', () => {
    expect(rules('src/a.ts', 'const streak = 3;')).toContain('no streaks, points or badges in code');
    expect(rules('src/a.ts', 'const lived = days.length;')).toEqual([]);
  });
  it('flags network requests in src', () => {
    expect(rules('src/a.ts', 'await fetch("/x")')).toContain('no network request from src/');
    expect(rules('src/a.ts', 'navigator.sendBeacon(u)')).toContain('no network request from src/');
  });
  it('flags UTC day keys', () => {
    expect(rules('src/a.ts', 'd.toISOString().slice(0, 10)')).toContain('no UTC day keys');
    expect(rules('src/a.ts', "d.toISOString().split('T')[0]")).toContain('no UTC day keys');
  });
  it('flags zoom blocking and external links', () => {
    expect(rules('index.html', '<meta name="viewport" content="width=device-width, maximum-scale=1">')).toContain('pinch zoom stays allowed');
    expect(rules('index.html', '<link rel="stylesheet" href="https://fonts.googleapis.com/x">')).toContain('no external <link> or <script> in html');
  });
  it('flags colours outside tokens.css', () => {
    expect(rules('src/a.tsx', 'style={{ color: "#fff" }}')).toContain('colours only through tokens');
    expect(rules('src/styles/tokens.css', '--page: #e7e4de;')).toEqual([]);
  });
  it('allows streak words only where they promise their absence', () => {
    expect(rules('src/copy/ar.ts', "title: 'بلا سلاسل، بلا مقارنة'")).toEqual([]);
    expect(rules('src/copy/ar.ts', "label: 'أيام متتالية'")).toContain('streak words only where they promise their absence');
  });
  it('keeps the privacy promise exact', () => {
    expect(rules('src/copy/ar.ts', 'لا شيء يغادر جهازك')).toContain('the privacy promise is written exactly');
  });
});
