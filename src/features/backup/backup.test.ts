import { beforeEach, describe, expect, it } from 'vitest';
import { KEYS } from '../../state/keys';
import { eraseAll, snapshot, useCompletions, useFavorites, useMyDuas, useNotebook, useSettings, useWelcome } from '../../state/stores';
import { applyBackup, buildBackup, parseBackup } from './backup';

describe('backup', () => {
  beforeEach(() => {
    localStorage.clear();
    eraseAll();
  });

  it('round-trips: export then import gives the same state', () => {
    useSettings.getState().update({ theme: 'dark', fontScale: 18 });
    useWelcome.getState().markDone('2026-11-23');
    useCompletions.getState().complete({ date: '2026-11-23', duaId: 'dua_0001', intention: 'sujood' });
    useNotebook.getState().add({ date: '2026-11-23', duaId: 'dua_0001', text: 'سطر للتجربة' });
    useMyDuas.getState().add({ text: 'حاجة للتجربة', note: 'ملاحظة' });
    useFavorites.getState().toggle('dua_0002');
    const before = snapshot();
    const raw = JSON.stringify(buildBackup(before));

    eraseAll();
    expect(snapshot().completions).toEqual([]);

    const parsed = parseBackup(raw);
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.summary).toMatchObject({ days: 1, entries: 1, needs: 1, favorites: 1 });
    applyBackup(parsed.backup);
    expect(snapshot()).toEqual(before);
    expect(localStorage.getItem(KEYS.completions)).toContain('dua_0001');
  });

  it('rejects damaged files and changes nothing', () => {
    useFavorites.getState().toggle('dua_0002');
    for (const raw of ['', 'not json', '{}', JSON.stringify({ app: 'alhamd', backupVersion: 1, exportedAt: '2026-11-23T00:00:00.000Z', data: {} })]) {
      expect(parseBackup(raw).ok).toBe(false);
    }
    expect(useFavorites.getState().ids).toEqual(['dua_0002']);
  });

  it('rejects unknown fields and bad records', () => {
    const good = buildBackup(snapshot());
    const extra = { ...good, data: { ...good.data, unknownField: 3 } };
    expect(parseBackup(JSON.stringify(extra)).ok).toBe(false);
    const badDay = { ...good, data: { ...good.data, completions: [{ date: '23/11/2026', duaId: 'dua_0001', completedAt: '2026-11-23T00:00:00.000Z' }] } };
    expect(parseBackup(JSON.stringify(badDay)).ok).toBe(false);
    const twoOnOneDay = {
      ...good,
      data: {
        ...good.data,
        completions: [
          { date: '2026-11-23', duaId: 'dua_0001', completedAt: '2026-11-23T00:00:00.000Z' },
          { date: '2026-11-23', duaId: 'dua_0002', completedAt: '2026-11-23T01:00:00.000Z' },
        ],
      },
    };
    expect(parseBackup(JSON.stringify(twoOnOneDay)).ok).toBe(false);
  });

  it('rejects files that are too large', () => {
    expect(parseBackup('x'.repeat(6 * 1024 * 1024))).toEqual({ ok: false, reason: 'too_large' });
  });
});
