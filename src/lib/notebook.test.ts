import { describe, expect, it } from 'vitest';
import { groupByDay, intentionFor, livedDuas } from './notebook';

const e = (id: string, date: string, createdAt: string, duaId?: string) => ({ id, date, createdAt, updatedAt: createdAt, text: 'نص', ...(duaId ? { duaId } : {}) });

describe('notebook helpers', () => {
  it('groups by stored day, newest first', () => {
    const groups = groupByDay([e('a', '2026-11-20', '2026-11-20T10:00:00Z'), e('b', '2026-11-22', '2026-11-22T09:00:00Z'), e('c', '2026-11-22', '2026-11-22T11:00:00Z')]);
    expect(groups.map((g) => [g.date, g.items.map((i) => i.id)])).toEqual([['2026-11-22', ['c', 'b']], ['2026-11-20', ['a']]]);
  });
  it('reads the intention from the stored completion', () => {
    const completions = [{ date: '2026-11-22', duaId: 'dua_0002', completedAt: '2026-11-22T10:00:00Z', intention: 'now' as const }];
    expect(intentionFor(e('a', '2026-11-22', 'x', 'dua_0002'), completions)).toBe('now');
    expect(intentionFor(e('a', '2026-11-22', 'x', 'dua_0001'), completions)).toBeUndefined();
    expect(intentionFor(e('a', '2026-11-22', 'x'), completions)).toBeUndefined();
  });
  it('lists lived duas once, newest first', () => {
    const c = (date: string, duaId: string) => ({ date, duaId, completedAt: `${date}T10:00:00Z` });
    expect(livedDuas([c('2026-11-01', 'dua_0002'), c('2026-11-03', 'dua_0001'), c('2026-11-05', 'dua_0002')])).toEqual([
      { duaId: 'dua_0002', date: '2026-11-05' },
      { duaId: 'dua_0001', date: '2026-11-03' },
    ]);
  });
});
