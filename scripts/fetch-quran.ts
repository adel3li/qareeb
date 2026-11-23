/**
 * Copies Qur'an text into the cards, by surah and ayah, from the King Fahd Complex
 * text kept in content/sources/quran-qpc-hafs.json (api.quran.com, text_qpc_hafs).
 * It fills `quran.fullText` and `quran.edition` and never writes `text`: the
 * excerpt that is the dua is the reviewer's decision.
 *
 * Second check: the letters (marks, digits and spaces removed) are compared with
 * Tanzil's Uthmani text for the same verses.
 *
 * Usage: bun scripts/fetch-quran.ts [dua_0002 …]
 */
import { readCards, writeCard } from './lib/cards';
import { QPC_EDITION, qpcVerses, tanzilVerses, versesText } from './lib/quran';
import { foldLettersNoSpace, hasPlaceholder } from './lib/text';

const only = new Set(process.argv.slice(2));
let errors = 0;

for (const card of readCards()) {
  const d = card.data as { id: string; text: string; quran?: Record<string, unknown> };
  if (!d.quran || (only.size && !only.has(d.id))) continue;
  const { surah, ayahFrom, ayahTo } = d.quran as { surah: number; ayahFrom: number; ayahTo: number };
  try {
    const fullText = versesText(qpcVerses(), surah, ayahFrom, ayahTo);
    const second = versesText(tanzilVerses('uthmani'), surah, ayahFrom, ayahTo);
    if (foldLettersNoSpace(fullText) !== foldLettersNoSpace(second)) {
      console.warn(`! ${d.id}: letters differ from Tanzil Uthmani for ${surah}:${ayahFrom}-${ayahTo}; report to the reviewer`);
    }
    const changed = d.quran.fullText !== fullText;
    d.quran.fullText = fullText;
    d.quran.edition = QPC_EDITION;
    if (!hasPlaceholder(d.text) && !fullText.includes(d.text)) {
      console.error(`✗ ${d.id}: text is not a verbatim part of ${surah}:${ayahFrom}-${ayahTo}`);
      errors++;
    }
    writeCard(card.file, d);
    console.log(`✓ ${d.id}: ${surah}:${ayahFrom}-${ayahTo} ${changed ? 'copied' : 'unchanged'}`);
  } catch (e) {
    console.error(`✗ ${d.id}: ${(e as Error).message}`);
    errors++;
  }
}

process.exit(errors ? 1 : 0);
