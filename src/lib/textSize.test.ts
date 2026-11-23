import { describe, expect, it } from 'vitest';
import { parseFontScale } from './textSize';

describe('text size field', () => {
  it('accepts both digit sets and clamps on blur', () => {
    expect(parseFontScale('١٨', 16)).toBe(18);
    expect(parseFontScale('18', 16)).toBe(18);
    expect(parseFontScale('1', 16)).toBe(14);
    expect(parseFontScale('99', 16)).toBe(24);
    expect(parseFontScale('', 20)).toBe(20);
    expect(parseFontScale('abc', 20)).toBe(20);
  });
});
