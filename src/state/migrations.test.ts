import { describe, expect, it } from 'vitest';
import { migrateSettings } from './migrations';

describe('settings migration', () => {
  it('keeps valid values', () => {
    expect(migrateSettings({ theme: 'dark', fontScale: 18, showMyDuasInFlow: false }, 1)).toEqual({ theme: 'dark', fontScale: 18, showMyDuasInFlow: false });
  });
  it('repairs damaged or unknown values from an unknown version', () => {
    expect(migrateSettings({ theme: 'blue', fontScale: 99, extra: 1 }, 0)).toEqual({ theme: 'system', fontScale: 24, showMyDuasInFlow: true });
    expect(migrateSettings(null, 0)).toEqual({ theme: 'system', fontScale: 16, showMyDuasInFlow: true });
  });
});
