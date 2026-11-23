import { describe, expect, it } from 'vitest';
import { validateCards, type QuranLookup } from './lib/validate.ts';
import { buildContent } from './lib/buildContent.ts';
import { findNarration, referenceFromUrl } from './lib/hadith.ts';
import { corruptedCharacters, findPlaceholders, guillemetQuotes, quranQuotes } from './lib/text.ts';
import type { DuaCard } from '../src/content/schema.ts';

// Neutral Arabic only: no verse or hadith is typed in tests.
const SOURCE = 'نص تجريبي أول للاختبار ١';
const quran: QuranLookup = {
  range: (s, a, b) => {
    if (s === 1 && a === 1 && b === 1) return SOURCE;
    throw new Error('no such range');
  },
  lettersMatch: () => true,
  fragmentExists: (f) => SOURCE.includes(f),
};

const steps = ['presence', 'scene', 'meaning', 'need', 'supplicate'].map((type) => ({ type, text: 'خطوة تجريبية.', durationSec: 10 }));

function card(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    id: 'dua_0001',
    order: 1,
    kind: 'quran',
    title: 'عنوان',
    shortTitle: 'عنوان قصير',
    hook: 'افتتاح.',
    speaker: 'قائل',
    sceneLine: 'سطر الموقف',
    text: 'نص تجريبي',
    quran: { surah: 1, surahName: 'سورة', ayahFrom: 1, ayahTo: 1, fullText: SOURCE, edition: 'test' },
    context: { retelling: 'حكاية.', basis: [{ work: 'مرجع' }] },
    meaning: { glossary: [{ term: 'تجريبي', meaning: 'معنى' }], summary: 'خلاصة.', basis: [{ work: 'مرجع' }] },
    reflections: ['وقفة.'],
    steps,
    journalPrompt: 'سؤال؟',
    themes: [],
    review: {
      status: 'verified',
      checks: {
        textMatchesSource: true, referenceCorrect: true, gradeConfirmed: true, excerptApproved: false,
        contextFaithful: true, meaningSourced: true, quotedFragmentsMatch: true, authoredReviewed: false, secondSourceMatched: true,
      },
      verification: { by: 'Claude', at: '2026-11-23', report: 'تقرير' },
      approval: { reviewer: '', at: null },
      notes: '',
    },
    contentVersion: 1,
    ...overrides,
  };
}

const run = (raw: Record<string, unknown>[], retiredIds: string[] = []) =>
  validateCards(raw.map((r) => ({ file: `${String(r.id)}.json`, raw: r })), { retiredIds, quran });
const errors = (raw: Record<string, unknown>[], retired: string[] = []) => run(raw, retired).problems.filter((p) => !p.warning).map((p) => p.message);

describe('validate-content', () => {
  it('accepts a complete verified card', () => {
    expect(errors([card()])).toEqual([]);
  });

  it('rejects a missing field', () => {
    const c = card();
    delete c.hook;
    expect(errors([c]).join()).toMatch(/structure: hook/);
  });

  it('rejects duplicate and retired ids', () => {
    expect(errors([card(), card({ order: 2 })]).join()).toMatch(/also used/);
    expect(errors([card()], ['dua_0001']).join()).toMatch(/retired/);
  });

  it('rejects a Qur’an text that differs from the source', () => {
    const c = card();
    (c.quran as Record<string, unknown>).fullText = 'نص آخر';
    expect(errors([c]).join()).toMatch(/does not match the source/);
  });

  it('rejects a dua that is not part of the verses', () => {
    expect(errors([card({ text: 'نص غير موجود' })]).join()).toMatch(/verbatim part/);
  });

  it('rejects quoted fragments that are not in the source', () => {
    expect(errors([card({ hook: 'قال ﴿ نص غير موجود ﴾ هنا.' })]).join()).toMatch(/not in the Qur/);
    expect(errors([card({ hook: 'قال ﴿ نص تجريبي ﴾ هنا.' })])).toEqual([]);
    expect(errors([card({ hook: 'قال «كلام آخر» هنا.' })]).join()).toMatch(/sacred text/);
  });

  it('fails on placeholders in a verified card, warns in a draft', () => {
    expect(errors([card({ hook: '<<يُكتب لاحقًا>>' })]).join()).toMatch(/placeholders remain/);
    const draft = card({ hook: '<<يُكتب لاحقًا>>' });
    (draft.review as Record<string, unknown>).status = 'draft';
    const result = run([draft]);
    expect(result.problems.filter((p) => !p.warning)).toEqual([]);
    expect(result.problems.some((p) => p.warning)).toBe(true);
  });

  it('checks the steps: five, in order, 8 to 30 seconds', () => {
    expect(errors([card({ steps: [...steps].reverse() })]).join()).toMatch(/steps\[0\] must be presence/);
    expect(errors([card({ steps: steps.slice(0, 4) })]).join()).toMatch(/structure: steps/);
    expect(errors([card({ steps: steps.map((s) => ({ ...s, durationSec: 40 })) })]).join()).toMatch(/structure/);
  });

  it('checks the review gate', () => {
    const c = card();
    (c.review as { verification: { at: string | null } }).verification.at = null;
    expect(errors([c]).join()).toMatch(/verification.at/);
    const approved = card();
    (approved.review as Record<string, unknown>).status = 'approved';
    expect(errors([approved]).join()).toMatch(/approval.reviewer/);
  });

  it('defers a hadith outside al-Bukhari and Muslim', () => {
    const c = card({
      kind: 'sunnah',
      quran: undefined,
      text: 'نص تجريبي',
      meaning: { glossary: [], summary: 'خلاصة.', basis: [{ work: 'مرجع' }] },
      hadith: {
        collection: 'سنن', collectionId: 'abudawud', number: '1', numbering: 'ترقيم', narrator: 'راوٍ',
        fullNarration: 'رواية فيها نص تجريبي كاملة', gradings: [], grade: 'صحيح', gradeNote: 'حكم', sourceUrl: 'https://sunnah.com/abudawud:1',
      },
    });
    delete c.quran;
    expect(errors([c]).join()).toMatch(/outside the current scope/);
  });
});

