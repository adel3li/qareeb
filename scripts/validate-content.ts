/**
 * Checks every dua card in content/duas against docs/handoff/03-content-model.md §7.
 * Fails (exit 1) on any error. Run by CI and by scripts/build-content.ts.
 *
 * Usage: bun scripts/validate-content.ts
 */
import fs from 'node:fs';
import { WELCOME_DUA_ID } from '../src/config';
import { decide } from '../src/lib/hadithGrade';
import { duaSchema, STEP_ORDER } from '../src/content/schema';
import type { DuaCard } from '../src/content/types';
import { readCards, type CardFile } from './lib/cards';
import { RETIRED_IDS_FILE } from './lib/paths';
import { qpcVerses, tanzilVerses, versesText } from './lib/quran';
import { foldLettersNoSpace, hasPlaceholder, quoteFragments, quranFragments } from './lib/text';

export interface Issue {
  id: string;
  level: 'error' | 'warning';
  message: string;
}

/** What the card checks compare against. Tests pass small neutral stand-ins. */
export interface Sources {
  /** "surah:ayah" → King Fahd Complex text. */
  qpc: Record<string, string>;
  /** Every verse folded to bare letters without spaces, joined, for finding ﴿…﴾ fragments (several spellings). */
  quranCorpora: string[];
}

export function loadSources(): Sources {
  const qpc = qpcVerses();
  const fold = (m: Record<string, string>) => Object.values(m).map(foldLettersNoSpace).join('|');
  return { qpc, quranCorpora: [fold(qpc), fold(tanzilVerses('simple')), fold(tanzilVerses('uthmani'))] };
}

const DRAFT_STATUSES = new Set(['draft', 'pending_verification', 'needs_changes']);
const SHOWN_STATUSES = new Set(['verified', 'approved']);

/** Authored-layer strings of a card (layer ج, plus the transmitted lines that sit beside it). */
export function authoredFields(card: DuaCard): { field: string; text: string }[] {
  const out = [
    { field: 'hook', text: card.hook },
    { field: 'sceneLine', text: card.sceneLine },
    { field: 'context.retelling', text: card.context.retelling },
    { field: 'meaning.summary', text: card.meaning.summary },
    { field: 'journalPrompt', text: card.journalPrompt },
    ...card.reflections.map((text, i) => ({ field: `reflections[${i}]`, text })),
    ...card.steps.map((s, i) => ({ field: `steps[${i}].text`, text: s.text })),
    ...card.meaning.glossary.map((g, i) => ({ field: `meaning.glossary[${i}].meaning`, text: g.meaning })),
  ];
  if (card.whenToSay) {
    out.push({ field: 'whenToSay.text', text: card.whenToSay.text });
    if (card.whenToSay.note) out.push({ field: 'whenToSay.note', text: card.whenToSay.note });
  }
  return out;
}

/** Every string in a card, for the placeholder check. */
function allStrings(value: unknown, path = ''): { field: string; text: string }[] {
  if (typeof value === 'string') return [{ field: path, text: value }];
  if (Array.isArray(value)) return value.flatMap((v, i) => allStrings(v, `${path}[${i}]`));
  if (value && typeof value === 'object') {
    return Object.entries(value).flatMap(([k, v]) => allStrings(v, path ? `${path}.${k}` : k));
  }
  return [];
}

/** True when a ﴿…﴾ fragment is found in the Qur'an, letters only. */
export function quranFragmentFound(fragment: string, sources: Sources): boolean {
  const f = foldLettersNoSpace(fragment);
  return f.length > 0 && sources.quranCorpora.some((corpus) => corpus.includes(f));
}

