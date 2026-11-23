/**
 * Reads the Qur'an source files in content/sources/ (copied verbatim from their
 * sources; see content/sources/README.md). Nothing here writes verse text.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const SOURCES = join(import.meta.dir, '..', '..', 'content', 'sources');

let qpc: Record<string, string> | null = null;
let uthmani: Map<string, string> | null = null;
let simple: Map<string, string> | null = null;

/** The King Fahd Complex text (text_qpc_hafs) of one verse, as shown to users. */
export function qpcVerse(surah: number, ayah: number): string | undefined {
  qpc ??= JSON.parse(readFileSync(join(SOURCES, 'quran-qpc-hafs.json'), 'utf8')).verses as Record<string, string>;
  return qpc[`${surah}:${ayah}`];
}

/** Reads a Tanzil "surah|ayah|text" file. Tanzil writes the basmala before verse 1 of each surah but al-Fatiha and at-Tawba; it is not part of the verse. */
function readTanzil(file: string): Map<string, string> {
  const map = new Map<string, string>();
  const basmala = (text: string) => text.split(' ').slice(0, 4).join(' ');
  let fatihaBasmala = '';
  for (const line of readFileSync(join(SOURCES, file), 'utf8').split('\n')) {
    if (!line || line.startsWith('#')) continue;
    const [s, a, ...rest] = line.split('|');
    let text = rest.join('|').trim();
    const surah = Number(s);
    const ayah = Number(a);
    if (surah === 1 && ayah === 1) fatihaBasmala = basmala(text);
    if (ayah === 1 && surah !== 1 && surah !== 9 && fatihaBasmala) {
      const head = text.split(' ').slice(0, 4).join(' ');
      if (letterSkeleton(head) === letterSkeleton(fatihaBasmala)) text = text.split(' ').slice(4).join(' ');
    }
    map.set(`${surah}:${ayah}`, text);
  }
  return map;
}

export function tanzilUthmaniVerse(surah: number, ayah: number): string | undefined {
  uthmani ??= readTanzil('quran-uthmani.txt');
  return uthmani.get(`${surah}:${ayah}`);
}

/** Tanzil Simple (modern spelling): for search only, never shown. */
export function tanzilSimpleVerse(surah: number, ayah: number): string | undefined {
  simple ??= readTanzil('quran-simple.txt');
  return simple.get(`${surah}:${ayah}`);
}

/** The verses from..to of the King Fahd text, joined by a space as the cards store them. */
export function qpcRange(surah: number, from: number, to: number): string {
  const parts: string[] = [];
  for (let a = from; a <= to; a++) {
    const v = qpcVerse(surah, a);
    if (v === undefined) throw new Error(`No verse ${surah}:${a} in quran-qpc-hafs.json`);
    parts.push(v);
  }
  return parts.join(' ');
}

/** Letters only, for comparing two editions: decomposed, then marks (hamza above/below included), digits, spaces and symbols removed; alef wasla as alef, alef maqsura as ya. */
export function letterSkeleton(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[^ء-غف-يٱ]/g, '')
    .replace(/ٱ/g, 'ا')
    .replace(/ى/g, 'ي');
}

/** Known encoding differences between the two editions that the comparison ignores (content/sources/README.md). */
export const KNOWN_LETTER_DIFFERENCES = new Set(['2:72']);
