/**
 * Copies quran.fullText for every Qur'an card from the King Fahd Complex text in
 * content/sources/ (by surah and ayah), and compares its letters with Tanzil's
 * Uthmani text as a second source. Nothing is typed: the text comes from the file.
 *
 *   bun scripts/fetch-quran.ts            # fill fullText in content/duas/*.json
 *   bun scripts/fetch-quran.ts --check    # change nothing; fail if a card differs from the source
 */
import { readCards, writeCard, PLACEHOLDER } from './lib/cards';
import { KNOWN_LETTER_DIFFERENCES, letterSkeleton, qpcRange, qpcVerse, tanzilUthmaniVerse } from './lib/quran';

export const EDITION = 'kfgqpc-hafs/api.quran.com:text_qpc_hafs';

export function checkQuranCard(card: Record<string, any>): string[] {
  const errors: string[] = [];
  const q = card.quran;
  if (!q) return errors;
  let expected: string;
  try {
    expected = qpcRange(q.surah, q.ayahFrom, q.ayahTo);
  } catch (e) {
    return [`${card.id}: ${(e as Error).message}`];
  }
  if (q.fullText !== expected) errors.push(`${card.id}: quran.fullText does not match ${q.surah}:${q.ayahFrom}-${q.ayahTo} in the source file`);
  if (q.edition !== EDITION) errors.push(`${card.id}: quran.edition must be "${EDITION}"`);
  if (!PLACEHOLDER.test(card.text) && !expected.includes(card.text)) {
    errors.push(`${card.id}: text is not a verbatim excerpt of quran.fullText`);
  }
  for (let a = q.ayahFrom; a <= q.ayahTo; a++) {
    const key = `${q.surah}:${a}`;
    if (KNOWN_LETTER_DIFFERENCES.has(key)) continue;
    const t = tanzilUthmaniVerse(q.surah, a);
    if (!t || letterSkeleton(qpcVerse(q.surah, a)!) !== letterSkeleton(t)) {
      errors.push(`${card.id}: the letters of ${key} differ between the King Fahd text and Tanzil`);
    }
  }
  return errors;
}

if (import.meta.main) {
  const check = process.argv.includes('--check');
  let failed = false;
  for (const card of readCards()) {
    if (card.data.kind !== 'quran') continue;
    const q = card.data.quran;
    if (!check) {
      q.fullText = qpcRange(q.surah, q.ayahFrom, q.ayahTo);
      q.edition = EDITION;
      writeCard(card);
    }
    const errors = checkQuranCard(card.data);
    errors.forEach((e) => console.error('✗', e));
    if (errors.length) failed = true;
    else console.log(`✓ ${card.data.id}: ${q.surahName} ${q.ayahFrom}–${q.ayahTo}`);
  }
  process.exit(failed ? 1 : 0);
}
