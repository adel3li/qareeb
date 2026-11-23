/**
 * The content checks of docs/handoff/03-content-model.md §7. Used by
 * scripts/validate-content.ts and scripts/build-content.ts.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { DuaSchema, STEP_ORDER, type DuaCard, type ReviewLevel } from '../../src/content/schema';
import { normalizeArabic } from '../../src/lib/arabicSearch';
import { applyEdit, type Edit } from '../apply-edit';
import { checkQuranCard } from '../fetch-quran';
import { suspiciousChars } from '../fetch-hadith';
import { ROOT, PLACEHOLDER, readCards } from './cards';
import { qpcVerse, tanzilSimpleVerse } from './quran';

export const LEVEL_RANK: Record<ReviewLevel, number> = {
  draft: 0,
  needs_changes: 0,
  pending_verification: 1,
  verified: 2,
  approved: 3,
};

export interface Report {
  errors: string[];
  warnings: string[];
  cards: DuaCard[];
}

/** The checks Claude's verification (stage one) must have passed before a card is `verified`. */
const STAGE_ONE_CHECKS = ['textMatchesSource', 'referenceCorrect', 'gradeConfirmed', 'contextFaithful', 'meaningSourced', 'quotedFragmentsMatch'] as const;

let quranIndex: string | null = null;
/** The whole Qur'an, normalised, in both editions: a fragment in ﴿ ﴾ must be found in it. */
function quranHaystack(): string {
  if (quranIndex) return quranIndex;
  const parts: string[] = [];
  for (let s = 1; s <= 114; s++) {
    for (let a = 1; ; a++) {
      const v = qpcVerse(s, a);
      if (v === undefined) break;
      parts.push(normalizeArabic(v), normalizeArabic(tanzilSimpleVerse(s, a) ?? ''));
    }
  }
  quranIndex = ` ${parts.join(' | ')} `;
  return quranIndex;
}

/** Every authored or transmitted string of a card, with its path. Sacred fields are not included. */
function authoredStrings(card: Record<string, any>): [string, string][] {
  const out: [string, string][] = [];
  const add = (path: string, v: unknown) => typeof v === 'string' && out.push([path, v]);
  for (const k of ['title', 'shortTitle', 'hook', 'speaker', 'sceneLine', 'journalPrompt']) add(k, card[k]);
  add('context.retelling', card.context?.retelling);
  add('meaning.summary', card.meaning?.summary);
  card.meaning?.glossary?.forEach((g: any, i: number) => add(`meaning.glossary[${i}].meaning`, g.meaning));
  card.reflections?.forEach((r: string, i: number) => add(`reflections[${i}]`, r));
  card.steps?.forEach((s: any, i: number) => add(`steps[${i}].text`, s.text));
  add('whenToSay.text', card.whenToSay?.text);
  add('whenToSay.note', card.whenToSay?.note);
  return out;
}

