import { describe, expect, it } from 'vitest';
import { clampSize, parseSize } from './TextSizeStepper';

describe('text size field', () => {
  it('reads both digit sets', () => {
    expect(parseSize('١٨')).toBe(18);
    expect(parseSize('18')).toBe(18);
    expect(parseSize('')).toBeNull();
  });
  it('corrects only into range, keeping the old value for nonsense', () => {
    expect(clampSize(parseSize('1'), 16)).toBe(14);
    expect(clampSize(parseSize('99'), 16)).toBe(24);
    expect(clampSize(parseSize('abc'), 16)).toBe(16);
  });
});
