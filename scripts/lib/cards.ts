import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

export const ROOT = join(import.meta.dir, '..', '..');
export const DUAS_DIR = join(ROOT, 'content', 'duas');

export interface CardFile {
  path: string;
  // Raw JSON before validation.
  data: Record<string, any>;
}

export function readCards(): CardFile[] {
  return readdirSync(DUAS_DIR)
    .filter((f) => f.endsWith('.json'))
    .sort()
    .map((f) => {
      const path = join(DUAS_DIR, f);
      return { path, data: JSON.parse(readFileSync(path, 'utf8')) };
    });
}

export function writeCard(card: CardFile): void {
  writeFileSync(card.path, JSON.stringify(card.data, null, 2) + '\n');
}

/** Placeholders that must never reach a production card. */
export const PLACEHOLDER = /<<[^>]*>>|\[\[[^\]]*\]\]/;
