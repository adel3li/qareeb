/** Content enums without Zod, so the app's main chunk does not carry the schema library. */
export const DUA_KINDS = ['quran', 'sunnah', 'athar'] as const;
export const STEP_ORDER = ['presence', 'scene', 'meaning', 'need', 'supplicate'] as const;
export const REVIEW_STATUSES = ['draft', 'pending_verification', 'verified', 'approved', 'needs_changes'] as const;
export const INTENTIONS = ['sujood', 'after_prayer', 'before_sleep', 'now'] as const;