describe('build-content (review gate)', () => {
  const parsed = run([card(), card({ id: 'dua_0002', order: 2 })]).cards;
  const draft = { ...parsed[1], review: { ...parsed[1].review, status: 'draft' } } as DuaCard;

  it('ships only cards at the minimum level', () => {
    const out = buildContent([parsed[0], draft], { minLevel: 'verified', preview: false, minCount: 1 });
    expect(out.duas.map((d) => d.id)).toEqual(['dua_0001']);
    expect(out.duas[0]).not.toHaveProperty('review');
    expect(out.duas[0].level).toBe('verified');
  });

  it('includes drafts in a preview build', () => {
    const out = buildContent([parsed[0], draft], { minLevel: 'verified', preview: true, minCount: 1 });
    expect(out.duas.map((d) => d.level)).toEqual(['verified', 'draft']);
    expect(out.meta.levels).toEqual({ verified: 1, draft: 1 });
  });

  it('fails below the minimum count', () => {
    expect(() => buildContent([draft], { minLevel: 'approved', preview: false, minCount: 1 })).toThrow(/CONTENT_MIN_COUNT/);
  });
});

describe('text helpers', () => {
  it('finds placeholders and quotes', () => {
    expect(findPlaceholders('أ <<ب>> ج [[د]]')).toEqual(['<<ب>>', '[[د]]']);
    expect(quranQuotes('قبل ﴿ مقطع ﴾ بعد')).toEqual(['مقطع']);
    expect(guillemetQuotes('قبل «مقطع» بعد')).toEqual(['مقطع']);
  });
  it('flags corrupted characters', () => {
    expect(corruptedCharacters('نص سليم')).toEqual([]);
    expect(corruptedCharacters('نص � تالف')).toEqual(['�']);
  });
});

describe('hadith dataset lookup', () => {
  const edition = {
    hadiths: [
      { hadithnumber: 10, arabicnumber: '5.01', text: 'أ', grades: [], reference: { book: 2, hadith: 7 } },
      { hadithnumber: 11, arabicnumber: '5.02', text: 'ب', grades: [], reference: { book: 2, hadith: 8 } },
    ],
  };
  it('reads the sunnah.com page reference', () => {
    expect(referenceFromUrl('https://sunnah.com/muslim/48/63')).toEqual({ book: 48, hadith: 63 });
    expect(referenceFromUrl('https://sunnah.com/muslim:395')).toBeNull();
  });
  it('finds by page, else the first narration under the number', () => {
    expect(findNarration(edition, '5', 'https://sunnah.com/muslim/2/8')?.text).toBe('ب');
    expect(findNarration(edition, '5')?.text).toBe('أ');
    expect(() => findNarration(edition, '6', 'https://sunnah.com/muslim/2/8')).toThrow();
  });
});
