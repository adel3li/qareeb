import { describe, expect, it } from 'vitest';
import { migrate, VERSIONS, MIGRATIONS } from './migrations';
import { KEYS } from './keys';

describe('migrations', () => {
  it('has a version and a migration table for every key', () => {
    expect(Object.keys(VERSIONS).sort()).toEqual(Object.keys(KEYS).sort());
    expect(Object.keys(MIGRATIONS).sort()).toEqual(Object.keys(KEYS).sort());
  });
  it('leaves a current value unchanged', () => {
    const v = [{ date: '2026-11-23', duaId: 'dua_0001', completedAt: '2026-11-23T10:00:00.000Z' }];
    expect(migrate('completions', v, VERSIONS.completions)).toBe(v);
  });
  it('fails loudly when a step is missing', () => {
    expect(() => migrate('completions', [], 0)).toThrow();
  });
});
