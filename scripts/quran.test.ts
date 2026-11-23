import { describe, expect, it } from 'vitest';
import { qpcVerses, quranLetters, tanzilVerses } from './lib/quran.ts';

describe('the copied Qur’an sources', () => {
  it('has every verse in both editions, with the same letters', () => {
    const qpc = qpcVerses();
    const tanzil = tanzilVerses('uthmani');
    expect(Object.keys(qpc)).toHaveLength(6236);
    const mismatched = Object.keys(qpc).filter((k) => quranLetters(qpc[k]) !== quranLetters(tanzil.get(k) ?? ''));
    expect(mismatched).toEqual([]);
  });
});
