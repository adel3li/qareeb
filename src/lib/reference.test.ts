import { describe, expect, it } from 'vitest';
import { displayTextOf, referenceOf } from './reference';

const quran = { surah: 1, surahName: 'الفاتحة', ayahFrom: 6, ayahTo: 7, fullText: 'نص الآية يُنسخ من مصدره', edition: 'test' };

describe('references and displayed text', () => {
  it('formats Qur\'an and hadith references in Arabic-Indic digits', () => {
    expect(referenceOf({ quran })).toBe('سورة الفاتحة: ٦–٧');
    expect(referenceOf({ quran: { ...quran, ayahTo: 6 } })).toBe('سورة الفاتحة: ٦');
    expect(referenceOf({ hadith: { collection: 'صحيح مسلم', number: '2705' } as never })).toBe('صحيح مسلم (٢٧٠٥)');
  });

  it('shows the stored text exactly', () => {
    expect(displayTextOf({ kind: 'quran', text: 'نص الدعاء', quran })).toEqual({ text: 'نص الدعاء', isFullSource: false, isPlaceholder: false });
  });

  it('shows the whole copied verse while a Qur\'an draft has no excerpt yet', () => {
    expect(displayTextOf({ kind: 'quran', text: '<<يُنسخ من المصدر>>', quran })).toMatchObject({ text: quran.fullText, isFullSource: true });
  });

  it('keeps a hadith draft as its placeholder', () => {
    expect(displayTextOf({ kind: 'sunnah', text: '<<يُنسخ من المصدر>>' })).toMatchObject({ isPlaceholder: true });
  });
});
