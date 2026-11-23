import { toLocalDateString } from '../lib/dates';
import { newId, upsertCompletion } from '../lib/progress';
import { getStored, setStored } from './store';
import type { Intention, MyDua, Settings } from './shapes';

/** Every write the app makes to storage. Each happens because the user did something. */

export function finishOnboarding(): void {
  setStored('onboarding', () => ({ completedAt: new Date().toISOString() }));
}

export function updateSettings(patch: Partial<Settings>): void {
  setStored('settings', (s) => ({ ...s, ...patch }));
}

/**
 * Records the day as lived, with the id of the dua that was shown (never
 * recomputed from the date). Called only at the closing of «عِش الدعاء».
 */
export function completeDua(duaId: string, opts: { intention?: Intention; isWelcome?: boolean; now?: Date } = {}): void {
  const now = opts.now ?? new Date();
  const date = toLocalDateString(now);
  setStored('completions', (list) => upsertCompletion(list, { date, duaId, completedAt: now.toISOString(), ...(opts.intention ? { intention: opts.intention } : {}) }));
  if (opts.isWelcome && getStored('welcome').doneOn === null) setStored('welcome', () => ({ doneOn: date }));
}

export function setFavorite(duaId: string, on: boolean): void {
  setStored('favorites', (list) => (on ? (list.includes(duaId) ? list : [duaId, ...list]) : list.filter((id) => id !== duaId)));
}

export function addNote(text: string, duaId?: string, now = new Date()): void {
  const at = now.toISOString();
  setStored('notebook', (list) => [...list, { id: newId('note'), date: toLocalDateString(now), ...(duaId ? { duaId } : {}), text: text.trim(), createdAt: at, updatedAt: at }]);
}

export function updateNote(id: string, text: string): void {
  setStored('notebook', (list) => list.map((n) => (n.id === id ? { ...n, text: text.trim(), updatedAt: new Date().toISOString() } : n)));
}

export function deleteNote(id: string): void {
  setStored('notebook', (list) => list.filter((n) => n.id !== id));
}

export function addMyDua(text: string, note?: string): void {
  const trimmedNote = note?.trim();
  setStored('myDuas', (list) => [{ id: newId('need'), text: text.trim(), ...(trimmedNote ? { note: trimmedNote } : {}), createdAt: new Date().toISOString() }, ...list]);
}

export function updateMyDua(id: string, patch: Partial<Pick<MyDua, 'text' | 'note' | 'answerNote'>>): void {
  setStored('myDuas', (list) =>
    list.map((d) => {
      if (d.id !== id) return d;
      const next: MyDua = { ...d, ...patch };
      if (next.note !== undefined && !next.note.trim()) delete next.note;
      if (next.answerNote !== undefined && !next.answerNote.trim()) delete next.answerNote;
      return next;
    }),
  );
}

export function setAnswered(id: string, answered: boolean, answerNote?: string): void {
  setStored('myDuas', (list) =>
    list.map((d) => {
      if (d.id !== id) return d;
      if (!answered) {
        const { answeredAt: _a, answerNote: _n, ...rest } = d;
        return rest;
      }
      const note = answerNote?.trim();
      return { ...d, answeredAt: d.answeredAt ?? new Date().toISOString(), ...(note ? { answerNote: note } : {}) };
    }),
  );
}

export function deleteMyDua(id: string): void {
  setStored('myDuas', (list) => list.filter((d) => d.id !== id));
}

export function saveDraft(duaId: string, patch: { notebookText?: string; needText?: string }): void {
  setStored('drafts', (all) => {
    const merged = { ...all[duaId], ...patch };
    const hasText = !!(merged.notebookText?.trim() || merged.needText?.trim());
    const next = { ...all };
    if (hasText) next[duaId] = { ...(merged.notebookText?.trim() ? { notebookText: merged.notebookText } : {}), ...(merged.needText?.trim() ? { needText: merged.needText } : {}), updatedAt: new Date().toISOString() };
    else delete next[duaId];
    return next;
  });
}

export function clearDraft(duaId: string): void {
  if (!(duaId in getStored('drafts'))) return;
  setStored('drafts', (all) => {
    const next = { ...all };
    delete next[duaId];
    return next;
  });
}
