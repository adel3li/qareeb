import type { Completion, NotebookEntry } from '../state/schemas';

export interface DayGroup<T> {
  date: string;
  items: T[];
}

/** Entries grouped by their stored local day, newest day first, newest entry first within a day. */
export function groupByDay<T extends { date: string; createdAt: string }>(items: readonly T[]): DayGroup<T>[] {
  const map = new Map<string, T[]>();
  for (const item of items) {
    const list = map.get(item.date) ?? [];
    list.push(item);
    map.set(item.date, list);
  }
  return [...map.entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, list]) => ({ date, items: list.sort((x, y) => y.createdAt.localeCompare(x.createdAt)) }));
}

/** The intention stored with the completion of the same day and dua, if any. */
export function intentionFor(entry: NotebookEntry, completions: readonly Completion[]): Completion['intention'] {
  if (!entry.duaId) return undefined;
  return completions.find((c) => c.date === entry.date && c.duaId === entry.duaId)?.intention;
}

/** Lived duas for the library: each dua once, at its latest day, newest first. */
export function livedDuas(completions: readonly Completion[]): { duaId: string; date: string }[] {
  const latest = new Map<string, string>();
  for (const c of completions) {
    const prev = latest.get(c.duaId);
    if (!prev || c.date > prev) latest.set(c.duaId, c.date);
  }
  return [...latest.entries()].map(([duaId, date]) => ({ duaId, date })).sort((a, b) => b.date.localeCompare(a.date));
}
