import { describe, expect, it } from 'vitest';
import { clampFontScale, parseDigits } from './fontScale';

describe('text size', () => {
  it('reads both digit sets', () => {
    expect(parseDigits('18')).toBe(18);
    expect(parseDigits('١٨')).toBe(18);
    expect(parseDigits('')).toBeNaN();
  });
  it('corrects only into range, keeping the previous value for nonsense', () => {
    expect(clampFontScale(18)).toBe(18);
    expect(clampFontScale(1)).toBe(14);
    expect(clampFontScale(99)).toBe(24);
    expect(clampFontScale(Number.NaN, 20)).toBe(20);
  });
});
