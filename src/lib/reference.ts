import type { AppDua } from '../content/types';
import { toArabicNumerals } from './arabic';

/** «سورة الأنبياء: ٨٧», «سورة الفاتحة: ٦–٧», «صحيح مسلم (٢٧٠٥)». */
export function sourceReference(dua: Pick<AppDua, 'quran' | 'hadith'>): string {
  if (dua.quran) {
    const { surahName, ayahFrom, ayahTo } = dua.quran;
    const ayat = ayahFrom === ayahTo ? toArabicNumerals(ayahFrom) : `${toArabicNumerals(ayahFrom)}–${toArabicNumerals(ayahTo)}`;
    return `سورة ${surahName}: ${ayat}`;
  }
  if (dua.hadith) return `${dua.hadith.collection} (${toArabicNumerals(dua.hadith.number)})`;
  return '';
}

/** The dua between its marks: ﴿ ﴾ for the Qur'an, « » for hadith. */
export function markedText(dua: Pick<AppDua, 'kind' | 'text'>): string {
  return dua.kind === 'quran' ? `﴿${dua.text}﴾` : `«${dua.text}»`;
}

/** The text version for copying and sharing (02 §10). Never carries anything the user wrote. */
export function shareText(dua: Pick<AppDua, 'kind' | 'text' | 'title' | 'sceneLine' | 'quran' | 'hadith'>, url: string): string {
  return [`«${dua.title}»`, markedText(dua), `[${sourceReference(dua)}]`, '', dua.sceneLine, `— قريب  ${url}`].join('\n');
}
