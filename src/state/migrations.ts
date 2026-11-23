import { SHAPES, DEFAULTS, type StoredData } from './shapes';
import type { StoreName } from './keys';

/**
 * Version of each stored shape, and how to bring an older stored value up to it.
 * Every store is at version 1, the first release: there is nothing to migrate yet.
 * When a shape changes: bump its version here, add a step to MIGRATIONS, add a
 * test in migrations.test.ts, and update docs/reference/storage.md.
 */
export const VERSIONS: Record<StoreName, number> = {
  settings: 1,
  onboarding: 1,
  welcome: 1,
  completions: 1,
  notebook: 1,
  myDuas: 1,
  favorites: 1,
  drafts: 1,
};

type Step = (value: unknown) => unknown;
/** MIGRATIONS[name][n] turns a version-n value into version n+1. */
export const MIGRATIONS: { [K in StoreName]: Record<number, Step> } = {
  settings: {},
  onboarding: {},
  welcome: {},
  completions: {},
  notebook: {},
  myDuas: {},
  favorites: {},
  drafts: {},
};

export function migrate<K extends StoreName>(name: K, value: unknown, fromVersion: number): unknown {
  let v = value;
  for (let n = fromVersion; n < VERSIONS[name]; n++) {
    const step = MIGRATIONS[name][n];
    if (!step) throw new Error(`No migration for ${name} from version ${n}`);
    v = step(v);
  }
  return v;
}

/**
 * Reads a stored value defensively: a record that does not match its shape is
 * dropped (arrays keep their valid records), never "repaired" into something
 * the user did not write. Settings fall back field by field to the defaults.
 */
export function sanitize<K extends StoreName>(name: K, value: unknown): StoredData[K] {
  const shape = SHAPES[name];
  const whole = shape.safeParse(value);
  if (whole.success) return whole.data as StoredData[K];
  if (Array.isArray(value) && 'element' in shape) {
    const element = (shape as unknown as { element: { safeParse: (v: unknown) => { success: boolean; data?: unknown } } }).element;
    return value.flatMap((item) => {
      const r = element.safeParse(item);
      return r.success ? [r.data] : [];
    }) as StoredData[K];
  }
  if (name === 'settings' && value && typeof value === 'object') {
    const merged = { ...DEFAULTS.settings } as Record<string, unknown>;
    for (const [k, v] of Object.entries(value)) {
      const one = SHAPES.settings.safeParse({ ...DEFAULTS.settings, [k]: v });
      if (one.success) merged[k] = v;
    }
    return merged as StoredData[K];
  }
  if (name === 'drafts' && value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) if (SHAPES.drafts.safeParse({ [k]: v }).success) out[k] = v;
    return out as StoredData[K];
  }
  return DEFAULTS[name];
}
