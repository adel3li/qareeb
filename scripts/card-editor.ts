/**
 * The bridge between the cards and the content-editor artifact.
 *
 *   bun scripts/card-editor.ts export <out-dir>     card → editor document (one JSON per card)
 *   bun scripts/card-editor.ts import <doc.json>…   editor document → apply-card spec on stdout dir content/edits/
 *
 * The editor never carries sacred text back: it sends word positions, and apply-card copies
 * the words from quran.fullText / hadith.fullNarration. Imported edits send the card back to
 * `pending_verification` (its checks reset), because changed text must be verified again.
 */
import fs from 'node:fs';
import path from 'node:path';
import { readCards } from './lib/cards';
import { sourceWords } from './lib/wordRange';

type Range = [number, number];

/** The word range of `part` inside `source`, searching from word `from`. */
export function findRange(source: string, part: string, from = 1): Range | null {
  const words = sourceWords(source);
  for (let i = from - 1; i < words.length; i++) {
    const start = words[i].start;
    if (!source.startsWith(part, start)) continue;
    const end = start + part.length;
    const last = words.findIndex((w) => w.end === end);
    if (last >= i) return [i + 1, last + 1];
  }
  return null;
}

function referenceOf(card: any): string {
  if (card.quran) {
    const q = card.quran;
    return `${q.surahName} ${q.ayahFrom}${q.ayahTo !== q.ayahFrom ? `–${q.ayahTo}` : ''}`;
  }
  return `${card.hadith.collection} ${card.hadith.number}`;
}

export function toEditorDoc(card: any): Record<string, unknown> {
  const source: string = card.quran?.fullText ?? card.hadith?.fullNarration ?? '';
  const textWords = findRange(source, card.text);
  const glossary = (card.meaning.glossary as { term: string; meaning: string }[]).map((g) => ({
    words: findRange(source, g.term, textWords?.[0] ?? 1),
    meaning: g.meaning,
  }));
  return {
    id: card.id,
    kind: card.kind,
    sacredKind: card.kind === 'quran' ? 'quran' : 'hadith',
    reference: referenceOf(card),
    sourceName: card.quran ? 'نص مجمع الملك فهد (api.quran.com)' : 'sunnah.com',
    source: { words: sourceWords(source).map((w) => w.text) },
    textWords,
    glossary,
    fields: {
      title: card.title,
      shortTitle: card.shortTitle,
      hook: card.hook,
      speaker: card.speaker,
      sceneLine: card.sceneLine,
      context: card.context,
      meaning: { summary: card.meaning.summary, basis: card.meaning.basis },
      reflections: card.reflections,
      steps: card.steps,
      whenToSay: card.whenToSay ?? null,
      journalPrompt: card.journalPrompt,
      themes: card.themes,
    },
    review: card.review,
  };
}

const RESET_CHECKS = (kind: string) => ({
  textMatchesSource: false,
  referenceCorrect: false,
  gradeConfirmed: kind === 'quran',
  excerptApproved: false,
  contextFaithful: false,
  meaningSourced: false,
  quotedFragmentsMatch: false,
  authoredReviewed: false,
  secondSourceMatched: kind === 'quran',
});

/** An editor document → an apply-card spec. */
export function toSpec(doc: any, card: any): Record<string, unknown> {
  const f = doc.fields;
  const set: Record<string, unknown> = {
    title: f.title,
    shortTitle: f.shortTitle,
    hook: f.hook,
    speaker: f.speaker,
    sceneLine: f.sceneLine,
    context: f.context,
    meaning: { summary: f.meaning.summary, basis: f.meaning.basis },
    reflections: f.reflections,
    steps: f.steps.map((s: any) => ({ type: s.type, durationSec: Number(s.durationSec), text: s.text })),
    whenToSay: f.whenToSay ?? undefined,
    journalPrompt: f.journalPrompt,
    themes: f.themes,
    review: {
      ...card.review,
      status: 'pending_verification',
      checks: RESET_CHECKS(card.kind),
      verification: { by: '', at: null, report: '' },
      notes: `${card.review.notes}\nعُدّلت من محرر البطاقات في ${doc.editedAt ?? ''}.`.trim(),
    },
  };
  return { id: doc.id, textWords: doc.textWords, glossary: doc.glossary, set };
}

if (import.meta.main) {
  const [cmd, ...args] = process.argv.slice(2);
  if (cmd === 'export') {
    const out = args[0] ?? 'editor-docs';
    fs.mkdirSync(out, { recursive: true });
    for (const { data } of readCards()) {
      fs.writeFileSync(path.join(out, `${data.id}.json`), JSON.stringify(toEditorDoc(data), null, 2) + '\n');
      console.log(`card-editor: exported ${data.id}`);
    }
  } else if (cmd === 'import') {
    const cards = new Map(readCards().map((c) => [c.data.id, c.data]));
    fs.mkdirSync('content/edits', { recursive: true });
    for (const file of args) {
      const doc = JSON.parse(fs.readFileSync(file, 'utf8'));
      const card = cards.get(doc.id);
      if (!card) throw new Error(`no card ${doc.id}`);
      const target = path.join('content/edits', `editor-${doc.id}.json`);
      fs.writeFileSync(target, JSON.stringify(toSpec(doc, card), null, 2) + '\n');
      console.log(`card-editor: wrote ${target}; apply it with bun scripts/apply-card.ts ${target}`);
    }
  } else {
    console.error('usage: bun scripts/card-editor.ts export <dir> | import <doc.json>…');
    process.exit(2);
  }
}
