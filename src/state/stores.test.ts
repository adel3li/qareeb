import { beforeEach, describe, expect, it } from 'vitest';
import { KEYS } from './keys';
import { migrate } from './migrations';
import { eraseAll, useCompletions, useDrafts, useMyDuas, useNotebook, useWelcome } from './stores';

describe('stores', () => {
  beforeEach(() => {
    localStorage.clear();
    eraseAll();
    localStorage.clear();
  });

  it('writes nothing until the user acts', () => {
    useCompletions.getState();
    useWelcome.getState();
    expect(Object.keys(localStorage)).toEqual([]);
  });

  it('records a day once, with the dua that was shown', () => {
    const { complete } = useCompletions.getState();
    complete({ date: '2026-11-23', duaId: 'dua_0001' });
    complete({ date: '2026-11-23', duaId: 'dua_0002', intention: 'now' });
    const items = useCompletions.getState().items;
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({ date: '2026-11-23', duaId: 'dua_0001', intention: 'now' });
    const stored = JSON.parse(localStorage.getItem(KEYS.completions)!);
    expect(stored).toMatchObject({ version: 1, state: { items: [{ duaId: 'dua_0001' }] } });
  });

  it('keeps the first welcome day', () => {
    useWelcome.getState().markDone('2026-11-23');
    useWelcome.getState().markDone('2026-11-24');
    expect(useWelcome.getState().doneOn).toBe('2026-11-23');
  });

  it('saves and clears drafts', () => {
    useDrafts.getState().saveNotebookDraft('dua_0001', 'مسودة');
    expect(useDrafts.getState().byDua.dua_0001.notebookText).toBe('مسودة');
    useDrafts.getState().saveNotebookDraft('dua_0001', '   ');
    expect(useDrafts.getState().byDua.dua_0001).toBeUndefined();
  });

  it('marks a need answered and open again', () => {
    useMyDuas.getState().add({ text: 'حاجة' });
    const id = useMyDuas.getState().items[0].id;
    useMyDuas.getState().markAnswered(id, '2026-11-23', 'هكذا');
    expect(useMyDuas.getState().items[0]).toMatchObject({ answeredAt: '2026-11-23', answerNote: 'هكذا' });
    useMyDuas.getState().markOpen(id);
    expect(useMyDuas.getState().items[0].answeredAt).toBeUndefined();
  });

  it('edits and removes notebook entries', () => {
    const e = useNotebook.getState().add({ date: '2026-11-23', text: 'أول' });
    useNotebook.getState().edit(e.id, 'ثانٍ');
    expect(useNotebook.getState().items[0].text).toBe('ثانٍ');
    useNotebook.getState().remove(e.id);
    expect(useNotebook.getState().items).toEqual([]);
  });

  it('erases every app key and nothing else', () => {
    useNotebook.getState().add({ date: '2026-11-23', text: 'x' });
    localStorage.setItem('other-app', '1');
    eraseAll();
    expect(Object.keys(localStorage)).toEqual(['other-app']);
  });
});

describe('migrations', () => {
  it('passes the current version through and refuses an unknown path', () => {
    expect(migrate(KEYS.settings, { a: 1 }, 1)).toEqual({ a: 1 });
    expect(() => migrate(KEYS.settings, {}, 0)).toThrow();
  });
});
