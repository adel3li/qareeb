/**
 * One place for what may change with one line. Each value names the decision
 * it belongs to in docs/decisions.md.
 */

/** The app's name as the user reads it (decision ١). */
export const APP_NAME = 'قريب';

/** Prefix of every storage key (decision ١). Never change it without a migration. */
export const STORAGE_PREFIX = 'qareeb';

/**
 * The Qur'an text shown to users and the face it is set in (decision ٤).
 * 'kfgqpc-hafs': the King Fahd Complex text in KFGQPC Uthmanic Script HAFS (chosen).
 * 'tanzil-uthmani-amiri': the fallback if the Complex's terms do not allow it:
 * Tanzil's Uthmani text in Amiri Quran. Switching also needs that font in public/fonts
 * and the cards re-copied by `bun run fetch-quran -- --edition tanzil-uthmani`.
 */
export const QURAN_EDITION: 'kfgqpc-hafs' | 'tanzil-uthmani-amiri' = 'kfgqpc-hafs';

/** The card shown on a user's first day (decision ٢). */
export const WELCOME_DUA_ID = 'dua_0001';

/**
 * The address shared links and the calendar reminder open (decision ٥/٧).
 * The app is on Vercel's free address until a domain is booked; at runtime the
 * current origin is used, so this is only the fallback for builds without one.
 */
export const APP_URL_FALLBACK = 'https://qareeb.vercel.app/';

/** Text size setting, in px of the root font size. */
export const FONT_SCALE = { min: 14, max: 24, default: 16 } as const;

/** Limits on an imported backup file. */
export const BACKUP_MAX_BYTES = 5 * 1024 * 1024;

/** Contact shown in «عن التطبيق». Empty until the owner chooses one (open decision). */
export const CONTACT_EMAIL = '';

/** Draft save delay in the guided flow, ms. */
export const DRAFT_DEBOUNCE_MS = 500;
