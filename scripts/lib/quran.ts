import fs from 'node:fs';
import path from 'node:path';
import { SOURCES_DIR } from './paths';

export const QPC_EDITION = 'kfgqpc-hafs/api.quran.com:text_qpc_hafs';

let qpc: Record<string, string> | null = null;
const tanzil: Record<string, Record<string, string>> = {};

/** The King Fahd Complex text, by "surah:ayah", as copied from api.quran.com. */
export function qpcVerses(): Record<string, string> {
  if (!qpc) {
    const raw = JSON.parse(fs.readFileSync(path.join(SOURCES_DIR, 'quran-qpc-hafs.json'), 'utf8'));
    qpc = raw.verses as Record<string, string>;
  }
  return qpc;
}

/** Tanzil text ("uthmani" or "simple"), by "surah:ayah", from the pipe-separated file kept verbatim. */
export function tanzilVerses(kind: 'uthmani' | 'simple'): Record<string, string> {
  if (!tanzil[kind]) {
    const out: Record<string, string> = {};
    const lines = fs.readFileSync(path.join(SOURCES_DIR, `quran-${kind}.txt`), 'utf8').split('\n');
    for (const line of lines) {
      const m = /^(\d+)\|(\d+)\|(.*)$/.exec(line.trim());
      if (!m) continue;
      let text = m[3];
      // Tanzil writes the basmala before the first verse of every surah but al-Fatiha
      // (where it is verse 1) and at-Tawba (which has none). It is not part of the verse.
      if (m[2] === '1' && m[1] !== '1' && m[1] !== '9') text = text.split(' ').slice(4).join(' ');
      out[`${m[1]}:${m[2]}`] = text;
    }
    tanzil[kind] = out;
  }
  return tanzil[kind];
}

/** The verses from..to of a surah from a verse map, joined by a single space. Throws if one is missing. */
export function versesText(map: Record<string, string>, surah: number, from: number, to: number): string {
  const parts: string[] = [];
  for (let a = from; a <= to; a++) {
    const v = map[`${surah}:${a}`];
    if (v === undefined) throw new Error(`verse ${surah}:${a} not in the source`);
    parts.push(v);
  }
  return parts.join(' ');
}
