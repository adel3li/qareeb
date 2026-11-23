import { describe, expect, it } from 'vitest';
import { BASE_HEIGHT, planSacred, wrap } from './layout';

// Each character is as wide as the font size in px times 0.5: a stand-in for measureText.
const measure = (text: string, font: string) => text.length * Number(/(\d+)px/.exec(font)![1]) * 0.5;
const fontFor = (size: number) => `${size}px test`;
// Neutral Arabic words, not sacred text.
const words = (n: number) => Array.from({ length: n }, (_, i) => `كلمة${i}`).join(' ');

describe('share layout', () => {
  it('wraps without dropping or reordering a word, and keeps no-break spaces', () => {
    const text = `${words(30)} نهاية ٧`;
    const lines = wrap(text, 400, '40px test', measure);
    expect(lines.join(' ')).toBe(text);
    expect(lines.every((l) => !l.startsWith(' '))).toBe(true);
  });

  it('keeps the largest size when the text fits', () => {
    const plan = planSacred({ format: 'post', fixedHeight: 500, sacredText: words(6), quran: true, fontFor, measure });
    expect(plan.sacred.size).toBe(84);
    expect(plan.height).toBe(BASE_HEIGHT.post);
  });

  it('steps the size down for long text', () => {
    const plan = planSacred({ format: 'post', fixedHeight: 500, sacredText: words(40), quran: true, fontFor, measure });
    expect(plan.sacred.size).toBeLessThan(84);
  });

  it('grows the image instead of cutting very long text', () => {
    const text = words(400);
    const plan = planSacred({ format: 'story', fixedHeight: 600, sacredText: text, quran: true, fontFor, measure });
    expect(plan.sacred.size).toBe(48);
    expect(plan.height).toBeGreaterThan(BASE_HEIGHT.story);
    expect(plan.sacred.lines.join(' ')).toBe(text);
  });
});
