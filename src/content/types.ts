import type { z } from 'zod';
import type {
  builtContentSchema,
  builtDuaSchema,
  citationSchema,
  duaSchema,
  guidedStepSchema,
  hadithSourceSchema,
  quranSourceSchema,
  reviewSchema,
} from './schema';
import { DUA_KINDS, INTENTIONS, REVIEW_STATUSES, STEP_ORDER } from './constants';

export { DUA_KINDS, INTENTIONS, REVIEW_STATUSES, STEP_ORDER };

export type DuaKind = (typeof DUA_KINDS)[number];
export type StepType = (typeof STEP_ORDER)[number];
export type ReviewStatus = (typeof REVIEW_STATUSES)[number];
export type Intention = (typeof INTENTIONS)[number];

export type Citation = z.infer<typeof citationSchema>;
export type QuranSource = z.infer<typeof quranSourceSchema>;
export type HadithSource = z.infer<typeof hadithSourceSchema>;
export type GuidedStep = z.infer<typeof guidedStepSchema>;
export type Review = z.infer<typeof reviewSchema>;
export type DuaCard = z.infer<typeof duaSchema>;
export type Dua = z.infer<typeof builtDuaSchema>;
export type BuiltContent = z.infer<typeof builtContentSchema>;

/** Review levels in order: a card at a level has passed every level before it. */
export const LEVEL_RANK: Record<ReviewStatus, number> = {
  needs_changes: 0,
  draft: 0,
  pending_verification: 1,
  verified: 2,
  approved: 3,
};
