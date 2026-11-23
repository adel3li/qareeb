import { normalizeArabic } from '../../src/lib/arabicSearch';
import { hasPlaceholder } from '../../src/lib/placeholders';

export { hasPlaceholder };

/**
 * Folds text for comparing letters between sources: normalizeArabic (no marks,
 * one alef form, …) plus no digits of any script (the King Fahd text ends each
 * verse with its number) and no Qur'anic pause or end-of-verse signs.
 */
export function foldLetters(text: string): string {
  return normalizeArabic(text.replace(/[۝۞۩]/g, ' '))
    .replace(/[0-9٠-٩۰-۹]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Same as foldLetters, without spaces (word joins differ between Uthmani and modern
 * spelling) and without the standalone hamza, which the sources encode differently
 * (a hamza on the line in one, a hamza mark in the other).
 */
export function foldLettersNoSpace(text: string): string {
  return foldLetters(text).replace(/[ ء]/g, '');
}

/** Text between ﴿ ﴾ (Qur'an quotations) in a string. */
export function quranFragments(text: string): string[] {
  return [...text.matchAll(/﴿([^﴿﴾]*)﴾/g)].map((m) => m[1].trim()).filter(Boolean);
}

/** Text between « » (exact quotations) in a string. */
export function quoteFragments(text: string): string[] {
  return [...text.matchAll(/«([^«»]*)»/g)].map((m) => m[1].trim()).filter(Boolean);
}

/** True when the source contains a character that shows it was damaged in transfer. */
export function hasCorruption(text: string): boolean {
  // U+FFFD replacement character, C0/C1 controls other than whitespace, a lone surrogate.
  return /[�\u0000-\u0008\u000B\u000C\u000E-\u001F\u0080-\u009F]|[\uD800-\uDFFF]/.test(text);
}
