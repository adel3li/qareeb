/**
 * Writes src/content/generated/duas.json, the only content the app loads.
 *
 * The review gate (03 §8): a production build holds only cards at
 * CONTENT_MIN_LEVEL or above ('verified' by the owner's decision ٦, 'approved'
 * once a named reviewer exists). A preview build (CONTENT_PREVIEW=1) holds every
 * card, and the app marks those below the gate «مسودة».
 *
 *   CONTENT_MIN_LEVEL   verified | approved   (default: verified)
 *   CONTENT_MIN_COUNT   fail a production build with fewer cards (default: 1; the launch minimum is 60, decision ١٠)
 *   CONTENT_PREVIEW=1   include drafts, marked
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { ContentBundle, Dua } from '../src/content/types';
import { REVIEW_LEVELS, type ReviewLevel } from '../src/content/schema';
import { WELCOME_DUA_ID } from '../src/config';
import { ROOT } from './lib/cards';
import { tanzilSimpleVerse } from './lib/quran';
import { LEVEL_RANK, validateAll } from './lib/validate';

const minLevel = (process.env.CONTENT_MIN_LEVEL ?? 'verified') as ReviewLevel;
if (minLevel !== 'verified' && minLevel !== 'approved') {
  console.error(`CONTENT_MIN_LEVEL must be "verified" or "approved", not "${minLevel}"`);
  process.exit(1);
}
const preview = process.env.CONTENT_PREVIEW === '1';
const minCount = Number(process.env.CONTENT_MIN_COUNT ?? 1);

const { errors, warnings, cards } = validateAll();
warnings.forEach((w) => console.warn('! ' + w));
if (errors.length) {
  errors.forEach((e) => console.error('✗ ' + e));
  console.error('build-content: content has errors; run `bun run validate-content`.');
  process.exit(1);
}

const passes = (level: ReviewLevel) => LEVEL_RANK[level] >= LEVEL_RANK[minLevel];
const included = cards.filter((c) => preview || passes(c.review.status));

if (!preview) {
  if (included.length < minCount) {
    console.error(`build-content: ${included.length} cards at ${minLevel} or above; this build needs at least ${minCount}.`);
    process.exit(1);
  }
  if (!included.some((c) => c.id === WELCOME_DUA_ID)) {
    console.error(`build-content: the welcome dua ${WELCOME_DUA_ID} is not at ${minLevel}.`);
    process.exit(1);
  }
}

const duas: Dua[] = included
  .map(({ review, ...card }) => {
    // Modern-spelling copy of the verses, for search only (Uthmani spelling differs from what people type).
    const searchExtra = card.quran
      ? Array.from({ length: card.quran.ayahTo - card.quran.ayahFrom + 1 }, (_, i) => tanzilSimpleVerse(card.quran!.surah, card.quran!.ayahFrom + i) ?? '').join(' ')
      : '';
    return { ...card, level: review.status, isDraft: !passes(review.status), searchExtra };
  })
  .sort((a, b) => a.order - b.order);

const levelCounts = Object.fromEntries(REVIEW_LEVELS.map((l) => [l, included.filter((c) => c.review.status === l).length])) as Record<ReviewLevel, number>;
const bundle: ContentBundle = { minLevel, preview, builtAt: new Date().toISOString(), duas, levelCounts };

const out = join(ROOT, 'src', 'content', 'generated');
mkdirSync(out, { recursive: true });
writeFileSync(join(out, 'duas.json'), JSON.stringify(bundle));
console.log(`build-content: ${duas.length} cards (${preview ? 'preview, drafts included' : `${minLevel} and above`}) → src/content/generated/duas.json`);
