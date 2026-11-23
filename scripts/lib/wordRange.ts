/**
 * Copies a run of words out of a source text by position, keeping the source's own
 * characters and spacing. This is how the dua text and the glossary terms are set: the
 * person chooses the first and last word, and the words themselves are copied, never typed.
 *
 * Words are runs of non-space characters, counted from 1, as `sourceWords` lists them.
 */

export interface Word {
  /** 1-based position. */
  n: number;
  text: string;
  start: number;
  end: number;
}

export function sourceWords(source: string): Word[] {
  const words: Word[] = [];
  const re = /\S+/g;
  for (let m = re.exec(source); m; m = re.exec(source)) {
    words.push({ n: words.length + 1, text: m[0], start: m.index, end: m.index + m[0].length });
  }
  return words;
}

/** The verbatim slice of `source` from word `from` to word `to`, inclusive. */
export function copyWords(source: string, from: number, to: number): string {
  const words = sourceWords(source);
  if (!Number.isInteger(from) || !Number.isInteger(to) || from < 1 || to < from || to > words.length) {
    throw new Error(`word range ${from}–${to} is outside 1–${words.length}`);
  }
  return source.slice(words[from - 1].start, words[to - 1].end);
}
