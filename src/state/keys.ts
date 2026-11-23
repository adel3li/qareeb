import { STORAGE_PREFIX } from '../config';

/**
 * Every localStorage key the app uses, in one place, with one pattern:
 * `qareeb:name:v1`. Documented in docs/reference/storage.md. Never rename a
 * key or change a stored shape without a migration and a test.
 */
export const KEYS = {
  settings: `${STORAGE_PREFIX}:settings:v1`,
  onboarding: `${STORAGE_PREFIX}:onboarding:v1`,
  welcome: `${STORAGE_PREFIX}:welcome:v1`,
  completions: `${STORAGE_PREFIX}:completions:v1`,
  notebook: `${STORAGE_PREFIX}:notebook:v1`,
  myDuas: `${STORAGE_PREFIX}:my-duas:v1`,
  favorites: `${STORAGE_PREFIX}:favorites:v1`,
  drafts: `${STORAGE_PREFIX}:drafts:v1`,
} as const;

export type KeyName = keyof typeof KEYS;

/** Every key that belongs to the app, for «امسح كل بياناتي». */
export function isAppKey(key: string): boolean {
  return key.startsWith(`${STORAGE_PREFIX}:`);
}
