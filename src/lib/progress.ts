import type { Completion } from '../state/shapes';

/**
 * Pure helpers over the stored completions. A completion stores the dua id
 * with the local day it was lived: what a past day had is read from here,
 * never recomputed from its date.
 */

/** One completion per local day. Living again on the same day keeps the day's dua and first time, and updates the intention if one is given. */
export function upsertCompletion(list: readonly Completion[], entry: Completion): Completion[] {
  const existing = list.find((c) => c.date === entry.date);
  if (!existing) return [...list, entry].sort((a, b) => a.date.localeCompare(b.date));
  return list.map((c) =>
    c.date === entry.date ? { ...c, intention: entry.intention ?? c.intention } : c,
  );
}

export function completionOn(list: readonly Completion[], day: string): Completion | undefined {
  return list.find((c) => c.date === day);
}

/** The duas the user has lived, newest first, each once, with the last day it was lived. */
export function livedDuas(list: readonly Completion[]): { duaId: string; date: string }[] {
  const latest = new Map<string, string>();
  for (const c of list) {
    const prev = latest.get(c.duaId);
    if (!prev || c.date > prev) latest.set(c.duaId, c.date);
  }
  return [...latest].map(([duaId, date]) => ({ duaId, date })).sort((a, b) => b.date.localeCompare(a.date));
}

/** A new random id for a record the user writes. */
export function newId(prefix: string): string {
  const random = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36);
  return `${prefix}_${random}`;
}

/** Groups records by their local day, newest day first, keeping each group's order newest first. */
export function groupByDay<T extends { date: string; createdAt: string }>(items: readonly T[]): { date: string; items: T[] }[] {
  const groups = new Map<string, T[]>();
  for (const item of [...items].sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt))) {
    if (!groups.has(item.date)) groups.set(item.date, []);
    groups.get(item.date)!.push(item);
  }
  return [...groups].map(([date, list]) => ({ date, items: list }));
}
