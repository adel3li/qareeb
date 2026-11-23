import { describe, expect, it } from 'vitest';
import { fitText, isWhole, wrapWords, type Measure } from './shareLayout';
import { shareText, sourceReference } from './reference';

const measure: Measure = (t, size) => t.length * size * 0.5;
const neutral = Array.from({ length: 60 }, (_, i) => `كلمة${i}`).join(' ');

describe('share image layout', () => {
  it('wraps without losing a word', () => {
    const lines = wrapWords(neutral, 400, 40, measure);
    expect(lines.length).toBeGreaterThan(1);
    expect(isWhole(neutral, lines)).toBe(true);
    lines.forEach((l) => expect(measure(l, 40) <= 400 || !l.includes(' ')).toBe(true));
  });
  it('steps the size down until the text fits, and never cuts it', () => {
    const fit = fitText(neutral, [84, 72, 58, 48], 2, 900, 1400, measure);
    expect(fit.fits).toBe(true);
    expect(fit.fontSize).toBeLessThan(84);
    expect(isWhole(neutral, fit.lines)).toBe(true);
  });
  it('reports when even the smallest size needs a taller image, keeping the whole text', () => {
    const fit = fitText(neutral, [84, 48], 2, 300, 200, measure);
    expect(fit.fits).toBe(false);
    expect(fit.fontSize).toBe(48);
    expect(isWhole(neutral, fit.lines)).toBe(true);
  });
});

describe('share text', () => {
  const quranDua = { kind: 'quran' as const, title: 'عنوان', text: 'نص تجريبي', sceneLine: 'سطر الموقف', quran: { surah: 1, surahName: 'الفاتحة', ayahFrom: 6, ayahTo: 7, fullText: '', edition: '' } };
  it('formats the reference in Arabic digits', () => {
    expect(sourceReference(quranDua)).toBe('سورة الفاتحة: ٦–٧');
  });
  it('builds the copy text with marks and link, nothing else', () => {
    expect(shareText(quranDua, 'https://x.test/#/dua/dua_0001')).toBe('«عنوان»\n﴿نص تجريبي﴾\n[سورة الفاتحة: ٦–٧]\n\nسطر الموقف\n— قريب  https://x.test/#/dua/dua_0001');
  });
});
