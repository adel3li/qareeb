import { FONT_SCALE } from '../config';
import { DEFAULT_SETTINGS, settingsSchema, type Settings } from './schemas';

/**
 * Migrations for the persisted stores. Every store is at version 1, the
 * first shape. A store that reads a version it does not know keeps whatever
 * still fits the current shape and falls back to defaults for the rest, so a
 * damaged value never breaks the app. Add one function per future version
 * here, with its test in migrations.test.ts.
 */

export function sanitizeSettings(value: unknown): Settings {
  const v = (value && typeof value === 'object' ? value : {}) as Record<string, unknown>;
  const theme = v.theme === 'light' || v.theme === 'dark' || v.theme === 'system' ? v.theme : DEFAULT_SETTINGS.theme;
  const scale = typeof v.fontScale === 'number' && Number.isFinite(v.fontScale) ? Math.round(v.fontScale) : DEFAULT_SETTINGS.fontScale;
  const fontScale = Math.min(FONT_SCALE.max, Math.max(FONT_SCALE.min, scale));
  const showMyDuasInFlow = typeof v.showMyDuasInFlow === 'boolean' ? v.showMyDuasInFlow : DEFAULT_SETTINGS.showMyDuasInFlow;
  return settingsSchema.parse({ theme, fontScale, showMyDuasInFlow });
}

/** zustand persist `migrate` for qareeb:settings:v1. */
export function migrateSettings(persisted: unknown, _version: number): Settings {
  return sanitizeSettings(persisted);
}
