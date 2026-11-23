// Neutral Arabic only: no verse or hadith is typed here. The stand-in "sources" are
// ordinary sentences, so the checks are tested on their mechanics.
import { describe, expect, it } from 'vitest';
import { checkCard, checkCollection, type Sources } from './validate-content';
import { foldLettersNoSpace, hasCorruption, quoteFragments, quranFragments } from './lib/text';

const VERSE = 'هذا نص تجريبي يقوم مقام الآية ١';
const sources: Sources = {
  qpc: { '100:1': VERSE },
  quranCorpora: [foldLettersNoSpace(VERSE)],
};

const checks = {
  textMatchesSource: false,
  referenceCorrect: false,
  gradeConfirmed: true,
  excerptApproved: false,
  contextFaithful: false,
  meaningSourced: false,
  quotedFragmentsMatch: false,
  authoredReviewed: false,
  secondSourceMatched: true,
};

function card(over: Record<string, unknown> = {}) {
  return {
    id: 'dua_0100',
    order: 100,
    kind: 'quran',
    title: 'عنوان',
    shortTitle: 'عنوان قصير',
    hook: 'سطر افتتاح',
    speaker: 'قائل',
    sceneLine: 'سطر الموقف',
    text: '<<يُنسخ من المصدر>>',
    quran: { surah: 100, surahName: 'تجربة', ayahFrom: 1, ayahTo: 1, fullText: VERSE, edition: 'test' },
    context: { retelling: 'حكاية', basis: [{ work: 'مرجع' }] },
    meaning: { glossary: [], summary: 'معنى', basis: [] },
    reflections: ['وقفة'],
    steps: ['presence', 'scene', 'meaning', 'need', 'supplicate'].map((type) => ({ type, text: 'خطوة', durationSec: 10 })),
    journalPrompt: 'سؤال',
    themes: [],
    review: { status: 'draft', checks, verification: { by: '', at: null, report: '' }, approval: { reviewer: '', at: null }, notes: '' },
    contentVersion: 1,
    ...over,
  };
}

const errors = (c: unknown) => checkCard(c, sources).filter((i) => i.level === 'error').map((i) => i.message);

describe('checkCard', () => {
  it('accepts a draft with a placeholder text', () => {
    expect(errors(card())).toEqual([]);
  });

  it('rejects unknown fields (strict schema)', () => {
    expect(errors(card({ extra: 1 })).join()).toMatch(/schema/);
  });

  it('rejects a placeholder in a verified card', () => {
    const c = card({ review: { ...card().review, status: 'verified', verification: { by: 'x', at: '2026-11-23', report: 'r' } } });
    expect(errors(c).join()).toMatch(/placeholder/);
  });

  it('requires the text to be a verbatim part of the verse', () => {
    expect(errors(card({ text: 'يقوم مقام' }))).toEqual([]);
    expect(errors(card({ text: 'نص غير موجود' })).join()).toMatch(/verbatim/);
  });

  it('requires fullText to match the source file', () => {
    const c = card({ quran: { ...card().quran, fullText: 'نص معدّل' } });
    expect(errors(c).join()).toMatch(/does not match the source/);
  });

  it('checks five steps in order and their durations', () => {
    const steps = card().steps.slice().reverse();
    expect(errors(card({ steps })).join()).toMatch(/expected "presence"/);
    const short = card().steps.map((s) => ({ ...s, durationSec: 5 }));
    expect(errors(card({ steps: short })).join()).toMatch(/outside 8–30/);
    expect(errors(card({ steps: card().steps.slice(0, 4) })).join()).toMatch(/4 steps/);
  });

  it('checks Qur\'an fragments quoted in authored text', () => {
    expect(errors(card({ hook: 'كما في ﴿يقوم مقام الآية﴾ تمامًا' }))).toEqual([]);
    expect(errors(card({ hook: 'كما في ﴿عبارة ليست في المصدر﴾' })).join()).toMatch(/not found/);
  });

  it('requires a verification report for verified and a named reviewer for approved', () => {
    const verified = card({ text: 'يقوم مقام', review: { ...card().review, status: 'verified' } });
    expect(errors(verified).join()).toMatch(/verification/);
    const approved = card({ text: 'يقوم مقام', review: { ...card().review, status: 'approved', verification: { by: 'x', at: '2026-11-23', report: 'r' } } });
    expect(errors(approved).join()).toMatch(/approval.reviewer/);
  });

  it('rejects a hadith outside al-Bukhari and Muslim', () => {
    const c = card({
      kind: 'sunnah',
      quran: undefined,
      text: '<<يُنسخ>>',
      hadith: { collection: 'كتاب', collectionId: 'tirmidhi', number: '1', numbering: 'ترقيم', narrator: 'راوٍ', fullNarration: 'نص تجريبي', gradings: [], grade: 'صحيح', gradeNote: 'ملاحظة', sourceUrl: 'x' },
    });
    expect(errors(c).join()).toMatch(/tirmidhi/);
  });
});

describe('checkCollection', () => {
  it('catches duplicate ids and orders, wrong file names, retired ids and a missing welcome', () => {
    const msgs = checkCollection(
      [
        { name: 'dua_0001.json', id: 'dua_0001', order: 1 },
        { name: 'dua_0002.json', id: 'dua_0001', order: 1 },
        { name: 'dua_0009.json', id: 'dua_0009', order: 9 },
      ],
      ['dua_0009'],
      'dua_0005',
    ).map((i) => i.message);
    expect(msgs.join('\n')).toMatch(/does not match/);
    expect(msgs.join('\n')).toMatch(/duplicate id/);
    expect(msgs.join('\n')).toMatch(/duplicate order/);
    expect(msgs.join('\n')).toMatch(/retired/);
    expect(msgs.join('\n')).toMatch(/welcome/);
  });
});

describe('text helpers', () => {
  it('finds quoted fragments', () => {
    expect(quranFragments('أ ﴿ب ج﴾ د ﴿هـ﴾')).toEqual(['ب ج', 'هـ']);
    expect(quoteFragments('قال «كلمة» ثم «أخرى»')).toEqual(['كلمة', 'أخرى']);
  });

  it('flags corrupted characters', () => {
    expect(hasCorruption('نص سليم')).toBe(false);
    expect(hasCorruption('نص � تالف')).toBe(true);
  });

  it('compares letters without marks, digits or spaces', () => {
    expect(foldLettersNoSpace('كَلِمَةٌ أُخْرَى ٣')).toBe(foldLettersNoSpace('كلمه اخري'));
  });
});
