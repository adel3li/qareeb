import { z } from 'zod';

/**
 * Zod schemas for a dua card (docs/handoff/03-content-model.md, 05 §4).
 * Used by scripts/validate-content.ts at build time and by the app's types.
 * Objects are strict: an unknown field is an error, so a typo never passes silently.
 */

export const STEP_ORDER = ['presence', 'scene', 'meaning', 'need', 'supplicate'] as const;
export const REVIEW_LEVELS = ['draft', 'pending_verification', 'needs_changes', 'verified', 'approved'] as const;

export const CitationSchema = z.strictObject({
  work: z.string().min(1),
  location: z.string().optional(),
  url: z.string().url().optional(),
});

export const QuranSourceSchema = z.strictObject({
  surah: z.number().int().min(1).max(114),
  surahName: z.string().min(1),
  ayahFrom: z.number().int().min(1),
  ayahTo: z.number().int().min(1),
  /** Copied by scripts/fetch-quran.ts; never edited. */
  fullText: z.string(),
  edition: z.string().min(1),
});

export const HadithSourceSchema = z.strictObject({
  collection: z.string().min(1),
  /** Dataset id of the collection: 'bukhari' | 'muslim' (current scope). */
  collectionId: z.string().min(1),
  number: z.string().min(1),
  numbering: z.string().min(1),
  narrator: z.string().min(1),
  /** Copied by scripts/fetch-hadith.ts or pasted from hadith.sourceUrl; never edited. */
  fullNarration: z.string(),
  gradings: z.array(z.strictObject({ by: z.string(), grade: z.string() })),
  grade: z.enum(['صحيح', 'حسن']),
  gradeNote: z.string(),
  sourceUrl: z.string().url(),
  alsoIn: z.array(z.string()).optional(),
});

export const GuidedStepSchema = z.strictObject({
  type: z.enum(STEP_ORDER),
  text: z.string().min(1),
  durationSec: z.number().int(),
});

export const ReviewChecksSchema = z.strictObject({
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

export const ReviewSchema = z.strictObject({
  status: z.enum(REVIEW_LEVELS),
  checks: ReviewChecksSchema,
  verification: z.strictObject({ by: z.string(), at: z.string().nullable(), report: z.string() }),
  approval: z.strictObject({ reviewer: z.string(), at: z.string().nullable() }),
  notes: z.string(),
});

export const DuaSchema = z
  .strictObject({
    id: z.string().regex(/^dua_\d{4}$/),
    order: z.number().int().min(0),
    kind: z.enum(['quran', 'sunnah']),
    title: z.string().min(1),
    shortTitle: z.string().min(1),
    hook: z.string().min(1),
    speaker: z.string().min(1),
    sceneLine: z.string().min(1),
    text: z.string().min(1),
    quran: QuranSourceSchema.optional(),
    hadith: HadithSourceSchema.optional(),
    context: z.strictObject({ retelling: z.string().min(1), basis: z.array(CitationSchema) }),
    meaning: z.strictObject({
      glossary: z.array(z.strictObject({ term: z.string().min(1), meaning: z.string().min(1) })),
      summary: z.string().min(1),
      basis: z.array(CitationSchema),
    }),
    reflections: z.array(z.string().min(1)),
    steps: z.array(GuidedStepSchema),
    whenToSay: z.strictObject({ text: z.string().min(1), note: z.string().optional() }).optional(),
    repeatCount: z.number().int().min(2).optional(),
    journalPrompt: z.string().min(1),
    themes: z.array(z.string()),
    effectiveFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    review: ReviewSchema,
    contentVersion: z.number().int().min(1),
  })
  .refine((d) => (d.kind === 'quran' ? !!d.quran && !d.hadith : !!d.hadith && !d.quran), {
    message: 'A quran card has `quran` and no `hadith`; a sunnah card has `hadith` and no `quran`.',
  });

export type Citation = z.infer<typeof CitationSchema>;
export type QuranSource = z.infer<typeof QuranSourceSchema>;
export type HadithSource = z.infer<typeof HadithSourceSchema>;
export type GuidedStep = z.infer<typeof GuidedStepSchema>;
export type StepType = (typeof STEP_ORDER)[number];
export type ReviewLevel = (typeof REVIEW_LEVELS)[number];
export type DuaCard = z.infer<typeof DuaSchema>;
