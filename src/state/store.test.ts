import { beforeEach, describe, expect, it } from 'vitest';
import { KEYS } from './keys';

describe('stores', () => {
  beforeEach(() => localStorage.clear());

  it('writes nothing on first run', async () => {
    const { stores, getStored } = await import('./store');
    expect(getStored('completions')).toEqual([]);
    await Promise.all(Object.values(stores).map((s) => (s as any).persist.rehydrate()));
    expect(Object.keys(localStorage)).toEqual([]);
  });

  it('writes under the registered key with one completion per day and the dua id', async () => {
    const { completeDua } = await import('./actions');
    const { getStored } = await import('./store');
    completeDua('dua_0001', { isWelcome: true, intention: 'now', now: new Date(2026, 10, 23, 1, 30) });
    completeDua('dua_0001', { isWelcome: true, now: new Date(2026, 10, 23, 9, 0) });
    expect(getStored('completions')).toHaveLength(1);
    expect(getStored('completions')[0]).toMatchObject({ date: '2026-11-23', duaId: 'dua_0001', intention: 'now' });
    expect(getStored('welcome')).toEqual({ doneOn: '2026-11-23' });
    const raw = JSON.parse(localStorage.getItem(KEYS.completions)!);
    expect(raw.version).toBe(1);
    expect(raw.state.value[0].duaId).toBe('dua_0001');
  });

  it('drops stored records that do not match their shape, keeps the rest', async () => {
    const { sanitize } = await import('./migrations');
    const good = { date: '2026-11-23', duaId: 'dua_0001', completedAt: '2026-11-23T10:00:00.000Z' };
    expect(sanitize('completions', [good, { date: 'x' }])).toEqual([good]);
    expect(sanitize('settings', { theme: 'dark', fontScale: 99 })).toEqual({ theme: 'dark', fontScale: 16, showMyDuasInFlow: true });
  });

  it('erases every qareeb: key and nothing else', async () => {
    const { eraseAll, getStored } = await import('./store');
    const { setFavorite } = await import('./actions');
    setFavorite('dua_0002', true);
    localStorage.setItem('other-app', 'keep');
    eraseAll();
    expect(getStored('favorites')).toEqual([]);
    expect(Object.keys(localStorage)).toEqual(['other-app']);
  });
});