export function validateAll(): Report {
  const errors: string[] = [];
  const warnings: string[] = [];
  const cards: DuaCard[] = [];
  const retired: string[] = JSON.parse(readFileSync(join(ROOT, 'content', 'retired-ids.json'), 'utf8'));
  const seenIds = new Set<string>();
  const seenOrders = new Map<number, string>();
  const files = readCards();

  for (const file of files) {
    const raw = file.data;
    const id = String(raw.id);
    const err = (m: string) => errors.push(`${id}: ${m}`);
    const parsed = DuaSchema.safeParse(raw);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) err(`${issue.path.join('.') || '(card)'}: ${issue.message}`);
      continue;
    }
    const card = parsed.data;
    const level = LEVEL_RANK[card.review.status];
    const published = level >= LEVEL_RANK.verified;

    // Ids
    if (basename(file.path) !== `${id}.json`) err(`file name must be ${id}.json`);
    if (seenIds.has(id)) err('duplicate id');
    if (retired.includes(id)) err('this id was retired and may not be reused');
    seenIds.add(id);
    if (seenOrders.has(card.order)) err(`order ${card.order} is also used by ${seenOrders.get(card.order)}`);
    seenOrders.set(card.order, id);

    // Placeholders
    const json = JSON.stringify({ ...card, review: undefined });
    if (PLACEHOLDER.test(json)) (published ? err : (m: string) => warnings.push(`${id}: ${m}`))('a <<…>> or [[…]] placeholder remains');

    // Sacred text
    if (card.kind === 'quran') {
      const q = card.quran!;
      if (!q.fullText || PLACEHOLDER.test(q.fullText)) {
        (published ? err : (m: string) => warnings.push(`${id}: ${m}`))('quran.fullText has not been copied yet (run fetch-quran)');
      } else {
        checkQuranCard(card).forEach((e) => errors.push(e));
      }
      if (q.ayahTo < q.ayahFrom) err('quran.ayahTo is before ayahFrom');
    } else {
      const h = card.hadith!;
      if (!h.fullNarration || PLACEHOLDER.test(h.fullNarration)) {
        (published ? err : (m: string) => warnings.push(`${id}: ${m}`))('hadith.fullNarration has not been copied yet (run fetch-hadith)');
      } else {
        const bad = suspiciousChars(h.fullNarration);
        if (bad.length) err(`hadith.fullNarration has a corrupted character (${bad.map((c) => 'U+' + c.codePointAt(0)!.toString(16)).join(' ')}): copy it from a second source`);
        if (!PLACEHOLDER.test(card.text) && !h.fullNarration.includes(card.text)) err('text is not a verbatim excerpt of hadith.fullNarration');
      }
      if (!h.gradeNote.trim()) err('hadith.gradeNote is empty: no grade is shown without who graded it');
      if (!['bukhari', 'muslim'].includes(h.collectionId)) err(`collection ${h.collectionId} is outside the current scope (al-Bukhari and Muslim)`);
    }

    // Glossary terms are copied from the text
    const sacredSource = card.quran?.fullText ?? card.hadith?.fullNarration ?? '';
    card.meaning.glossary.forEach((g, i) => {
      if (!PLACEHOLDER.test(g.term) && !sacredSource.includes(g.term)) err(`meaning.glossary[${i}].term is not copied from the full text`);
    });

    // Quoted fragments in authored text
    for (const [path, text] of authoredStrings(card)) {
      for (const m of text.matchAll(/﴿([^﴾]+)﴾/g)) {
        const frag = normalizeArabic(m[1]);
        if (frag && !quranHaystack().includes(frag)) err(`${path}: the fragment ﴿${m[1]}﴾ is not in the Qur'an text`);
      }
      for (const m of text.matchAll(/«([^»]+)»/g)) {
        const frag = normalizeArabic(m[1]);
        if (frag && !normalizeArabic(sacredSource).includes(frag) && !quranHaystack().includes(frag)) {
          warnings.push(`${id}: ${path}: «${m[1]}» is not in this card's sacred text; check it against its source`);
        }
      }
    }

    // Steps
    if (card.steps.length !== 5) err(`steps: expected 5, found ${card.steps.length}`);
    card.steps.forEach((s, i) => {
      if (s.type !== STEP_ORDER[i]) err(`steps[${i}].type must be ${STEP_ORDER[i]}`);
      if (s.durationSec < 8 || s.durationSec > 30) err(`steps[${i}].durationSec must be 8–30`);
    });

    // Review
    const r = card.review;
    if (published) {
      if (!r.verification.report.trim() || !r.verification.at) err('a verified card needs a verification report and date');
      for (const c of STAGE_ONE_CHECKS) if (!r.checks[c]) err(`review.checks.${c} must be true for ${r.status}`);
    }
    if (r.status === 'approved') {
      if (!r.approval.reviewer.trim() || !r.approval.at) err('an approved card needs the reviewer\'s name and date');
      for (const [c, v] of Object.entries(r.checks)) if (!v) err(`review.checks.${c} must be true for approved`);
    } else if (r.approval.reviewer || r.approval.at) {
      err('review.approval is set but the card is not approved');
    }

    cards.push(card);
  }

  // Edits: applying every edit file again must leave the card as it is (sacred excerpts match their word positions).
  const editsDir = join(ROOT, 'content', 'edits');
  if (existsSync(editsDir)) {
    const byId = new Map(files.map((f) => [String(f.data.id), f.data]));
    const expected = new Map<string, Record<string, any>>();
    for (const f of readdirSync(editsDir).filter((n) => n.endsWith('.json')).sort()) {
      const edit = JSON.parse(readFileSync(join(editsDir, f), 'utf8')) as Edit;
      const base = expected.get(edit.id) ?? byId.get(edit.id);
      if (!base) { errors.push(`content/edits/${f}: no card ${edit.id}`); continue; }
      try { expected.set(edit.id, applyEdit(base, edit)); } catch (e) { errors.push(`content/edits/${f}: ${(e as Error).message}`); }
    }
    for (const [id, card] of expected) {
      if (JSON.stringify(card) !== JSON.stringify(byId.get(id))) errors.push(`${id}: the card differs from its edits in content/edits (run apply-edit)`);
    }
  }

  return { errors, warnings, cards };
}
