/**
 * Builds src/content/generated/duas.json, the content the app loads, behind the review gate.
 *
 * - Production (default): only cards at CONTENT_MIN_LEVEL or above (`verified` by the
 *   owner's decision; `approved` once a named reviewer exists).
 * - Preview (CONTENT_PREVIEW=1): every card, drafts included; the app marks them.
 * - CONTENT_GATE=strict (the production `bun run build`): fails when fewer than
 *   CONTENT_MIN_COUNT cards (default 30) pass the gate. Without it (dev, lint, tests)
 *   the file is written and the shortfall is only reported.
 *
 * Every build validates all cards first and fails on any content error.
 */
import fs from 'node:fs';
import path from 'node:path';
import { WELCOME_DUA_ID } from '../src/config';
import { builtContentSchema, REVIEW_STATUSES } from '../src/content/schema';
import { LEVEL_RANK, type Dua, type DuaCard, type ReviewStatus } from '../src/content/types';
import { readCards } from './lib/cards';
import { GENERATED_FILE } from './lib/paths';
import { tanzilVerses, versesText } from './lib/quran';
import { printIssues, validateAll } from './validate-content';

const preview = process.env.CONTENT_PREVIEW === '1';
const strict = process.env.CONTENT_GATE === 'strict';
const minLevel = (process.env.CONTENT_MIN_LEVEL || 'verified') as ReviewStatus;
const minCount = Number(process.env.CONTENT_MIN_COUNT || 30);

if (!REVIEW_STATUSES.includes(minLevel) || LEVEL_RANK[minLevel] < LEVEL_RANK.verified) {
  console.error(`build-content: CONTENT_MIN_LEVEL must be "verified" or "approved", got "${minLevel}"`);
  process.exit(1);
}

const files = readCards();
if (!printIssues(validateAll(files), files.length)) {
  console.error('build-content: content errors, nothing written');
  process.exit(1);
}

const cards = files.map((f) => f.data as unknown as DuaCard);

/** Modern spelling for search: Tanzil simple for the Qur'an, the narration for hadith. */
function searchText(card: DuaCard): string {
  if (card.quran) return versesText(tanzilVerses('simple'), card.quran.surah, card.quran.ayahFrom, card.quran.ayahTo);
  if (card.hadith) return card.hadith.fullNarration;
  return '';
}

const counts: Record<string, number> = Object.fromEntries(REVIEW_STATUSES.map((s) => [s, 0]));
for (const c of cards) counts[c.review.status] += 1;

const passing = cards.filter((c) => LEVEL_RANK[c.review.status] >= LEVEL_RANK[minLevel]);
const included = preview ? cards : passing;
const duas: Dua[] = included.sort((a, b) => a.order - b.order).map((c) => ({ ...c, searchText: searchText(c) }));

const out = builtContentSchema.parse({ preview, minLevel, welcomeId: WELCOME_DUA_ID, counts, duas });

if (!preview && passing.length < minCount) {
  const msg =
    `build-content: ${passing.length} of ${cards.length} cards reach "${minLevel}"; production needs at least ${minCount} ` +
    `(${Object.entries(counts).filter(([, n]) => n).map(([s, n]) => `${s}: ${n}`).join(', ')}).`;
  if (strict) {
    console.error(`${msg}\nThe production build stops here. Use CONTENT_PREVIEW=1 for a preview build with drafts.`);
    process.exit(1);
  }
  console.warn(`! ${msg} (not strict: written anyway)`);
}

fs.mkdirSync(path.dirname(GENERATED_FILE), { recursive: true });
fs.writeFileSync(GENERATED_FILE, JSON.stringify(out) + '\n');
console.log(`build-content: ${duas.length} cards written (${preview ? 'preview, drafts included' : `production, ${minLevel} and above`})`);
