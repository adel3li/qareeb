import { duaSchema, levelRank, STEP_ORDER, type DuaCard } from '../../src/content/schema.ts';
import { decide } from '../../src/lib/hadithGrade.ts';
import { containsNormalized, corruptedCharacters, findPlaceholders, guillemetQuotes, quranQuotes } from './text.ts';

/**
 * The content checks of docs/handoff/03-content-model.md §7. Pure: the Qur'an
 * lookups are passed in, so tests run on neutral text.
 */

export interface QuranLookup {
  /** The King Fahd text of the range, joined by one space. */
  range(surah: number, from: number, to: number): string;
  /** True when the letters of the range match the second source (Tanzil Uthmani). */
  lettersMatch(surah: number, from: number, to: number): boolean;
  /** True when the letters of a quoted fragment occur somewhere in the Qur'an. */
  fragmentExists(fragment: string): boolean;
}

export interface Problem {
  file: string;
  id?: string;
  message: string;
  /** Warnings do not fail validation (placeholders in drafts). */
  warning?: boolean;
}

export interface CardInput {
  file: string;
  raw: unknown;
}

/** Checks required for each review level (the reviewer's two checks wait for `approved`). */
export const CHECKS_FOR_VERIFIED = [
  'textMatchesSource',
  'referenceCorrect',
  'gradeConfirmed',
  'contextFaithful',
  'meaningSourced',
  'quotedFragmentsMatch',
] as const;

/** Every piece of authored or transmitted text in a card (layers B and C). */
export function authoredTexts(card: DuaCard): { field: string; text: string }[] {
  const out: { field: string; text: string }[] = [
    { field: 'title', text: card.title },
    { field: 'shortTitle', text: card.shortTitle },
    { field: 'hook', text: card.hook },
    { field: 'speaker', text: card.speaker },
    { field: 'sceneLine', text: card.sceneLine },
    { field: 'context.retelling', text: card.context.retelling },
    { field: 'meaning.summary', text: card.meaning.summary },
    { field: 'journalPrompt', text: card.journalPrompt },
  ];
  card.meaning.glossary.forEach((g, i) => out.push({ field: `meaning.glossary[${i}].meaning`, text: g.meaning }));
  card.reflections.forEach((r, i) => out.push({ field: `reflections[${i}]`, text: r }));
  card.steps.forEach((s, i) => out.push({ field: `steps[${i}].text`, text: s.text }));
  if (card.whenToSay) {
    out.push({ field: 'whenToSay.text', text: card.whenToSay.text });
    if (card.whenToSay.note) out.push({ field: 'whenToSay.note', text: card.whenToSay.note });
  }
  return out;
}

