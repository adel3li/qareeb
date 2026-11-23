import { describe, expect, it } from 'vitest';
import { groupByDay } from './notebook';

const e = (id: string, date: string, createdAt: string) => ({ id, date, text: 'x', createdAt, updatedAt: createdAt });

describe('groupByDay', () => {
  it('groups by the stored day, newest first', () => {
    const groups = groupByDay([e('a', '2026-11-21', '1'), e('b', '2026-11-23', '2'), e('c', '2026-11-23', '3')]);
    expect(groups.map((g) => [g.date, g.entries.map((x) => x.id)])).toEqual([
      ['2026-11-23', ['c', 'b']],
      ['2026-11-21', ['a']],
    ]);
  });
});