/** Checks one parsed card. `raw` is the JSON as read; the schema decides whether it is a card at all. */
export function checkCard(raw: unknown, sources: Sources): Issue[] {
  const rawId = (raw as { id?: unknown })?.id;
  const id = typeof rawId === 'string' ? rawId : '(no id)';
  const issues: Issue[] = [];
  const error = (message: string) => issues.push({ id, level: 'error', message });
  const warn = (message: string) => issues.push({ id, level: 'warning', message });

  const parsed = duaSchema.safeParse(raw);
  if (!parsed.success) {
    for (const e of parsed.error.issues) error(`schema: ${e.path.join('.') || '(card)'}: ${e.message}`);
    return issues;
  }
  const card = parsed.data;
  const status = card.review.status;
  const isDraft = DRAFT_STATUSES.has(status);
  const isShown = SHOWN_STATUSES.has(status);

  // Kind and its source.
  if (card.kind === 'quran' && !card.quran) error('kind "quran" needs `quran`');
  if (card.kind === 'sunnah' && !card.hadith) error('kind "sunnah" needs `hadith`');
  if (card.kind !== 'quran' && card.quran) error('`quran` on a card that is not kind "quran"');
  if (card.kind !== 'sunnah' && card.hadith) error('`hadith` on a card that is not kind "sunnah"');
  if (card.kind === 'athar') error('kind "athar" is phase three and not built yet');

  // Placeholders: allowed only before verification.
  const placeholders = allStrings(card).filter((s) => hasPlaceholder(s.text));
  if (placeholders.length && !isDraft) {
    for (const p of placeholders) error(`placeholder left in a ${status} card: ${p.field}`);
  }
  const textIsPlaceholder = hasPlaceholder(card.text);

  // Qur'an text against the source file.
  if (card.quran) {
    const q = card.quran;
    if (q.ayahTo < q.ayahFrom) error(`quran.ayahTo (${q.ayahTo}) is before ayahFrom (${q.ayahFrom})`);
    let expected: string | null = null;
    try {
      expected = versesText(sources.qpc, q.surah, q.ayahFrom, q.ayahTo);
    } catch (e) {
      error(`quran: ${(e as Error).message}`);
    }
    if (expected !== null) {
      if (q.fullText === '') error('quran.fullText is empty: run `bun run fetch-quran`');
      else if (q.fullText !== expected) error(`quran.fullText does not match the source for ${q.surah}:${q.ayahFrom}-${q.ayahTo}: run \`bun run fetch-quran\`, never edit it by hand`);
    }
    if (!textIsPlaceholder && !q.fullText.includes(card.text)) error('text is not a verbatim part of quran.fullText');
  }

  // Hadith: scope, source text, grade.
  if (card.hadith) {
    const h = card.hadith;
    const scope = decide(h.collectionId ?? '', h.gradings);
    if (scope.decision !== 'include') error(`hadith: ${h.collectionId ?? 'no collectionId'}: ${scope.reason}`);
    if (h.fullNarration === '') error('hadith.fullNarration is empty: run `bun run fetch-hadith` or paste it from hadith.sourceUrl');
    if (/�/.test(h.fullNarration)) error('hadith.fullNarration has a corrupted character: copy it from a second source');
    if (!textIsPlaceholder && !h.fullNarration.includes(card.text)) error('text is not a verbatim part of hadith.fullNarration');
    if (!h.gradeNote.trim()) error('hadith.gradeNote is empty: a grade is never shown without who graded it');
  }

  // Quotations inside authored text.
  for (const { field, text } of authoredFields(card)) {
    for (const frag of quranFragments(text)) {
      if (!quranFragmentFound(frag, sources)) error(`${field}: ﴿${frag}﴾ is not found in the Qur'an text`);
    }
    for (const frag of quoteFragments(text)) {
      const narration = card.hadith?.fullNarration ?? '';
      const found = narration && foldLettersNoSpace(narration).includes(foldLettersNoSpace(frag));
      if (!found) {
        const msg = `${field}: «${frag}» is not found in this card's hadith; quotation marks are for exact quotations only`;
        if (isShown) error(msg);
        else warn(msg);
      }
    }
  }

  // Guided steps.
  if (card.steps.length !== STEP_ORDER.length) error(`steps: ${card.steps.length} steps, expected ${STEP_ORDER.length}`);
  card.steps.forEach((s, i) => {
    if (s.type !== STEP_ORDER[i]) error(`steps[${i}]: type "${s.type}", expected "${STEP_ORDER[i]}"`);
    if (s.durationSec < 8 || s.durationSec > 30) error(`steps[${i}]: durationSec ${s.durationSec} is outside 8–30`);
  });

  // Review.
  const r = card.review;
  if (status === 'verified' || status === 'approved') {
    if (!r.verification.by.trim() || !r.verification.at || !r.verification.report.trim()) {
      error(`${status} needs review.verification.by, .at and .report`);
    }
    const reviewerOnly = new Set(['excerptApproved', 'authoredReviewed', ...(card.kind === 'sunnah' ? ['secondSourceMatched'] : [])]);
    for (const [check, ok] of Object.entries(r.checks)) {
      if (!ok && (status === 'approved' || !reviewerOnly.has(check))) error(`${status} needs review.checks.${check}`);
    }
  }
  if (status === 'approved' && (!r.approval.reviewer.trim() || !r.approval.at)) {
    error('approved needs review.approval.reviewer and .at');
  }
  if (status !== 'approved' && (r.approval.reviewer.trim() || r.approval.at)) {
    error('review.approval is filled on a card that is not approved');
  }
  return issues;
}

/** Checks across cards: ids, file names, orders, retired ids, the welcome card. */
export function checkCollection(files: { name: string; id: unknown; order: unknown }[], retired: string[], welcomeId: string): Issue[] {
  const issues: Issue[] = [];
  const seenIds = new Map<string, string>();
  const seenOrders = new Map<number, string>();
  for (const f of files) {
    const id = typeof f.id === 'string' ? f.id : '(no id)';
    if (`${id}.json` !== f.name) issues.push({ id, level: 'error', message: `file name ${f.name} does not match the id` });
    if (seenIds.has(id)) issues.push({ id, level: 'error', message: `duplicate id (also in ${seenIds.get(id)})` });
    seenIds.set(id, f.name);
    if (retired.includes(id)) issues.push({ id, level: 'error', message: 'this id was retired and is never reused' });
    if (typeof f.order === 'number') {
      if (seenOrders.has(f.order)) issues.push({ id, level: 'error', message: `duplicate order ${f.order} (also ${seenOrders.get(f.order)})` });
      seenOrders.set(f.order, id);
    }
  }
  if (!seenIds.has(welcomeId)) issues.push({ id: welcomeId, level: 'error', message: 'the welcome dua is missing' });
  return issues;
}

export function validateAll(cards: CardFile[] = readCards()): Issue[] {
  const sources = loadSources();
  const retired: string[] = fs.existsSync(RETIRED_IDS_FILE) ? JSON.parse(fs.readFileSync(RETIRED_IDS_FILE, 'utf8')) : [];
  return [
    ...checkCollection(
      cards.map((c) => ({ name: c.name, id: c.data.id, order: (c.data as { order?: unknown }).order })),
      retired,
      WELCOME_DUA_ID,
    ),
    ...cards.flatMap((c) => checkCard(c.data, sources)),
  ];
}

export function printIssues(issues: Issue[], count: number): boolean {
  const errors = issues.filter((i) => i.level === 'error');
  for (const i of issues) console.log(`${i.level === 'error' ? '✗' : '!'} ${i.id}: ${i.message}`);
  console.log(`validate-content: ${count} cards, ${errors.length} errors, ${issues.length - errors.length} warnings`);
  return errors.length === 0;
}

if (import.meta.main) {
  const cards = readCards();
  process.exit(printIssues(validateAll(cards), cards.length) ? 0 : 1);
}
