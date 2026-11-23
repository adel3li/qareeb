import { describe, expect, it } from 'vitest';
import { href, parseRoute, tabOf } from './routes';

describe('hash routes', () => {
  it('parses every tab and the dua page', () => {
    expect(parseRoute('')).toEqual({ name: 'today' });
    expect(parseRoute('#/today')).toEqual({ name: 'today' });
    expect(parseRoute('#/library')).toEqual({ name: 'library' });
    expect(parseRoute('#/notebook/my-duas')).toEqual({ name: 'notebook', view: 'my-duas' });
    expect(parseRoute('#/calendar')).toEqual({ name: 'calendar' });
    expect(parseRoute('#/settings')).toEqual({ name: 'settings' });
    expect(parseRoute('#/dua/dua_0007')).toEqual({ name: 'dua', id: 'dua_0007' });
    expect(parseRoute('#/unknown')).toEqual({ name: 'today' });
  });
  it('round-trips', () => {
    for (const h of ['#/today', '#/library', '#/notebook', '#/notebook/my-duas', '#/calendar', '#/settings', '#/dua/dua_0003']) {
      expect(href(parseRoute(h))).toBe(h);
    }
    expect(tabOf(parseRoute('#/dua/dua_0003'))).toBe('library');
  });
});
