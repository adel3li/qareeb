/**
 * bun run fetch-quran [dua_0001 …]
 *
 * Copies quran.fullText from the King Fahd Complex text in content/sources, by
 * surah and ayah, and checks its letters against Tanzil's Uthmani text. Never
 * edits a verse. The dua (`text`) must be a verbatim part of it: where the
 * excerpt starts and ends is the reviewer's decision; a card whose text is a
 * placeholder gets the whole range. `--check` compares without writing.
 */
import { QURAN_EDITION_ID } from './lib/edition.ts';
import { readCardFiles, writeCard } from './lib/cards.ts';
import { lettersMatchTanzil, qpcRange } from './lib/quran.ts';
import { findPlaceholders } from './lib/text.ts';

interface Card {
  id: string;
  kind: string;
  text: string;
  quran?: { surah: number; ayahFrom: number; ayahTo: number; fullText: string; edition: string };
}

const args = process.argv.slice(2);
const check = args.includes('--check');
const ids = args.filter((a) => !a.startsWith('--'));
let failed = false;

for (const { file, path, raw } of readCardFiles()) {
  const card = raw as Card;
  if (card.kind !== 'quran' || !card.quran) continue;
  if (ids.length && !ids.includes(card.id)) continue;
  const q = card.quran;
  const source = qpcRange(q.surah, q.ayahFrom, q.ayahTo);
  if (!lettersMatchTanzil(q.surah, q.ayahFrom, q.ayahTo)) {
    console.error(`${file}: letters of ${q.surah}:${q.ayahFrom}-${q.ayahTo} differ from Tanzil; check the sources`);
    failed = true;
    continue;
  }
  if (check) {
    const same = q.fullText === source && q.edition === QURAN_EDITION_ID;
    console.log(`${file}: ${same ? 'matches the source' : 'DIFFERS from the source'}`);
    if (!same) failed = true;
    continue;
  }
  q.fullText = source;
  q.edition = QURAN_EDITION_ID;
  if (findPlaceholders(card.text).length > 0 || card.text === '') card.text = source;
  if (!source.includes(card.text)) {
    console.error(`${file}: text is not a verbatim part of the verses; the excerpt is the reviewer's decision`);
    failed = true;
  }
  writeCard(path, card);
  console.log(`${file}: copied ${q.surah}:${q.ayahFrom}-${q.ayahTo}`);
}
if (failed) process.exit(1);
