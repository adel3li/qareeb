import { z } from 'zod';

/**
 * The dua card, as stored in content/duas/*.json. Used by the content scripts
 * (validate-content, build-content) and by the app for the generated file.
 * The three layers are documented in docs/handoff/03-content-model.md.
 */

export const STEP_ORDER = ['presence', 'scene', 'meaning', 'need', 'supplicate'] as const;
export const REVIEW_LEVELS = ['draft', 'pending_verification', 'needs_changes', 'verified', 'approved'] as const;

const nonEmpty = z.string().trim().min(1);

export const citationSchema = z.strictObject({
  work: nonEmpty,
  location: z.string().optional(),
  url: z.url().optional(),
});

export const quranSourceSchema = z.strictObject({
  surah: z.number().int().min(1).max(114),
  surahName: nonEmpty,
  ayahFrom: z.number().int().min(1),
  ayahTo: z.number().int().min(1),
  /** Copied by scripts/fetch-quran.ts. Never edited. */
  fullText: z.string(),
  edition: nonEmpty,
});

export const hadithSourceSchema = z.strictObject({
  collection: nonEmpty,
  /** Collection id in the open sunnah.com dataset: 'bukhari', 'muslim'… */
  collectionId: nonEmpty,
  number: nonEmpty,
  numbering: nonEmpty,
  narrator: nonEmpty,
  /** Copied by scripts/fetch-hadith.ts or pasted from hadith.sourceUrl. Never edited. */
  fullNarration: z.string(),
  gradings: z.array(z.strictObject({ by: nonEmpty, grade: nonEmpty })),
  grade: z.enum(['صحيح', 'حسن']),
  gradeNote: nonEmpty,
  sourceUrl: z.url(),
  alsoIn: z.array(z.string()).optional(),
});

export const guidedStepSchema = z.strictObject({
  type: z.enum(STEP_ORDER),
  text: nonEmpty,
  durationSec: z.number().int().min(8).max(30),
});

export const reviewSchema = z.strictObject({
  status: z.enum(REVIEW_LEVELS),
  checks: z.strictObject({
    textMatchesSource: z.boolean(),
    referenceCorrect: z.boolean(),
    gradeConfirmed: z.boolean(),
    excerptApproved: z.boolean(),
    contextFaithful: z.boolean(),
    meaningSourced: z.boolean(),
    quotedFragmentsMatch: z.boolean(),
    authoredReviewed: z.boolean(),
    secondSourceMatched: z.boolean(),
  }),
  verification: z.strictObject({ by: z.string(), at: z.string().nullable(), report: z.string() }),
  approval: z.strictObject({ reviewer: z.string(), at: z.string().nullable() }),
  notes: z.string(),
});

export const duaSchema = z
  .strictObject({
    id: z.string().regex(/^dua_\d{4}$/),
    order: z.number().int().min(0),
    kind: z.enum(['quran', 'sunnah']),
    title: nonEmpty,
    shortTitle: nonEmpty,
    hook: nonEmpty,
    speaker: nonEmpty,
    sceneLine: nonEmpty,
    text: z.string(),
    quran: quranSourceSchema.optional(),
    hadith: hadithSourceSchema.optional(),
    context: z.strictObject({ retelling: nonEmpty, basis: z.array(citationSchema).min(1) }),
    meaning: z.strictObject({
      glossary: z.array(z.strictObject({ term: nonEmpty, meaning: nonEmpty })),
      summary: nonEmpty,
      basis: z.array(citationSchema).min(1),
    }),
    reflections: z.array(nonEmpty).min(1).max(3),
    steps: z.array(guidedStepSchema).length(5),
    whenToSay: z
      .strictObject({
        text: nonEmpty,
        note: z.string().optional(),
        /** Set only when the source names one of the intention moments; that tile is then pre-selected. */
        intention: z.enum(['sujood', 'after_prayer', 'before_sleep', 'now']).optional(),
      })
      .optional(),
    repeatCount: z.number().int().min(2).max(100).optional(),
    journalPrompt: nonEmpty,
    themes: z.array(nonEmpty),
    /** Local day "YYYY-MM-DD" from which the card joins the rotation. */
    effectiveFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    review: reviewSchema,
    contentVersion: z.number().int().min(1),
  })
  .superRefine((dua, ctx) => {
    if (dua.kind === 'quran' && !dua.quran) ctx.addIssue({ code: 'custom', message: 'kind quran needs quran' });
    if (dua.kind === 'sunnah' && !dua.hadith) ctx.addIssue({ code: 'custom', message: 'kind sunnah needs hadith' });
    if (dua.kind === 'quran' && dua.hadith) ctx.addIssue({ code: 'custom', message: 'kind quran must not have hadith' });
    if (dua.kind === 'sunnah' && dua.quran) ctx.addIssue({ code: 'custom', message: 'kind sunnah must not have quran' });
  });

export type DuaCard = z.infer<typeof duaSchema>;

/**
 * What the app receives for each card (src/content/generated/duas.json):
 * the card without the verification report, with its review level and a
 * modern-spelling copy for search.
 */
export type AppDua = Omit<DuaCard, 'review'> & {
  level: (typeof REVIEW_LEVELS)[number];
  /** Normalisable text for search: titles, the dua, and for the Qur'an Tanzil's simple spelling. Never shown. */
  searchText: string;
};

export interface ContentMeta {
  /** True for CONTENT_PREVIEW=1 builds: drafts included and marked. */
  preview: boolean;
  minLevel: (typeof REVIEW_LEVELS)[number];
  /** Count of cards in this build at each review level. */
  levels: Partial<Record<(typeof REVIEW_LEVELS)[number], number>>;
}

export interface ContentFile {
  meta: ContentMeta;
  duas: AppDua[];
}

/** Index of a review level; higher is further along. */
export function levelRank(level: (typeof REVIEW_LEVELS)[number]): number {
  return REVIEW_LEVELS.indexOf(level);
}
