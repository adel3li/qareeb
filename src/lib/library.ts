import type { Dua } from '../content/types';
import type { Completion } from '../state/types';
import { matchesQuery } from './arabicSearch';

export interface LivedItem {
  dua: Dua;
  /** The latest local day it was lived. */
  date: string;
}

/** Every dua the user lived, newest first, once each, by the ids stored with each day. */
export function livedDuas(completions: readonly Completion[], duas: readonly Dua[]): LivedItem[] {
  const byId = new Map(duas.map((d) => [d.id, d]));
  const latest = new Map<string, string>();
  for (const c of completions) {
    const prev = latest.get(c.duaId);
    if (!prev || c.date > prev) latest.set(c.duaId, c.date);
  }
  return [...latest.entries()]
    .map(([id, date]) => ({ dua: byId.get(id), date }))
    .filter((x): x is LivedItem => Boolean(x.dua))
    .sort((a, b) => b.date.localeCompare(a.date));
}

/** Search over title, short title, hook and the dua's text, ignoring marks and letter forms. */
export function searchDuas<T extends { dua: Dua }>(items: readonly T[], query: string): T[] {
  if (!query.trim()) return [...items];
  return items.filter(({ dua }) => matchesQuery([dua.title, dua.shortTitle, dua.hook, dua.sceneLine, dua.searchText].join(' '), query));
}
