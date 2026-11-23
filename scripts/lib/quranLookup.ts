import { lettersMatchTanzil, qpcRange, qpcVerses, quranLetters } from './quran.ts';
import type { QuranLookup } from './validate.ts';

let allLetters: string | null = null;

/** The lookup over the copied sources in content/sources. */
export function quranLookup(): QuranLookup {
  return {
    range: qpcRange,
    lettersMatch: lettersMatchTanzil,
    fragmentExists(fragment) {
      if (!allLetters) allLetters = Object.values(qpcVerses()).map(quranLetters).join('');
      const letters = quranLetters(fragment);
      return letters.length > 0 && allLetters.includes(letters);
    },
  };
}
