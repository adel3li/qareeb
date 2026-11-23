import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { SOURCES_DIR } from './paths.ts';

/**
 * Reads the copied Qur'an texts in content/sources by reference. Nothing here
 * writes or changes a verse: the King Fahd Complex text is returned exactly as
 * stored, and Tanzil's texts are used to compare letters and to search.
 */

export type VerseKey = `${number}:${number}`;

let qpc: Record<string, string> | null = null;
const tanzil: Record<'uthmani' | 'simple', Map<string, string> | null> = { uthmani: null, simple: null };

export function qpcVerses(): Record<string, string> {
  if (!qpc) {
    const file = JSON.parse(readFileSync(join(SOURCES_DIR, 'quran-qpc-hafs.json'), 'utf8')) as { verses: Record<string, string> };
    qpc = file.verses;
  }
  return qpc;
}

const BASMALA_LETTERS = 'بسماللهالرحمنالرحيم';

function dropBasmala(text: string): string {
  const words = text.split(' ');
  if (words.length > 4 && quranLetters(words.slice(0, 4).join(' ')) === BASMALA_LETTERS) return words.slice(4).join(' ');
  return text;
}

/**
 * Tanzil's text files: `surah|ayah|text` per line, comments start with #.
 * Tanzil writes the basmala before verse 1 of every surah but al-Fatiha and
 * at-Tawba; it is not part of the verse, so it is removed here.
 */
export function tanzilVerses(kind: 'uthmani' | 'simple'): Map<string, string> {
  const cached = tanzil[kind];
  if (cached) return cached;
  const map = new Map<string, string>();
  const raw = readFileSync(join(SOURCES_DIR, `quran-${kind}.txt`), 'utf8');
  for (const line of raw.split('\n')) {
    if (!line || line.startsWith('#')) continue;
    const [s, a, ...rest] = line.split('|');
    let text = rest.join('|').trim();
    if (a === '1' && s !== '1' && s !== '9') text = dropBasmala(text);
    map.set(`${s}:${a}`, text);
  }
  tanzil[kind] = map;
  return map;
}

/** The verses from..to of a surah in the King Fahd text, joined by one space, exactly as copied. */
export function qpcRange(surah: number, from: number, to: number): string {
  const verses = qpcVerses();
  const parts: string[] = [];
  for (let a = from; a <= to; a++) {
    const v = verses[`${surah}:${a}`];
    if (v === undefined) throw new Error(`No verse ${surah}:${a} in quran-qpc-hafs.json`);
    parts.push(v);
  }
  return parts.join(' ');
}

export function tanzilRange(kind: 'uthmani' | 'simple', surah: number, from: number, to: number): string {
  const verses = tanzilVerses(kind);
  const parts: string[] = [];
  for (let a = from; a <= to; a++) {
    const v = verses.get(`${surah}:${a}`);
    if (v === undefined) throw new Error(`No verse ${surah}:${a} in quran-${kind}.txt`);
    parts.push(v);
  }
  return parts.join(' ');
}

/**
 * The bare letters of a Qur'anic text, for comparing two editions: marks,
 * small letters, tatweel, verse numbers and spaces removed; hamza seats, alef
 * wasla and alef maqsura folded to their bare letter; the standalone hamza
 * dropped (the two editions write hamza and its seat differently in places).
 */
export function quranLetters(text: string): string {
  return text
    .normalize('NFC')
    .replace(/[آأإٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/[^ا-غف-ي]/g, '');
}

/** Compares the letters of a range in the King Fahd text with Tanzil's Uthmani text. */
export function lettersMatchTanzil(surah: number, from: number, to: number): boolean {
  return quranLetters(qpcRange(surah, from, to)) === quranLetters(tanzilRange('uthmani', surah, from, to));
}
