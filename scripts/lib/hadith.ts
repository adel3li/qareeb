/**
 * The open hadith dataset (fawazahmed0/hadith-api, from sunnah.com). Narrations are
 * looked up by the collection's own number (`arabicnumber`, Muhammad Fuad Abd al-Baqi's
 * numbering for Muslim); when a number has several narrations the first is used.
 */
export const DATASET = 'https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions';

export interface DatasetHadith {
  hadithnumber: number;
  arabicnumber: string | number;
  text: string;
  grades?: { name: string; grade: string }[];
  reference?: { book: number; hadith: number };
}

export interface Edition {
  hadiths: DatasetHadith[];
}

const cache = new Map<string, Edition>();

export async function loadEdition(collectionId: string): Promise<Edition> {
  const hit = cache.get(collectionId);
  if (hit) return hit;
  const url = `${DATASET}/ara-${collectionId}.min.json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  const data = (await res.json()) as Edition;
  cache.set(collectionId, data);
  return data;
}

/** The first narration under a collection number, e.g. "2705" matches "2705" or "2705.01". */
export function findByNumber(edition: Edition, number: string): DatasetHadith | undefined {
  const matches = edition.hadiths.filter((h) => String(h.arabicnumber ?? '').split('.')[0] === number);
  matches.sort((a, b) => Number(a.arabicnumber) - Number(b.arabicnumber));
  return matches[0];
}

/** The sunnah.com page for a narration, by its in-book reference. */
export function sunnahUrl(collectionId: string, h: DatasetHadith): string {
  return h.reference ? `https://sunnah.com/${collectionId}/${h.reference.book}/${h.reference.hadith}` : `https://sunnah.com/${collectionId}`;
}
