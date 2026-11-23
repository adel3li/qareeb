import { describe, expect, it } from 'vitest';
import { hrefOf, parseHash, tabOf } from './router';

describe('router', () => {
  it('parses every tab and the dua page', () => {
    expect(parseHash('')).toEqual({ name: 'today' });
    expect(parseHash('#/library')).toEqual({ name: 'library' });
    expect(parseHash('#/settings')).toEqual({ name: 'settings' });
    expect(parseHash('#/dua/dua_0007')).toEqual({ name: 'dua', id: 'dua_0007' });
  });
  it('returns null for unknown addresses', () => {
    expect(parseHash('#/nowhere')).toBeNull();
    expect(parseHash('#/dua/')).toBeNull();
  });
  it('round-trips and maps a dua page to the library tab', () => {
    expect(parseHash(hrefOf({ name: 'dua', id: 'dua_0003' }))).toEqual({ name: 'dua', id: 'dua_0003' });
    expect(tabOf({ name: 'dua', id: 'x' })).toBe('library');
    expect(tabOf({ name: 'settings' })).toBeNull();
  });
});
