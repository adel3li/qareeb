import { normalizeArabic } from '../../src/lib/arabicSearch.ts';

/** Placeholders left for text still to be copied or written: <<…>> and [[…]]. */
export const PLACEHOLDER = /<<[^>]*>>|\[\[[^\]]*\]\]/g;

export function findPlaceholders(text: string): string[] {
  return text.match(PLACEHOLDER) ?? [];
}

/** Fragments quoted between ﴿ ﴾ (Qur'an) in a piece of text. */
export function quranQuotes(text: string): string[] {
  return [...text.matchAll(/﴿([^﴾]*)﴾/g)].map((m) => m[1].trim()).filter(Boolean);
}

/** Fragments quoted between « » in a piece of text. */
export function guillemetQuotes(text: string): string[] {
  return [...text.matchAll(/«([^»]*)»/g)].map((m) => m[1].trim()).filter(Boolean);
}

/** True when `part`, ignoring marks and letter forms, occurs in `whole`. */
export function containsNormalized(whole: string, part: string): boolean {
  const p = normalizeArabic(part);
  return p.length > 0 && normalizeArabic(whole).includes(p);
}

/**
 * Characters that mean a copied text is damaged: the replacement character,
 * stray control characters, or Latin letters inside an Arabic narration.
 */
export function corruptedCharacters(text: string): string[] {
  const found = text.match(/[�\u0000-\u0008\u000B\u000C\u000E-\u001F]|[A-Za-z]/g) ?? [];
  return [...new Set(found)];
}
