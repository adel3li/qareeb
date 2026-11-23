import { describe, expect, it } from 'vitest';
import { groupByDay, livedDuas, upsertCompletion } from './progress';

const c = (date: string, duaId: string, intention?: 'now' | 'sujood') => ({ date, duaId, completedAt: `${date}T10:00:00.000Z`, intention });

describe('upsertCompletion', () => {
  it('records one completion per day, keeping the dua that day had', () => {
    let list = upsertCompletion([], c('2026-11-23', 'dua_0002', 'now'));
    list = upsertCompletion(list, c('2026-11-23', 'dua_0005', 'sujood'));
    expect(list).toHaveLength(1);
    expect(list[0].duaId).toBe('dua_0002');
    expect(list[0].intention).toBe('sujood');
  });
  it('keeps an intention when living again without one', () => {
    const list = upsertCompletion([c('2026-11-23', 'dua_0002', 'now')], c('2026-11-23', 'dua_0002'));
    expect(list[0].intention).toBe('now');
  });
  it('sorts by day', () => {
    const list = upsertCompletion([c('2026-11-23', 'a')], c('2026-11-20', 'b'));
    expect(list.map((x) => x.date)).toEqual(['2026-11-20', '2026-11-23']);
  });
});

describe('livedDuas', () => {
  it('lists each dua once, newest first', () => {
    expect(livedDuas([c('2026-11-01', 'a'), c('2026-11-03', 'b'), c('2026-11-05', 'a')])).toEqual([
      { duaId: 'a', date: '2026-11-05' },
      { duaId: 'b', date: '2026-11-03' },
    ]);
  });
});

describe('groupByDay', () => {
  it('groups newest day first', () => {
    const items = [
      { id: '1', date: '2026-11-01', createdAt: '2026-11-01T08:00:00Z' },
      { id: '2', date: '2026-11-02', createdAt: '2026-11-02T08:00:00Z' },
      { id: '3', date: '2026-11-01', createdAt: '2026-11-01T09:00:00Z' },
    ];
    expect(groupByDay(items).map((g) => [g.date, g.items.map((i) => i.id)])).toEqual([
      ['2026-11-02', ['2']],
      ['2026-11-01', ['3', '1']],
    ]);
  });
});
