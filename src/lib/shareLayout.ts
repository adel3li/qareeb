/**
 * Line wrapping and fitting for the share image, independent of canvas so it
 * is tested. Sacred text is never cut: the size steps down, and when even the
 * smallest size does not fit, the caller grows the image (story format).
 */

export type Measure = (text: string, fontSize: number) => number;

/** Greedy word wrap. A single word wider than the line stays whole on its own line. */
export function wrapWords(text: string, maxWidth: number, fontSize: number, measure: Measure): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (!line || measure(candidate, fontSize) <= maxWidth) line = candidate;
    else {
      lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

export interface Fit {
  fontSize: number;
  lines: string[];
  height: number;
  /** False when even the smallest size needs more than maxHeight: grow the image. */
  fits: boolean;
}

/** The largest size from `sizes` at which the text fits in the box; the smallest one otherwise, whole. */
export function fitText(text: string, sizes: readonly number[], lineHeight: number, maxWidth: number, maxHeight: number, measure: Measure): Fit {
  let last: Fit | null = null;
  for (const fontSize of sizes) {
    const lines = wrapWords(text, maxWidth, fontSize, measure);
    const height = lines.length * fontSize * lineHeight;
    last = { fontSize, lines, height, fits: height <= maxHeight };
    if (last.fits) return last;
  }
  if (!last) throw new Error('fitText needs at least one size');
  return last;
}

/** The joined lines contain every word of the text, in order: nothing was cut. */
export function isWhole(text: string, lines: readonly string[]): boolean {
  return lines.join(' ').split(/\s+/).join(' ') === text.split(/\s+/).filter(Boolean).join(' ');
}
