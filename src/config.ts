/**
 * Settings that the owner may change, each with one line. Open decisions are
 * listed in docs/handoff/00-decisions.md and docs/reference/decisions-open.md.
 */

/** The app's name as shown to users. */
export const APP_NAME = 'قريب';

/** Prefix of every localStorage key (src/state/keys.ts). Never change it without a migration. */
export const STORAGE_PREFIX = 'qareeb';

/**
 * Qur'an text and face shown to users (decision ٤). 'kfgqpc' is the King Fahd Complex text
 * (api.quran.com text_qpc_hafs) in KFGQPC Uthmanic Script HAFS. The ready fallback, if the
 * terms of use do not allow it, is 'amiri-tanzil': Amiri Quran with Tanzil's Uthmani text
 * (needs the Amiri Quran font in public/fonts and fetch-quran run with that edition).
 */
export const QURAN_EDITION: 'kfgqpc' | 'amiri-tanzil' = 'kfgqpc';

/** Id of the welcome dua (decision ٢: al-Fatiha 6–7). */
export const WELCOME_DUA_ID = 'dua_0001';

/**
 * Whether living a dua from the library (not today's) records a day. Open in
 * 02-ux-and-screens.md §6: «والقرار لك». Off: only today's dua records the day.
 */
export const LIBRARY_LIVE_RECORDS_DAY = false;

/** Text-size setting: root font size in px. */
export const FONT_SCALE = { min: 14, max: 24, default: 16 } as const;

/** Largest backup file accepted on import, in bytes. */
export const BACKUP_MAX_BYTES = 5 * 1024 * 1024;

/** Date of the privacy policy shown in Settings. */
export const PRIVACY_POLICY_DATE = '2026-11-23';

/** Contact address shown in Settings. Empty until the owner chooses one (open decision). */
export const CONTACT_EMAIL = '';
