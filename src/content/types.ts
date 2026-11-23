import type { DuaCard, ReviewLevel } from './schema';

export type { Citation, DuaCard, GuidedStep, HadithSource, QuranSource, ReviewLevel, StepType } from './schema';
export { STEP_ORDER, REVIEW_LEVELS } from './schema';

export type DuaKind = DuaCard['kind'];

/**
 * What the app receives from scripts/build-content.ts: the card without its
 * review report (the report stays in the repository), with its review level.
 */
export type Dua = Omit<DuaCard, 'review'> & {
  level: ReviewLevel;
  /** True in a preview build for cards below the production gate. */
  isDraft: boolean;
  /** Tanzil Simple text of the verses (modern spelling), for search only. Never shown. */
  searchExtra: string;
};

export interface ContentBundle {
  /** The gate this bundle was built with. */
  minLevel: ReviewLevel;
  preview: boolean;
  builtAt: string;
  duas: Dua[];
  /** How many cards in this bundle reached each level. Read by «عن المحتوى». */
  levelCounts: Record<ReviewLevel, number>;
}
