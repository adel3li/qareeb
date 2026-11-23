import { describe, expect, it } from 'vitest';
import { findWordRange, sliceWords } from './words';

// Neutral Arabic, not sacred text.
const source = 'كلمة أولى ثانية ٣ رابعة خامسة';

describe('sliceWords', () => {
  it('copies a range with its own separators', () => {
    expect(sliceWords(source, 2, 4)).toBe('أولى ثانية ٣');
    expect(sliceWords(source, 1, 1)).toBe('كلمة');
  });
  it('rejects a range outside the source', () => {
    expect(() => sliceWords(source, 0, 2)).toThrow();
    expect(() => sliceWords(source, 3, 9)).toThrow();
  });
  it('finds the range of a whole-word excerpt', () => {
    expect(findWordRange(source, 'ثانية ٣ رابعة')).toEqual([3, 5]);
    expect(findWordRange(source, 'انية')).toBeNull();
  });
});
