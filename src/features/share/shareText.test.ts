import { describe, expect, it } from 'vitest';
import { shareText } from './shareText';

// Neutral Arabic, not sacred text.
const dua = {
  id: 'dua_0042',
  title: 'عنوان تجريبي',
  kind: 'sunnah' as const,
  text: 'نص تجريبي يُنسخ من مصدره',
  sceneLine: 'سطر موقف تجريبي',
  hadith: { collection: 'صحيح مسلم', number: '12' } as never,
};

describe('shareText', () => {
  it('follows the copy format, with the dua link', () => {
    expect(shareText(dua, 'https://example.app')).toBe(
      ['«عنوان تجريبي»', '«نص تجريبي يُنسخ من مصدره»', '[صحيح مسلم (١٢)]', '', 'سطر موقف تجريبي', '— قريب  https://example.app/#/dua/dua_0042'].join('\n'),
    );
  });
  it('uses the Qur\'an marks for a verse', () => {
    const t = shareText({ ...dua, kind: 'quran', hadith: undefined, quran: { surahName: 'اسم', ayahFrom: 3, ayahTo: 4 } as never }, 'https://x');
    expect(t.split('\n')[1]).toBe('﴿نص تجريبي يُنسخ من مصدره﴾');
    expect(t.split('\n')[2]).toBe('[سورة اسم: ٣–٤]');
  });
});
