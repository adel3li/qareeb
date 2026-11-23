/**
 * Applies an edit file from content/edits/ to its card. An edit chooses sacred
 * text by word position, so excerpts are copied by code, never typed:
 *
 *   { "id": "dua_0003",
 *     "textWords": [47, 73],                         // text = words 47–73 of the full verse(s) or narration
 *     "glossary": [{ "words": [50, 51], "meaning": "…" }],  // each term copied by position, with its meaning
 *     "set": { "title": "…", "review": { … } } }     // authored and transmitted fields, merged in
 *
 *   bun scripts/apply-edit.ts content/edits/fill-dua_0003.json
 */
import { readFileSync } from 'node:fs';
import { readCards, writeCard } from './lib/cards';
import { sliceWords } from './lib/words';

export interface Edit {
  id: string;
  textWords?: [number, number];
  glossary?: { words: [number, number]; meaning: string }[];
  set?: Record<string, unknown>;
}

const SACRED_KEYS = new Set(['fullText', 'fullNarration']);

function merge(target: Record<string, any>, patch: Record<string, any>, path: string[] = []): void {
  for (const [key, value] of Object.entries(patch)) {
    if (SACRED_KEYS.has(key) || (path.length === 0 && key === 'text')) throw new Error(`An edit may not set ${[...path, key].join('.')}: sacred text is copied by position or by script`);
    if (value && typeof value === 'object' && !Array.isArray(value) && target[key] && typeof target[key] === 'object') {
      merge(target[key], value as Record<string, any>, [...path, key]);
    } else {
      target[key] = value;
    }
  }
}

/** Returns the card with the edit applied (the input is not changed). */
export function applyEdit(card: Record<string, any>, edit: Edit): Record<string, any> {
  const next = structuredClone(card);
  const source: string | undefined = next.quran?.fullText ?? next.hadith?.fullNarration;
  if (edit.set) merge(next, edit.set);
  if (edit.textWords || edit.glossary) {
    if (!source) throw new Error(`${edit.id}: no full text to take words from; run fetch-quran or fetch-hadith first`);
    if (edit.textWords) next.text = sliceWords(source, ...edit.textWords);
    if (edit.glossary) {
      next.meaning ??= {};
      next.meaning.glossary = edit.glossary.map((g) => ({ term: sliceWords(source, ...g.words), meaning: g.meaning }));
    }
  }
  return next;
}

if (import.meta.main) {
  const files = process.argv.slice(2);
  if (!files.length) {
    console.error('Usage: bun scripts/apply-edit.ts content/edits/<file>.json …');
    process.exit(1);
  }
  const cards = readCards();
  for (const file of files) {
    const edit = JSON.parse(readFileSync(file, 'utf8')) as Edit;
    const card = cards.find((c) => c.data.id === edit.id);
    if (!card) throw new Error(`${file}: no card ${edit.id}`);
    card.data = applyEdit(card.data, edit);
    writeCard(card);
    console.log(`✓ ${file} → ${edit.id}`);
  }
}
