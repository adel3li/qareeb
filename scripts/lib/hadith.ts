/**
 * Lookup in the open sunnah.com dataset (fawazahmed0/hadith-api), which
 * scripts/fetch-hadith.ts copies narrations from. Pure functions over the
 * downloaded edition, so tests run on neutral text.
 */

export const DATASET_URL = (collectionId: string) =>
  `https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/ara-${collectionId}.min.json`;

export interface DatasetHadith {
  hadithnumber: number;
  /** The book's own numbering (Abd al-Baqi for Muslim), with a suffix per narration: "2705.01". */
  arabicnumber?: string | number;
  text: string;
  grades: { name: string; grade: string }[];
  reference: { book: number; hadith: number };
}

export interface DatasetEdition {
  hadiths: DatasetHadith[];
}

/** "https://sunnah.com/muslim/48/63" → { book: 48, hadith: 63 }. */
export function referenceFromUrl(url: string): { book: number; hadith: number } | null {
  const m = /sunnah\.com\/[a-z]+\/(\d+)\/(\d+)/.exec(url);
  return m ? { book: Number(m[1]), hadith: Number(m[2]) } : null;
}

/**
 * Finds the narration: by its sunnah.com page (book/hadith) when the URL has
 * one, otherwise the first narration under the book's own number.
 */
export function findNarration(edition: DatasetEdition, number: string, sourceUrl?: string): DatasetHadith | undefined {
  const ref = sourceUrl ? referenceFromUrl(sourceUrl) : null;
  if (ref) {
    const byRef = edition.hadiths.find((h) => h.reference.book === ref.book && h.reference.hadith === ref.hadith);
    if (byRef) {
      const base = String(byRef.arabicnumber ?? byRef.hadithnumber).split('.')[0];
      if (base !== number) throw new Error(`The page ${sourceUrl} holds number ${base}, not ${number}`);
      return byRef;
    }
  }
  const candidates = edition.hadiths
    .filter((h) => String(h.arabicnumber ?? h.hadithnumber).split('.')[0] === number)
    .sort((a, b) => Number(a.arabicnumber ?? a.hadithnumber) - Number(b.arabicnumber ?? b.hadithnumber));
  return candidates[0];
}
