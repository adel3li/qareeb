import { describe, expect, it } from 'vitest';
import { applySpec } from './apply-card';
import { findRange } from './card-editor';
import { copyWords, sourceWords } from './lib/wordRange';

// Neutral Arabic only: no verse or hadith in tests.
const SOURCE = 'نص  تجريبي أول، ثم «كلمات» للاختبار ١';

describe('word ranges', () => {
  it('copies the source characters exactly, spacing included', () => {
    expect(sourceWords(SOURCE).map((w) => w.n)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(copyWords(SOURCE, 1, 2)).toBe('نص  تجريبي');
    expect(copyWords(SOURCE, 5, 7)).toBe('«كلمات» للاختبار ١');
    expect(() => copyWords(SOURCE, 0, 2)).toThrow();
    expect(() => copyWords(SOURCE, 3, 2)).toThrow();
    expect(() => copyWords(SOURCE, 6, 9)).toThrow();
  });

  it('finds a copied part back as a word range', () => {
    expect(findRange(SOURCE, 'ثم «كلمات»')).toEqual([4, 5]);
    expect(findRange(SOURCE, 'غير موجود')).toBeNull();
  });
});

describe('applySpec', () => {
  const card = { id: 'dua_0009', kind: 'quran', text: '<<x>>', quran: { fullText: SOURCE }, meaning: { glossary: [], summary: 's', basis: [] } };

  it('sets the dua and glossary terms from word positions only', () => {
    const next = applySpec(card, { id: 'dua_0009', textWords: [3, 6], glossary: [{ words: [4, 5], meaning: 'معنى' }], set: { hook: 'جملة' } }) as any;
    expect(next.text).toBe('أول، ثم «كلمات» للاختبار');
    expect(next.meaning.glossary).toEqual([{ term: 'ثم «كلمات»', meaning: 'معنى' }]);
    expect(next.hook).toBe('جملة');
    expect(card.text).toBe('<<x>>');
  });

  it('refuses sacred text typed into a spec', () => {
    expect(() => applySpec(card, { id: 'dua_0009', set: { text: 'نص' } })).toThrow();
    expect(() => applySpec(card, { id: 'dua_0009', set: { quran: {} } })).toThrow();
    expect(() => applySpec(card, { id: 'dua_0009', set: { meaning: { glossary: [] } } })).toThrow();
    const hadithCard = { ...card, kind: 'sunnah', quran: undefined, hadith: { fullNarration: SOURCE } };
    expect(() => applySpec(hadithCard, { id: 'dua_0009', set: { hadith: { fullNarration: 'نص' } } })).toThrow();
  });
});
