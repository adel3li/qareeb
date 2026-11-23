import { beforeAll, beforeEach, describe, expect, it } from 'vitest';

class MemoryStorage {
  private map = new Map<string, string>();
  get length() { return this.map.size; }
  key(i: number) { return [...this.map.keys()][i] ?? null; }
  getItem(k: string) { return this.map.get(k) ?? null; }
  setItem(k: string, v: string) { this.map.set(k, String(v)); }
  removeItem(k: string) { this.map.delete(k); }
  clear() { this.map.clear(); }
}
const ls = new MemoryStorage();
(globalThis as { localStorage?: unknown }).localStorage = ls;

let mod: typeof import('./store');
let data: typeof import('./data');
let backup: typeof import('../lib/backup');
beforeAll(async () => {
  mod = await import('./store');
  data = await import('./data');
  backup = await import('../lib/backup');
});
beforeEach(() => data.eraseAll());

describe('stores', () => {
  it('writes nothing until the user acts', () => {
    expect(ls.length).toBe(0);
    mod.useSettings.getState();
    mod.useCompletions.getState();
    expect(ls.length).toBe(0);
  });

  it('records one completion per local day, with the dua id', () => {
    const { complete } = mod.useCompletions.getState();
    complete({ date: '2026-11-23', duaId: 'dua_0001' });
    complete({ date: '2026-11-23', duaId: 'dua_0001', intention: 'sujood' });
    complete({ date: '2026-11-22', duaId: 'dua_0002' });
    const items = mod.useCompletions.getState().items;
    expect(items.map((c) => [c.date, c.duaId, c.intention])).toEqual([
      ['2026-11-22', 'dua_0002', undefined],
      ['2026-11-23', 'dua_0001', 'sujood'],
    ]);
    const stored = JSON.parse(ls.getItem('qareeb:completions:v1')!);
    expect(stored.version).toBe(1);
    expect(stored.state.items).toHaveLength(2);
  });

  it('marks the welcome dua done once, on its first day', () => {
    mod.useWelcome.getState().markDone('2026-11-23');
    mod.useWelcome.getState().markDone('2026-11-24');
    expect(mod.useWelcome.getState().doneOn).toBe('2026-11-23');
  });

  it('keeps drafts until saved and removes empty ones', () => {
    const d = mod.useDrafts.getState();
    d.setDraft('dua_0001', { notebookText: 'مسودة' });
    expect(mod.useDrafts.getState().byDua.dua_0001.notebookText).toBe('مسودة');
    mod.useDrafts.getState().setDraft('dua_0001', { notebookText: '' });
    expect(mod.useDrafts.getState().byDua.dua_0001).toBeUndefined();
  });

  it('answers and un-answers a need', () => {
    const item = mod.useMyDuas.getState().add({ text: 'حاجة' });
    mod.useMyDuas.getState().setAnswered(item.id, { answeredAt: '2026-11-23T10:00:00.000Z', answerNote: 'كيف' });
    expect(mod.useMyDuas.getState().items[0].answerNote).toBe('كيف');
    mod.useMyDuas.getState().setAnswered(item.id, null);
    expect(mod.useMyDuas.getState().items[0]).not.toHaveProperty('answeredAt');
  });

  it('erases every qareeb: key and nothing else', () => {
    ls.setItem('other:key', 'x');
    mod.useFavorites.getState().toggle('dua_0001');
    expect(ls.getItem('qareeb:favorites:v1')).not.toBeNull();
    data.eraseAll();
    expect(ls.getItem('qareeb:favorites:v1')).toBeNull();
    expect(ls.getItem('other:key')).toBe('x');
    expect(mod.useFavorites.getState().ids).toEqual([]);
  });
});

describe('backup', () => {
  it('round-trips: export then import restores the same data', () => {
    mod.useSettings.getState().setTheme('dark');
    mod.useSettings.getState().setFontScale(20);
    mod.useCompletions.getState().complete({ date: '2026-11-22', duaId: 'dua_0002', intention: 'now' });
    mod.useNotebook.getState().add({ date: '2026-11-22', text: 'سطر', duaId: 'dua_0002' });
    mod.useMyDuas.getState().add({ text: 'حاجة', note: 'ملاحظة' });
    mod.useFavorites.getState().toggle('dua_0002');
    mod.useWelcome.getState().markDone('2026-11-21');
    const before = data.snapshot();
    const text = backup.serializeBackup(backup.buildBackup(before));
    data.eraseAll();
    expect(data.snapshot().completions).toEqual([]);
    const parsed = backup.parseBackup(text);
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.summary).toMatchObject({ days: 1, entries: 1, needs: 1, favorites: 1 });
    data.restore(parsed.file.data);
    expect(data.snapshot()).toEqual(before);
  });

  it('rejects damaged files without touching data', () => {
    mod.useFavorites.getState().toggle('dua_0001');
    expect(backup.parseBackup('{not json')).toEqual({ ok: false, error: 'notJson' });
    expect(backup.parseBackup(JSON.stringify({ app: 'other' }))).toEqual({ ok: false, error: 'notJson' });
    const good = backup.buildBackup(data.snapshot());
    const extra = { ...good, data: { ...good.data, unknown: 1 } };
    expect(backup.parseBackup(JSON.stringify(extra))).toEqual({ ok: false, error: 'invalid' });
    const badDay = { ...good, data: { ...good.data, completions: [{ date: '23-11-2026', duaId: 'dua_0001', completedAt: '2026-11-23T10:00:00.000Z' }] } };
    expect(backup.parseBackup(JSON.stringify(badDay))).toEqual({ ok: false, error: 'invalid' });
    expect(backup.parseBackup(JSON.stringify({ ...good, backupVersion: 2 }))).toEqual({ ok: false, error: 'newer' });
    expect(backup.parseBackup('x', 6 * 1024 * 1024)).toEqual({ ok: false, error: 'tooLarge' });
    expect(mod.useFavorites.getState().ids).toEqual(['dua_0001']);
  });
});
