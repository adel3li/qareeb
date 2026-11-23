import { describe, expect, it } from 'vitest';
import { hrefOf, parseHash } from './router';

describe('parseHash', () => {
  it('reads every tab and the dua page', () => {
    expect(parseHash('#/today')).toEqual({ name: 'today' });
    expect(parseHash('#/library')).toEqual({ name: 'library' });
    expect(parseHash('#/notebook')).toEqual({ name: 'notebook' });
    expect(parseHash('#/calendar')).toEqual({ name: 'calendar' });
    expect(parseHash('#/settings')).toEqual({ name: 'settings' });
    expect(parseHash('#/dua/dua_0007')).toEqual({ name: 'dua', id: 'dua_0007' });
  });
  it('sends anything unknown to Today, and a bad dua id to the library', () => {
    expect(parseHash('')).toEqual({ name: 'today' });
    expect(parseHash('#/nowhere')).toEqual({ name: 'today' });
    expect(parseHash('#/dua/../x')).toEqual({ name: 'library' });
  });
  it('round-trips', () => {
    expect(parseHash(hrefOf({ name: 'dua', id: 'dua_0001' }))).toEqual({ name: 'dua', id: 'dua_0001' });
  });
});
