import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { DUAS_DIR, RETIRED_IDS } from './paths.ts';

export interface CardFile {
  file: string;
  path: string;
  raw: unknown;
}

/** Every card file in content/duas, sorted by name, parsed but not validated. */
export function readCardFiles(dir = DUAS_DIR): CardFile[] {
  return readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .sort()
    .map((file) => {
      const path = join(dir, file);
      return { file, path, raw: JSON.parse(readFileSync(path, 'utf8')) as unknown };
    });
}

export function readRetiredIds(path = RETIRED_IDS): string[] {
  try {
    return JSON.parse(readFileSync(path, 'utf8')) as string[];
  } catch {
    return [];
  }
}

/** Writes a card back with the formatting the files use (2 spaces, final newline). */
export function writeCard(path: string, card: unknown): void {
  writeFileSync(path, `${JSON.stringify(card, null, 2)}\n`);
}