export function validateCards(
  inputs: CardInput[],
  options: { retiredIds: string[]; quran: QuranLookup },
): { cards: DuaCard[]; problems: Problem[] } {
  const problems: Problem[] = [];
  const cards: DuaCard[] = [];
  const seenIds = new Map<string, string>();
  const seenOrders = new Map<number, string>();

  for (const { file, raw } of inputs) {
    const parsed = duaSchema.safeParse(raw);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        problems.push({ file, message: `structure: ${issue.path.join('.') || '(card)'}: ${issue.message}` });
      }
      continue;
    }
    const card = parsed.data;
    const add = (message: string, warning = false) => problems.push({ file, id: card.id, message, warning });
    cards.push(card);

    // Ids
    if (`${card.id}.json` !== file) add(`file name must be ${card.id}.json`);
    if (seenIds.has(card.id)) add(`id ${card.id} also used in ${seenIds.get(card.id)}`);
    seenIds.set(card.id, file);
    if (options.retiredIds.includes(card.id)) add(`id ${card.id} was retired and cannot be reused`);
    if (seenOrders.has(card.order)) add(`order ${card.order} also used in ${seenOrders.get(card.order)}`);
    seenOrders.set(card.order, file);

    const released = levelRank(card.review.status) >= levelRank('verified');

    // Sacred text: the Qur'an
    if (card.quran) {
      const q = card.quran;
      if (q.ayahTo < q.ayahFrom) add('quran.ayahTo is before quran.ayahFrom');
      else {
        let source: string | null = null;
        try {
          source = options.quran.range(q.surah, q.ayahFrom, q.ayahTo);
        } catch (e) {
          add(`quran: ${(e as Error).message}`);
        }
        if (source !== null) {
          if (q.fullText !== source) add(`quran.fullText does not match the source ${q.surah}:${q.ayahFrom}-${q.ayahTo} (run bun run fetch-quran)`);
          if (!options.quran.lettersMatch(q.surah, q.ayahFrom, q.ayahTo)) add('quran: letters differ from the second source (Tanzil Uthmani)');
        }
      }
      if (findPlaceholders(card.text).length === 0 && !q.fullText.includes(card.text)) add('text is not a verbatim part of quran.fullText');
    }

    // Sacred text: the Sunnah
    if (card.hadith) {
      const h = card.hadith;
      const decision = decide(h.collectionId, h.gradings);
      if (decision.decision !== 'include') add(`hadith: ${h.collectionId} ${h.number} is outside the current scope (${decision.reason})`);
      const bad = corruptedCharacters(h.fullNarration);
      if (bad.length) add(`hadith.fullNarration has corrupted characters (${bad.join(' ')}): copy it from a second source`);
      if (findPlaceholders(card.text).length === 0 && findPlaceholders(h.fullNarration).length === 0 && !h.fullNarration.includes(card.text)) {
        add('text is not a verbatim part of hadith.fullNarration');
      }
    }

    // Glossary terms are copied from the dua
    card.meaning.glossary.forEach((g, i) => {
      if (findPlaceholders(g.term).length === 0 && !containsNormalized(card.text, g.term)) add(`meaning.glossary[${i}].term is not in the text of the dua`);
    });

    // Quoted fragments inside authored text
    for (const { field, text } of authoredTexts(card)) {
      for (const fragment of quranQuotes(text)) {
        if (!options.quran.fragmentExists(fragment)) add(`${field}: ﴿${fragment}﴾ is not in the Qur'an text`);
      }
      const sacred = [card.text, card.hadith?.fullNarration ?? '', card.quran?.fullText ?? ''].join(' ');
      for (const fragment of guillemetQuotes(text)) {
        if (!containsNormalized(sacred, fragment)) add(`${field}: «${fragment}» is not in this card's sacred text`);
      }
    }

    // Placeholders
    const allText = JSON.stringify(card);
    const placeholders = findPlaceholders(allText);
    if (placeholders.length) {
      if (released) add(`placeholders remain in a ${card.review.status} card: ${placeholders.slice(0, 3).join(' ')}`);
      else add(`${placeholders.length} placeholder(s) left (draft)`, true);
    }

    // Steps in the fixed order
    card.steps.forEach((s, i) => {
      if (s.type !== STEP_ORDER[i]) add(`steps[${i}] must be ${STEP_ORDER[i]}, found ${s.type}`);
    });

    // Review gate
    const r = card.review;
    if (released) {
      if (!r.verification.at || !r.verification.report.trim()) add(`${r.status} needs review.verification.at and a report`);
      for (const check of CHECKS_FOR_VERIFIED) if (!r.checks[check]) add(`${r.status} needs review.checks.${check}`);
    }
    if (r.status === 'approved') {
      if (!r.approval.reviewer.trim() || !r.approval.at) add('approved needs review.approval.reviewer and review.approval.at');
      for (const [check, value] of Object.entries(r.checks)) if (!value) add(`approved needs review.checks.${check}`);
    } else if (r.approval.reviewer || r.approval.at) {
      add('review.approval is filled but the status is not approved');
    }
  }

  return { cards, problems };
}
