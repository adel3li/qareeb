/**
 * Settings that change with one line. Open decisions (docs/handoff/00-decisions.md)
 * are built so each one changes here.
 */

/** App name as shown to users. */
export const APP_NAME = 'قريب';

/** Prefix of every localStorage key (`qareeb:name:v1`). Never change it without a migration. */
export const STORAGE_PREFIX = 'qareeb';

/**
 * Which Qur'an text and face is shown (decision ٤).
 * - 'kfgqpc-hafs': the King Fahd Complex text (text_qpc_hafs) in KFGQPC Uthmanic Script HAFS. Current.
 * - 'tanzil-uthmani-amiri': the fallback if the font's terms do not allow use: Tanzil Uthmani in Amiri Quran.
 *   (Needs the Amiri Quran font in public/fonts and `fetch-quran --edition tanzil-uthmani`.)
 */
export const QURAN_EDITION: 'kfgqpc-hafs' | 'tanzil-uthmani-amiri' = 'kfgqpc-hafs';

/** Id of the welcome dua shown on the first day (decision ٢). */
export const WELCOME_DUA_ID = 'dua_0001';

/** Public address of the app, used in share text and calendar reminders (decision ٥/٧: the free vercel.app address for now). */
export const APP_URL = 'https://qareeb.vercel.app';

/** Contact shown in «عن التطبيق». Empty until the owner chooses one. */
export const CONTACT = '';

/** The app version, read from package.json at build time. */
export const APP_VERSION: string = import.meta.env.VITE_APP_VERSION ?? '0.0.0';
