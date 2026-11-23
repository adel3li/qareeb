/**
 * Copies hadith narrations into the cards, by collection and number, from the open
 * sunnah.com dataset (fawazahmed0/hadith-api). Current scope: al-Bukhari and Muslim
 * only (decide() in src/lib/hadithGrade.ts defers everything else).
 *
 * Fills `hadith.fullNarration`, `hadith.gradings` (as the dataset records them) and
 * `hadith.sourceUrl`. Never writes `text`: the excerpt is the reviewer's decision.
 * A narration with a corrupted character is refused: it must be copied from a second
 * source (Dorar) by hand, never repaired.
 *
 * Usage: bun scripts/fetch-hadith.ts [dua_0003 …]
 */
import { decide } from '../src/lib/hadithGrade';
import { readCards, writeCard } from './lib/cards';
import { findByNumber, loadEdition, sunnahUrl } from './lib/hadith';
import { hasCorruption, hasPlaceholder } from './lib/text';

const only = new Set(process.argv.slice(2));
let errors = 0;

for (const card of readCards()) {
  const d = card.data as { id: string; text: string; hadith?: Record<string, unknown> };
  if (!d.hadith || (only.size && !only.has(d.id))) continue;
  const h = d.hadith as { collectionId?: string; number: string; fullNarration: string; gradings: unknown; sourceUrl: string };
  const collectionId = h.collectionId ?? '';
  const scope = decide(collectionId, []);
  if (scope.decision !== 'include') {
    console.error(`✗ ${d.id}: ${collectionId || 'no collectionId'}: ${scope.reason}`);
    errors++;
    continue;
  }
  try {
    const found = findByNumber(await loadEdition(collectionId), h.number);
    if (!found) throw new Error(`${collectionId} ${h.number} not found in the dataset`);
    if (hasCorruption(found.text)) {
      throw new Error(`${collectionId} ${h.number} has a corrupted character in the dataset; copy it from a second source (Dorar) and record that in hadith.sourceUrl`);
    }
    h.fullNarration = found.text;
    h.gradings = (found.grades ?? []).map((g) => ({ by: g.name, grade: g.grade }));
    h.sourceUrl = sunnahUrl(collectionId, found);
    if (!hasPlaceholder(d.text) && !found.text.includes(d.text)) {
      console.error(`✗ ${d.id}: text is not a verbatim part of ${collectionId} ${h.number}`);
      errors++;
    }
    writeCard(card.file, d);
    console.log(`✓ ${d.id}: ${collectionId} ${h.number} (narration ${found.arabicnumber}) copied`);
  } catch (e) {
    console.error(`✗ ${d.id}: ${(e as Error).message}`);
    errors++;
  }
}

process.exit(errors ? 1 : 0);
