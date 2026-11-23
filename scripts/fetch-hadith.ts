/**
 * Copies a hadith's full narration and its gradings from the open sunnah.com
 * dataset (fawazahmed0/hadith-api) into a card, by collection and number.
 * Current scope (decision ٧): al-Bukhari and Muslim only; decide() in
 * src/lib/hadithGrade.ts defers every other collection.
 *
 *   bun scripts/fetch-hadith.ts dua_0003              # copy using the card's hadith.collectionId and number
 *   bun scripts/fetch-hadith.ts dua_0003 --variant 2  # the second narration under that number (Muslim's 2705.02)
 *   bun scripts/fetch-hadith.ts --check               # change nothing; compare every sunnah card with the dataset
 *
 * A narration with a character outside the expected set is reported as corrupted
 * and not written: copy it from a second source (Dorar, the printed edition)
 * into hadith.fullNarration by hand-pasting, never by typing.
 */
import { readCards, writeCard } from './lib/cards';
import { decide } from '../src/lib/hadithGrade';

const DATASET = (collection: string) =>
  `https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/ara-${collection}.min.json`;

interface Entry {
  hadithnumber: number;
  arabicnumber?: string;
  text: string;
  grades: { name: string; grade: string }[];
  reference: { book: number; hadith: number };
}

/** Characters a narration may contain; anything else is a sign of a corrupted copy. */
const ALLOWED = /^[؀-ۿ\s‌‎‏"'.,:;()\[\]{}*\-–—!?«»]*$/u;

export function suspiciousChars(text: string): string[] {
  return [...new Set([...text].filter((c) => !ALLOWED.test(c) || c === '�'))];
}

export function findNarration(entries: Entry[], number: string, variant = 1): Entry | undefined {
  const byArabic = entries.filter((e) => e.arabicnumber !== undefined && String(e.arabicnumber).split('.')[0] === number);
  const pool = byArabic.length ? byArabic : entries.filter((e) => String(e.hadithnumber) === number);
  return pool[variant - 1];
}

const cache = new Map<string, Entry[]>();
async function load(collection: string): Promise<Entry[]> {
  if (!cache.has(collection)) {
    const res = await fetch(DATASET(collection));
    if (!res.ok) throw new Error(`Could not fetch the ${collection} dataset: HTTP ${res.status}`);
    cache.set(collection, ((await res.json()) as { hadiths: Entry[] }).hadiths);
  }
  return cache.get(collection)!;
}

async function main() {
  const args = process.argv.slice(2);
  const check = args.includes('--check');
  const vIndex = args.indexOf('--variant');
  const variant = vIndex >= 0 ? Number(args[vIndex + 1]) : 1;
  const ids = args.filter((a, i) => a.startsWith('dua_') && args[i - 1] !== '--variant');
  let failed = false;
  for (const card of readCards()) {
    const h = card.data.hadith;
    if (card.data.kind !== 'sunnah' || !h) continue;
    if (!check && !ids.includes(card.data.id)) continue;
    const scope = decide(h.collectionId, h.gradings ?? []);
    if (scope.decision !== 'include') {
      console.error(`✗ ${card.data.id}: ${scope.reason}`);
      failed = true;
      continue;
    }
    const entries = await load(h.collectionId);
    const found = check
      ? entries.find((e) => e.text === h.fullNarration)
      : findNarration(entries, String(h.number), variant);
    if (!found) {
      console.error(`✗ ${card.data.id}: ${check ? 'fullNarration matches no narration in the dataset' : `no ${h.collectionId} ${h.number} in the dataset`}`);
      failed = true;
      continue;
    }
    const bad = suspiciousChars(found.text);
    if (bad.length) {
      console.error(`✗ ${card.data.id}: the dataset's text has unexpected characters (${bad.map((c) => `U+${c.codePointAt(0)!.toString(16)}`).join(' ')}). Copy it from a second source.`);
      failed = true;
      continue;
    }
    if (!check) {
      h.fullNarration = found.text;
      h.gradings = found.grades.map((g) => ({ by: g.name, grade: g.grade }));
      h.sourceUrl = `https://sunnah.com/${h.collectionId}/${found.reference.book}/${found.reference.hadith}`;
      writeCard(card);
    }
    if (!h.fullNarration.includes(card.data.text) && !/<<.*>>/.test(card.data.text)) {
      console.error(`✗ ${card.data.id}: text is not a verbatim excerpt of hadith.fullNarration`);
      failed = true;
      continue;
    }
    console.log(`✓ ${card.data.id}: ${h.collection} ${h.number} (${h.sourceUrl})`);
  }
  process.exit(failed ? 1 : 0);
}

if (import.meta.main) await main();
