import { describe, expect, it } from 'vitest';
import { buildBackup, parseBackup } from './backup';
import { DEFAULTS, type StoredData } from '../../state/shapes';

const sample: StoredData = {
  ...DEFAULTS,
  settings: { theme: 'dark', fontScale: 18, showMyDuasInFlow: false },
  onboarding: { completedAt: '2026-11-20T08:00:00.000Z' },
  welcome: { doneOn: '2026-11-20' },
  completions: [
    { date: '2026-11-20', duaId: 'dua_0001', completedAt: '2026-11-20T08:00:00.000Z', intention: 'now' },
    { date: '2026-11-21', duaId: 'dua_0002', completedAt: '2026-11-21T08:00:00.000Z' },
  ],
  notebook: [{ id: 'note_1', date: '2026-11-20', duaId: 'dua_0001', text: 'سطر تجريبي', createdAt: '2026-11-20T08:00:00.000Z', updatedAt: '2026-11-20T08:00:00.000Z' }],
  myDuas: [{ id: 'need_1', text: 'حاجة تجريبية', createdAt: '2026-11-20T08:00:00.000Z', answeredAt: '2026-11-21T08:00:00.000Z', answerNote: 'كيف' }],
  favorites: ['dua_0002'],
  drafts: { dua_0003: { notebookText: 'مسودة', updatedAt: '2026-11-21T08:00:00.000Z' } },
};

describe('backup', () => {
  it('round-trips: export then import gives the same data', () => {
    const text = JSON.stringify(buildBackup(sample, new Date('2026-11-23T18:00:00Z')));
    const result = parseBackup(text);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data).toEqual(sample);
    expect(result.summary).toMatchObject({ days: 2, entries: 1, needs: 1, favorites: 1 });
  });

  it('rejects files that are not a qareeb backup', () => {
    expect(parseBackup('not json')).toEqual({ ok: false, reason: 'invalid' });
    expect(parseBackup('{}')).toEqual({ ok: false, reason: 'invalid' });
    expect(parseBackup(JSON.stringify({ ...buildBackup(sample), app: 'alhamd' })).ok).toBe(false);
  });

  it('rejects unknown fields and bad records', () => {
    const b = buildBackup(sample) as any;
    expect(parseBackup(JSON.stringify({ ...b, extra: 1 })).ok).toBe(false);
    expect(parseBackup(JSON.stringify({ ...b, data: { ...b.data, unknownField: 3 } })).ok).toBe(false);
    const badDay = structuredClone(b);
    badDay.data.completions[0].date = '20/11/2026';
    expect(parseBackup(JSON.stringify(badDay)).ok).toBe(false);
    const twice = structuredClone(b);
    twice.data.completions[1].date = twice.data.completions[0].date;
    expect(parseBackup(JSON.stringify(twice)).ok).toBe(false);
  });

  it('rejects files over the size limit', () => {
    expect(parseBackup(' '.repeat(5 * 1024 * 1024 + 1))).toEqual({ ok: false, reason: 'too_large' });
  });
});
