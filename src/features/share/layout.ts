/**
 * Layout of the share image (ShareCard component), as pure functions over a
 * text-measuring callback, so it can be tested without a canvas.
 * Sacred text is never cut: its size steps down, then the image grows.
 */

export type Format = 'post' | 'story';
export type Level = 'dua' | 'scene' | 'reflection';

export const WIDTH = 1080;
export const BASE_HEIGHT: Record<Format, number> = { post: 1350, story: 1920 };
export const PAD_X = 96;
export const PAD_TOP: Record<Format, number> = { post: 88, story: 288 };
export const PAD_BOTTOM = 88;
export const GAP = 40;
export const QURAN_SIZES = [84, 72, 58, 48];
export const HADITH_SIZES = [60, 52, 44, 38];
export const ARCH = { padTop: 190, padX: 56, padBottom: 56, refSize: 34, refGap: 20 };

export type Measure = (text: string, font: string) => number;

/** Greedy word wrap on ordinary spaces only (a no-break space keeps a verse number with its word). Never drops a word. */
export function wrap(text: string, maxWidth: number, font: string, measure: Measure): string[] {
  const lines: string[] = [];
  for (const paragraph of text.split('\n')) {
    let line = '';
    for (const word of paragraph.split(' ').filter(Boolean)) {
      const next = line ? `${line} ${word}` : word;
      if (line && measure(next, font) > maxWidth) {
        lines.push(line);
        line = word;
      } else {
        line = next;
      }
    }
    if (line) lines.push(line);
  }
  return lines;
}

export interface Block {
  lines: string[];
  size: number;
  lineHeight: number;
  height: number;
}

export function block(text: string, maxWidth: number, font: string, size: number, lineHeight: number, measure: Measure): Block {
  const lines = wrap(text, maxWidth, font, measure);
  return { lines, size, lineHeight, height: lines.length * size * lineHeight };
}

export interface Plan {
  height: number;
  sacred: Block;
  /** Height of the arch box. */
  archHeight: number;
  /** Space the fixed blocks take (everything but the arch). */
  fixedHeight: number;
}

/**
 * Chooses the largest sacred size whose arch fits the room left by the other
 * blocks; at the smallest size, grows the image so nothing is cut.
 */
export function planSacred(opts: {
  format: Format;
  fixedHeight: number;
  sacredText: string;
  quran: boolean;
  fontFor: (size: number) => string;
  measure: Measure;
}): Plan {
  const { format, fixedHeight, sacredText, quran, fontFor, measure } = opts;
  const sizes = quran ? QURAN_SIZES : HADITH_SIZES;
  const lh = quran ? 2.05 : 2;
  const innerWidth = WIDTH - 2 * PAD_X - 2 * ARCH.padX;
  const room = BASE_HEIGHT[format] - fixedHeight;
  const archFor = (b: Block) => ARCH.padTop + b.height + ARCH.refGap + ARCH.refSize * 1.6 + ARCH.padBottom;
  let chosen: Block | null = null;
  for (const size of sizes) {
    const b = block(sacredText, innerWidth, fontFor(size), size, lh, measure);
    chosen = b;
    if (archFor(b) <= room) return { height: BASE_HEIGHT[format], sacred: b, archHeight: room, fixedHeight };
  }
  const archHeight = archFor(chosen!);
  return { height: fixedHeight + archHeight, sacred: chosen!, archHeight, fixedHeight };
}
