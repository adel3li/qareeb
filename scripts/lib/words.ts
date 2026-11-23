/**
 * Excerpts by word position, so an excerpt of a verse or narration is chosen
 * by number and copied by code, never typed. Words are runs of non-space
 * characters (a no-break space counts as a space, so a verse number is its own
 * word). Positions are 1-based and inclusive. The excerpt keeps the source's
 * own separators between its words.
 */
export function wordSpans(source: string): { start: number; end: number }[] {
  return [...source.matchAll(/\S+/gu)].map((m) => ({ start: m.index!, end: m.index! + m[0].length }));
}

export function sliceWords(source: string, from: number, to: number): string {
  const spans = wordSpans(source);
  if (from < 1 || to < from || to > spans.length) {
    throw new Error(`Word range ${from}–${to} is outside the source (${spans.length} words)`);
  }
  return source.slice(spans[from - 1].start, spans[to - 1].end);
}

/** The 1-based word range of `excerpt` inside `source`, or null when it is not a whole-word excerpt. */
export function findWordRange(source: string, excerpt: string): [number, number] | null {
  const spans = wordSpans(source);
  for (let i = 0; i < spans.length; i++) {
    if (!source.startsWith(excerpt, spans[i].start)) continue;
    const endAt = spans[i].start + excerpt.length;
    const j = spans.findIndex((s) => s.end === endAt);
    if (j >= i) return [i + 1, j + 1];
  }
  return null;
}
