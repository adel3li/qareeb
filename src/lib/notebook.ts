import type { NotebookEntry } from '../state/types';

/** Entries grouped by their stored local day, newest day first, newest entry first. */
export function groupByDay(entries: readonly NotebookEntry[]): { date: string; entries: NotebookEntry[] }[] {
  const map = new Map<string, NotebookEntry[]>();
  for (const e of entries) map.set(e.date, [...(map.get(e.date) ?? []), e]);
  return [...map.entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, list]) => ({ date, entries: list.sort((a, b) => b.createdAt.localeCompare(a.createdAt)) }));
}
