import { describe, expect, it } from 'vitest';
import type { Dua } from '../content/types';
import { livedDuas, searchDuas } from './library';

const dua = (id: string, title: string, searchText = 'نص تجريبي'): Dua => ({ id, title, shortTitle: title, hook: '', sceneLine: '', searchText }) as unknown as Dua;
const duas = [dua('dua_0001', 'دعاء الهداية'), dua('dua_0002', 'دعاء في الضيق', 'لا إله إلا أنت'), dua('dua_0003', 'دعاء الاعتراف')];

describe('livedDuas', () => {
  it('lists each lived dua once, newest first, by the stored id', () => {
    const items = livedDuas(
      [
        { date: '2026-11-20', duaId: 'dua_0002', completedAt: '' },
        { date: '2026-11-21', duaId: 'dua_0001', completedAt: '' },
        { date: '2026-11-23', duaId: 'dua_0002', completedAt: '' },
        { date: '2026-11-22', duaId: 'dua_9999', completedAt: '' },
      ],
      duas,
    );
    expect(items.map((i) => [i.dua.id, i.date])).toEqual([
      ['dua_0002', '2026-11-23'],
      ['dua_0001', '2026-11-21'],
    ]);
  });
});

describe('searchDuas', () => {
  const items = duas.map((d) => ({ dua: d }));
  it('ignores vowel marks and letter forms in both directions', () => {
    expect(searchDuas(items, 'الْهِدَايَة').map((i) => i.dua.id)).toEqual(['dua_0001']);
    expect(searchDuas(items, 'لا اله الا انت').map((i) => i.dua.id)).toEqual(['dua_0002']);
    expect(searchDuas(items, 'الضّيق').map((i) => i.dua.id)).toEqual(['dua_0002']);
    expect(searchDuas(items, '')).toHaveLength(3);
  });
});
