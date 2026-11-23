import fs from 'node:fs';
import path from 'node:path';
import { DUAS_DIR } from './paths';

/** A card as read from disk: the parsed JSON (unvalidated) and its file. */
export interface CardFile {
  file: string;
  name: string;
  data: Record<string, unknown> & { id?: unknown };
}

export function readCards(dir = DUAS_DIR): CardFile[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .sort()
    .map((name) => {
      const file = path.join(dir, name);
      return { file, name, data: JSON.parse(fs.readFileSync(file, 'utf8')) };
    });
}

export function writeCard(file: string, data: unknown): void {
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
}
