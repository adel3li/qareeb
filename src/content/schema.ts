import { z } from 'zod';

/**
 * The dua card, as Zod schemas. Used by the content scripts (validate-content,
 * build-content) and by the app. The fields follow docs/handoff/05-technical-blueprint.md §4;
 * see docs/reference/content.md for what each holds and who may write it.
 */

export const DUA_KINDS = ['quran', 'sunnah', 'athar'] as const;
export const STEP_ORDER = ['presence', 'scene', 'meaning', 'need', 'supplicate'] as const;
export const REVIEW_STATUSES = ['draft', 'pending_verification', 'verified', 'approved', 'needs_changes'] as const;
export const INTENTIONS = ['sujood', 'after_prayer', 'before_sleep', 'now'] as const;

export const citationSchema = z.object({
  work: z.string().min(1),
  location: z.string().optional(),
  url: z.string().optional(),
});

export const quranSourceSchema = z.object({
  surah: z.number().int().min(1).max(114),
  surahName: z.string().min(1),
  ayahFrom: z.number().int().min(1),
  ayahTo: z.number().int().min(1),
  /** Copied by scripts/fetch-quran.ts from content/sources; never edited. */
  fullText: z.string(),
  edition: z.string().min(1),
});

export const hadithSourceSchema = z.object({
  collection: z.string().min(1),
  /** Collection id in the open dataset: "bukhari" or "muslim" in the current scope. */
  collectionId: z.string().min(1).optional(),
  number: z.string().min(1),
  numbering: z.string().min(1),
  narrator: z.string().min(1),
  /** Copied by scripts/fetch-hadith.ts from the dataset, or pasted from hadith.sourceUrl; never edited. */
  fullNarration: z.string(),
  gradings: z.array(z.object({ by: z.string(), grade: z.string() })),
  grade: z.enum(['صحيح', 'حسن']),
  gradeNote: z.string(),
  sourceUrl: z.string().min(1),
  alsoIn: z.array(z.string()).optional(),
});

export const guidedStepSchema = z.object({
  type: z.enum(STEP_ORDER),
  text: z.string().min(1),
  durationSec: z.number().int(),
});

export const reviewChecksSchema = z.object({
  textMatchesSource: z.boolean(),
  referenceCorrect: z.boolean(),
  gradeConfirmed: z.boolean(),
  excerptApproved: z.boolean(),
  contextFaithful: z.boolean(),
  meaningSourced: z.boolean(),
  quotedFragmentsMatch: z.boolean(),
  authoredReviewed: z.boolean(),
  secondSourceMatched: z.boolean(),
});

export const reviewSchema = z.object({
  status: z.enum(REVIEW_STATUSES),
  checks: reviewChecksSchema,
  verification: z.object({ by: z.string(), at: z.string().nullable(), report: z.string() }),
  approval: z.object({ reviewer: z.string(), at: z.string().nullable() }),
  notes: z.string(),
});

export const duaSchema = z
  .object({
    id: z.string().regex(/^dua_\d{4}$/),
    order: z.number().int(),
    kind: z.enum(DUA_KINDS),
    /** Local day from which the card joins the rotation (src/lib/daily.ts). */
    effectiveFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    title: z.string().min(1),
    shortTitle: z.string().min(1),
    hook: z.string().min(1),
    speaker: z.string().min(1),
    sceneLine: z.string().min(1),
    text: z.string().min(1),
    quran: quranSourceSchema.optional(),
    hadith: hadithSourceSchema.optional(),
    context: z.object({ retelling: z.string().min(1), basis: z.array(citationSchema) }),
    meaning: z.object({
      glossary: z.array(z.object({ term: z.string(), meaning: z.string() })),
      summary: z.string(),
      basis: z.array(citationSchema),
    }),
    reflections: z.array(z.string().min(1)),
    steps: z.array(guidedStepSchema),
    /** Only when the source itself states when the dua is said. */
    whenToSay: z
      .object({
        text: z.string().min(1),
        note: z.string().optional(),
        /** The intention tile pre-selected because of it, when the source names one. */
        intention: z.enum(INTENTIONS).optional(),
      })
      .optional(),
    repeatCount: z.number().int().min(2).max(100).optional(),
    journalPrompt: z.string().min(1),
    themes: z.array(z.string()),
    review: reviewSchema,
    contentVersion: z.number().int().min(1),
  })
  .strict();

/** A card as the app receives it from scripts/build-content.ts. */
export const builtDuaSchema = duaSchema.extend({
  /** Modern-spelling text for search (Tanzil simple for the Qur'an), never shown. */
  searchText: z.string(),
});

export const builtContentSchema = z.object({
  preview: z.boolean(),
  minLevel: z.enum(REVIEW_STATUSES),
  welcomeId: z.string(),
  /** How many cards reached each status, read from the data (shown in «عن المحتوى»). */
  counts: z.record(z.string(), z.number()),
  duas: z.array(builtDuaSchema),
});
