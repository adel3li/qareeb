/**
 * Migrations of stored shapes, by key and version. Every key is at version 1;
 * there is nothing to migrate yet. When a shape changes: raise VERSION in
 * stores.ts for that key, add a step here, add a test in migrations.test.ts,
 * and update docs/reference/storage.md.
 */

type Step = (state: unknown) => unknown;

/** steps[key][n] turns version n into version n + 1. */
const steps: Record<string, Record<number, Step>> = {};

export function migrate(key: string, state: unknown, fromVersion: number, toVersion = 1): unknown {
  let current = state;
  for (let v = fromVersion; v < toVersion; v++) {
    const step = steps[key]?.[v];
    if (!step) throw new Error(`No migration for ${key} from version ${v}`);
    current = step(current);
  }
  return current;
}
