import { levelRank, REVIEW_LEVELS, type AppDua, type ContentFile, type DuaCard } from '../../src/content/schema.ts';

export type Level = (typeof REVIEW_LEVELS)[number];

export interface BuildOptions {
  /** Lowest review level shipped (CONTENT_MIN_LEVEL). */
  minLevel: Level;
  /** CONTENT_PREVIEW=1: every card, drafts marked. */
  preview: boolean;
  /** The build fails with fewer cards than this (CONTENT_MIN_COUNT). */
  minCount: number;
  /** Modern-spelling text of a Qur'an range, for search only. */
  searchSpelling?: (surah: number, from: number, to: number) => string;
}

export function parseLevel(value: string | undefined, fallback: Level): Level {
  if (!value) return fallback;
  if ((REVIEW_LEVELS as readonly string[]).includes(value)) return value as Level;
  throw new Error(`CONTENT_MIN_LEVEL must be one of ${REVIEW_LEVELS.join(', ')}; got "${value}"`);
}

/** The review gate: which cards go into the app, and what they carry. */
export function buildContent(cards: DuaCard[], options: BuildOptions): ContentFile {
  const shipped = cards
    .filter((c) => options.preview || levelRank(c.review.status) >= levelRank(options.minLevel))
    .sort((a, b) => a.order - b.order);
  if (shipped.length < options.minCount) {
    throw new Error(
      `Only ${shipped.length} card(s) at ${options.minLevel} or above; the build needs ${options.minCount} (CONTENT_MIN_COUNT).`,
    );
  }
  const levels: ContentFile['meta']['levels'] = {};
  const duas: AppDua[] = shipped.map((card) => {
    const { review, ...rest } = card;
    levels[review.status] = (levels[review.status] ?? 0) + 1;
    const spelling = card.quran && options.searchSpelling ? options.searchSpelling(card.quran.surah, card.quran.ayahFrom, card.quran.ayahTo) : '';
    return {
      ...rest,
      level: review.status,
      searchText: [card.title, card.shortTitle, card.sceneLine, card.text, spelling].filter(Boolean).join(' '),
    };
  });
  return { meta: { preview: options.preview, minLevel: options.minLevel, levels }, duas };
}
