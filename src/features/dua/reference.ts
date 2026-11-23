import type { Dua } from '../../content/types';
import { ar } from '../../copy/ar';

/** «سورة الأنبياء: ٨٧» or «صحيح مسلم (٢٧٠٥)». */
export function referenceOf(dua: Pick<Dua, 'quran' | 'hadith'>): string {
  if (dua.quran) return ar.card.surahRef(dua.quran.surahName, dua.quran.ayahFrom, dua.quran.ayahTo);
  if (dua.hadith) return ar.card.hadithRef(dua.hadith.collection, dua.hadith.number);
  return '';
}

export function kindLabel(dua: Pick<Dua, 'kind'>): string {
  return dua.kind === 'quran' ? ar.card.quran : ar.card.sunnah;
}

/** Total length of «عِش الدعاء» in seconds, from the card's steps. */
export function liveSeconds(dua: Pick<Dua, 'steps'>): number {
  return dua.steps.reduce((sum, s) => sum + s.durationSec, 0);
}
