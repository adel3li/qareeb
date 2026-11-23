import { describe, expect, it } from 'vitest';
import { layoutShareCard, SHARE_HEIGHT, wrapWords, type Measure } from './shareLayout';

// Every character is 0.5em wide: predictable, no DOM.
const measure: Measure = (text, font) => text.length * font.size * 0.5;

const words = (n: number) => Array.from({ length: n }, (_, i) => `كلمة${i}`).join(' ');

const base = {
  format: 'post' as const,
  kindLabel: 'من القرآن',
  title: 'عنوان للتجربة',
  sacredKind: 'quran' as const,
  reference: 'مرجع للتجربة',
  tag: 'سطر للتجربة',
};

describe('wrapWords', () => {
  it('keeps every word, in order, and never splits one', () => {
    const text = words(40);
    const lines = wrapWords(text, 300, { family: 'ui', size: 30, weight: 400 }, measure);
    expect(lines.join(' ')).toBe(text);
    expect(lines.length).toBeGreaterThan(1);
  });

  it('gives an over-long word a line of its own instead of cutting it', () => {
    const lines = wrapWords('قصير ' + 'ط'.repeat(100) + ' قصير', 200, { family: 'ui', size: 30, weight: 400 }, measure);
    expect(lines).toEqual(['قصير', 'ط'.repeat(100), 'قصير']);
  });
});

describe('layoutShareCard', () => {
  it('uses the largest size for short text, inside the standard canvas', () => {
    const l = layoutShareCard({ ...base, sacred: words(4) }, measure);
    expect(l.sacred.font.size).toBe(84);
    expect(l.height).toBe(SHARE_HEIGHT.post);
  });

  it('steps the size down as the text grows', () => {
    const sizes = [3, 15, 30, 60].map((n) => layoutShareCard({ ...base, sacred: words(n) }, measure).sacred.font.size);
    expect(sizes[0]).toBe(84);
    expect(sizes.at(-1)).toBeLessThan(sizes[0]);
    expect([...sizes].sort((a, b) => b - a)).toEqual(sizes);
  });

  it('never cuts: very long text keeps every word and the canvas grows', () => {
    const text = words(200);
    for (const format of ['post', 'story'] as const) {
      const l = layoutShareCard({ ...base, format, sacred: text }, measure);
      expect(l.sacred.font.size).toBe(48);
      expect(l.sacred.lines.join(' ')).toBe(text);
      expect(l.height).toBeGreaterThan(SHARE_HEIGHT[format]);
      const sacredBottom = l.sacred.y + l.sacred.lines.length * 48 * 2.05;
      expect(sacredBottom).toBeLessThanOrEqual(l.ref.y);
      expect(l.ref.y).toBeLessThan(l.arch.y + l.arch.height);
      expect(l.foot.logoY + l.foot.logoHeight).toBeLessThanOrEqual(l.height);
    }
  });

  it('adds the scene line or a reflection below the arch, above the foot', () => {
    const l = layoutShareCard({ ...base, sacred: words(6), extra: { kind: 'scene', lead: 'الموقف ·', text: words(8) } }, measure);
    expect(l.extra).not.toBeNull();
    expect(l.extra!.y).toBeGreaterThan(l.arch.y + l.arch.height);
    expect(l.extra!.y).toBeLessThan(l.foot.ruleY);
    expect(l.extra!.lines.join(' ')).toContain('الموقف ·');
  });

  it('the story format starts lower and is taller', () => {
    const post = layoutShareCard({ ...base, sacred: words(6) }, measure);
    const story = layoutShareCard({ ...base, format: 'story', sacred: words(6) }, measure);
    expect(story.chip.y - post.chip.y).toBe(200);
    expect(story.height).toBe(SHARE_HEIGHT.story);
  });

  it('uses the hadith steps for hadith', () => {
    const l = layoutShareCard({ ...base, sacredKind: 'hadith', sacred: words(4) }, measure);
    expect(l.sacred.font).toMatchObject({ family: 'ui', size: 60, weight: 500 });
  });
});
