/**
 * Applies an edit spec to a card. Used to fill cards, and to bring back edits made in the
 * content editor artifact.
 *
 *   bun scripts/apply-card.ts edits/dua_0002.json [more.json …]
 *
 * A spec:
 *   {
 *     "id": "dua_0002",
 *     "textWords": [14, 24],                 // the dua: words copied from quran.fullText or hadith.fullNarration
 *     "glossary": [{ "words": [19, 19], "meaning": "…" }],   // each term copied from the same source by position
 *     "set": { "hook": "…", "context": { … }, "review": { … } }   // any other field, replaced whole
 *   }
 *
 * Sacred text is never taken from the spec: `set` may not contain `text`, `quran` or
 * `hadith.fullNarration`, and glossary terms come only from word positions. The card is
 * validated afterwards; nothing is written if it fails the schema.
 */
import fs from 'node:fs';
import path from 'node:path';
import { duaSchema } from '../src/content/schema';
import { writeCard } from './lib/cards';
import { DUAS_DIR } from './lib/paths';
import { copyWords } from './lib/wordRange';

interface Spec {
  id: string;
  textWords?: [number, number];
  glossary?: { words: [number, number]; meaning: string }[];
  set?: Record<string, unknown>;
}

const FORBIDDEN_SET = ['text', 'quran', 'id', 'kind'];

export function applySpec(card: Record<string, unknown>, spec: Spec): Record<string, unknown> {
  const next: Record<string, unknown> = structuredClone(card);
  const set = spec.set ?? {};
  for (const key of FORBIDDEN_SET) {
    if (key in set) throw new Error(`${spec.id}: "${key}" cannot be set from a spec`);
  }
  if (set.hadith !== undefined) {
    const h = set.hadith as Record<string, unknown>;
    if ('fullNarration' in h) throw new Error(`${spec.id}: hadith.fullNarration is copied by fetch-hadith, never set`);
    set.hadith = { ...(card.hadith as Record<string, unknown>), ...h };
  }
  if (set.meaning && typeof set.meaning === 'object' && 'glossary' in (set.meaning as object)) {
    throw new Error(`${spec.id}: glossary terms come from "glossary" word ranges, not from "set"`);
  }
  if (set.meaning !== undefined) {
    // Summary and sources replace; the glossary stays unless word ranges are given below.
    set.meaning = { ...(card.meaning as Record<string, unknown>), ...(set.meaning as Record<string, unknown>) };
  }
  Object.assign(next, set);

  const quran = next.quran as { fullText?: string } | undefined;
  const hadith = next.hadith as { fullNarration?: string } | undefined;
  const source = quran?.fullText ?? hadith?.fullNarration;
  if ((spec.textWords || spec.glossary) && !source) throw new Error(`${spec.id}: no copied source text to take words from`);

  if (spec.textWords) next.text = copyWords(source!, spec.textWords[0], spec.textWords[1]);
  if (spec.glossary) {
    const meaning = { ...(next.meaning as Record<string, unknown>) };
    meaning.glossary = spec.glossary.map((g) => ({ term: copyWords(source!, g.words[0], g.words[1]), meaning: g.meaning }));
    next.meaning = meaning;
  }
  return next;
}

if (import.meta.main) {
  const files = process.argv.slice(2);
  if (files.length === 0) {
    console.error('usage: bun scripts/apply-card.ts <spec.json> [more.json …]');
    process.exit(2);
  }
  let failed = false;
  for (const f of files) {
    const spec = JSON.parse(fs.readFileSync(f, 'utf8')) as Spec;
    const file = path.join(DUAS_DIR, `${spec.id}.json`);
    try {
      const card = JSON.parse(fs.readFileSync(file, 'utf8'));
      const next = applySpec(card, spec);
      const parsed = duaSchema.safeParse(next);
      if (!parsed.success) throw new Error(parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; '));
      writeCard(file, next);
      console.log(`apply-card: ${spec.id} updated`);
    } catch (e) {
      failed = true;
      console.error(`apply-card: ${spec.id}: ${(e as Error).message}`);
    }
  }
  process.exit(failed ? 1 : 0);
}
