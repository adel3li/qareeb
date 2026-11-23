/**
 * bun run build-content: writes src/content/generated/duas.json for the app.
 *
 * Production: only cards at CONTENT_MIN_LEVEL or above (default `verified`, by
 * the owner's decision ٦; `approved` once a reviewer exists).
 * CONTENT_PREVIEW=1: every card; the app marks drafts.
 * CONTENT_MIN_COUNT: the build fails below this many cards (default 1 while the
 * catalogue is being filled; the launch target is 60).
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { duaSchema } from '../src/content/schema.ts';
import { buildContent, parseLevel } from './lib/buildContent.ts';
import { readCardFiles } from './lib/cards.ts';
import { GENERATED_DIR } from './lib/paths.ts';
import { tanzilRange } from './lib/quran.ts';

const preview = process.env.CONTENT_PREVIEW === '1';
const minLevel = parseLevel(process.env.CONTENT_MIN_LEVEL, 'verified');
const minCount = Number(process.env.CONTENT_MIN_COUNT ?? 1);

const cards = readCardFiles().map(({ file, raw }) => {
  const parsed = duaSchema.safeParse(raw);
  if (!parsed.success) throw new Error(`${file} is not a valid card; run bun run validate-content`);
  return parsed.data;
});

const content = buildContent(cards, {
  preview,
  minLevel,
  minCount,
  searchSpelling: (s, a, b) => tanzilRange('simple', s, a, b),
});

mkdirSync(GENERATED_DIR, { recursive: true });
writeFileSync(join(GENERATED_DIR, 'duas.json'), JSON.stringify(content));
console.log(
  `build-content: ${content.duas.length} card(s) written (${preview ? 'preview, drafts included' : `minimum level ${minLevel}`})`,
);
