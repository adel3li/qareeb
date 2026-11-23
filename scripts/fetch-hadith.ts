/**
 * bun run fetch-hadith [dua_0003 …]
 *
 * Copies hadith.fullNarration and hadith.gradings, verbatim, from the open
 * sunnah.com dataset by collection and number (al-Bukhari and Muslim only for
 * now: decide() in src/lib/hadithGrade.ts defers every other collection).
 * Never edits the text. Refuses a narration with a corrupted character: that
 * one must be pasted from a second source (Dorar, or the printed edition).
 * `--check` compares without writing.
 */
import { decide } from '../src/lib/hadithGrade.ts';
import { readCardFiles, writeCard } from './lib/cards.ts';
import { DATASET_URL, findNarration, type DatasetEdition } from './lib/hadith.ts';
import { corruptedCharacters, findPlaceholders } from './lib/text.ts';

interface HadithFields {
  collectionId: string;
  number: string;
  sourceUrl: string;
  fullNarration: string;
  gradings: { by: string; grade: string }[];
}
interface Card {
  id: string;
  kind: string;
  text: string;
  hadith?: HadithFields;
}

const args = process.argv.slice(2);
const check = args.includes('--check');
const ids = args.filter((a) => !a.startsWith('--'));
const editions = new Map<string, DatasetEdition>();
let failed = false;

async function edition(collectionId: string): Promise<DatasetEdition> {
  const cached = editions.get(collectionId);
  if (cached) return cached;
  const res = await fetch(DATASET_URL(collectionId));
  if (!res.ok) throw new Error(`Could not download ${collectionId}: ${res.status}`);
  const data = (await res.json()) as DatasetEdition;
  editions.set(collectionId, data);
  return data;
}

for (const { file, path, raw } of readCardFiles()) {
  const card = raw as Card;
  if (card.kind !== 'sunnah' || !card.hadith) continue;
  if (ids.length && !ids.includes(card.id)) continue;
  const h = card.hadith;
  const decision = decide(h.collectionId, []);
  if (decision.decision !== 'include') {
    console.error(`${file}: ${h.collectionId} is not copied now (${decision.reason})`);
    failed = true;
    continue;
  }
  const found = findNarration(await edition(h.collectionId), h.number, h.sourceUrl);
  if (!found) {
    console.error(`${file}: ${h.collectionId} ${h.number} not found in the dataset`);
    failed = true;
    continue;
  }
  const bad = corruptedCharacters(found.text);
  if (bad.length) {
    console.error(`${file}: the dataset's text has corrupted characters (${bad.join(' ')}); paste it from a second source instead`);
    failed = true;
    continue;
  }
  const gradings = found.grades.map((g) => ({ by: g.name, grade: g.grade }));
  if (check) {
    const same = h.fullNarration === found.text && JSON.stringify(h.gradings) === JSON.stringify(gradings);
    console.log(`${file}: ${same ? 'matches the source' : 'DIFFERS from the source'}`);
    if (!same) failed = true;
    continue;
  }
  h.fullNarration = found.text;
  h.gradings = gradings;
  if (findPlaceholders(card.text).length === 0 && !found.text.includes(card.text)) {
    console.error(`${file}: text is not a verbatim part of the narration; the excerpt is the reviewer's decision`);
    failed = true;
  }
  writeCard(path, card);
  console.log(`${file}: copied ${h.collectionId} ${h.number}`);
}
if (failed) process.exit(1);
