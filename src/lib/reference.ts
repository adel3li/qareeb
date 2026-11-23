import type { Dua } from '../content/types';
import { toArabicNumerals } from './arabic';
import { hasPlaceholder } from './placeholders';

/** «سورة الأنبياء: ٨٧», «سورة الفاتحة: ٦–٧», «صحيح مسلم (٢٧٠٥)». */
export function referenceOf(dua: Pick<Dua, 'quran' | 'hadith'>): string {
  if (dua.quran) {
    const { surahName, ayahFrom, ayahTo } = dua.quran;
    const ayahs = ayahFrom === ayahTo ? toArabicNumerals(ayahFrom) : `${toArabicNumerals(ayahFrom)}–${toArabicNumerals(ayahTo)}`;
    return `سورة ${surahName}: ${ayahs}`;
  }
  if (dua.hadith) return `${dua.hadith.collection} (${toArabicNumerals(dua.hadith.number)})`;
  return '';
}

export type SacredKind = 'quran' | 'hadith';

export function sacredKindOf(dua: Pick<Dua, 'kind'>): SacredKind {
  return dua.kind === 'quran' ? 'quran' : 'hadith';
}

export interface DisplayText {
  text: string;
  /** The stored dua text is still a placeholder and the full copied verse is shown instead (preview only). */
  isFullSource: boolean;
  /** Nothing copied to show: the placeholder itself (preview only). */
  isPlaceholder: boolean;
}

/**
 * What to show as the dua. Normally the stored `text`, exactly. In a draft whose excerpt
 * the reviewer has not chosen yet, a Qur'an card shows the whole copied verse; a hadith card
 * shows its placeholder (the full narration stays in «نص الحديث كاملًا»).
 */
export function displayTextOf(dua: Pick<Dua, 'text' | 'quran' | 'kind'>): DisplayText {
  if (!hasPlaceholder(dua.text)) return { text: dua.text, isFullSource: false, isPlaceholder: false };
  const full = dua.quran?.fullText;
  if (dua.kind === 'quran' && full && !hasPlaceholder(full)) return { text: full, isFullSource: true, isPlaceholder: false };
  return { text: dua.text, isFullSource: false, isPlaceholder: true };
}

/** The dua's kind as a chip label. */
export function kindLabel(kind: Dua['kind']): string {
  return kind === 'quran' ? 'من القرآن' : kind === 'sunnah' ? 'من السنة' : 'من كلام السلف';
}
