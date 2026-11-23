import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { KEYS } from './keys';
import {
  DEFAULT_SETTINGS,
  type Completion,
  type Draft,
  type Intention,
  type MyDua,
  type NotebookEntry,
  type Settings,
} from './schemas';
import { migrateSettings } from './migrations';

/**
 * One persisted Zustand store per storage key (src/state/keys.ts). Each is
 * stored as `{ "state": …, "version": 1 }`. Nothing is written until the
 * user does something: persist writes on `set`, not on hydration.
 */

const storage = createJSONStorage(() => localStorage);

export function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

const nowIso = () => new Date().toISOString();

// ── Settings ────────────────────────────────────────────────────────────
interface SettingsState extends Settings {
  setTheme: (theme: Settings['theme']) => void;
  setFontScale: (fontScale: number) => void;
  setShowMyDuasInFlow: (value: boolean) => void;
}
export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,
      setTheme: (theme) => set({ theme }),
      setFontScale: (fontScale) => set({ fontScale }),
      setShowMyDuasInFlow: (showMyDuasInFlow) => set({ showMyDuasInFlow }),
    }),
    {
      name: KEYS.settings,
      storage,
      version: 1,
      migrate: migrateSettings,
      partialize: ({ theme, fontScale, showMyDuasInFlow }) => ({ theme, fontScale, showMyDuasInFlow }),
    },
  ),
);

// ── Onboarding and the welcome dua ─────────────────────────────────────
interface OnboardingState {
  completedAt: string | null;
  complete: () => void;
}
export const useOnboarding = create<OnboardingState>()(
  persist((set) => ({ completedAt: null, complete: () => set({ completedAt: nowIso() }) }), {
    name: KEYS.onboarding,
    storage,
    version: 1,
    partialize: ({ completedAt }) => ({ completedAt }),
  }),
);

interface WelcomeState {
  /** Local day on which the welcome dua was completed. */
  doneOn: string | null;
  markDone: (day: string) => void;
}
export const useWelcome = create<WelcomeState>()(
  persist((set, get) => ({ doneOn: null, markDone: (day) => get().doneOn === null && set({ doneOn: day }) }), {
    name: KEYS.welcome,
    storage,
    version: 1,
    partialize: ({ doneOn }) => ({ doneOn }),
  }),
);

// ── Completions: one per local day, with the dua id that was shown ─────
interface CompletionsState {
  items: Completion[];
  /** Records the day. One entry per day: living a dua again that day updates it. */
  complete: (input: { date: string; duaId: string; intention?: Intention }) => void;
}
export const useCompletions = create<CompletionsState>()(
  persist(
    (set, get) => ({
      items: [],
      complete: ({ date, duaId, intention }) => {
        const entry: Completion = { date, duaId, completedAt: nowIso(), ...(intention ? { intention } : {}) };
        set({ items: [...get().items.filter((c) => c.date !== date), entry].sort((a, b) => a.date.localeCompare(b.date)) });
      },
    }),
    { name: KEYS.completions, storage, version: 1, partialize: ({ items }) => ({ items }) },
  ),
);

// ── Notebook: ما وجدته ─────────────────────────────────────────────────
interface NotebookState {
  entries: NotebookEntry[];
  add: (input: { date: string; text: string; duaId?: string }) => NotebookEntry;
  update: (id: string, text: string) => void;
  remove: (id: string) => void;
}
export const useNotebook = create<NotebookState>()(
  persist(
    (set, get) => ({
      entries: [],
      add: ({ date, text, duaId }) => {
        const now = nowIso();
        const entry: NotebookEntry = { id: newId(), date, text, createdAt: now, updatedAt: now, ...(duaId ? { duaId } : {}) };
        set({ entries: [...get().entries, entry] });
        return entry;
      },
      update: (id, text) => set({ entries: get().entries.map((e) => (e.id === id ? { ...e, text, updatedAt: nowIso() } : e)) }),
      remove: (id) => set({ entries: get().entries.filter((e) => e.id !== id) }),
    }),
    { name: KEYS.notebook, storage, version: 1, partialize: ({ entries }) => ({ entries }) },
  ),
);

// ── دعواتي ─────────────────────────────────────────────────────────────
interface MyDuasState {
  items: MyDua[];
  add: (input: { text: string; note?: string }) => MyDua;
  update: (id: string, input: { text: string; note?: string }) => void;
  setAnswered: (id: string, answer: { answeredAt: string; answerNote?: string } | null) => void;
  remove: (id: string) => void;
}
export const useMyDuas = create<MyDuasState>()(
  persist(
    (set, get) => ({
      items: [],
      add: ({ text, note }) => {
        const item: MyDua = { id: newId(), text, createdAt: nowIso(), ...(note ? { note } : {}) };
        set({ items: [...get().items, item] });
        return item;
      },
      update: (id, { text, note }) =>
        set({
          items: get().items.map((d) => {
            if (d.id !== id) return d;
            const next: MyDua = { ...d, text };
            if (note) next.note = note;
            else delete next.note;
            return next;
          }),
        }),
      setAnswered: (id, answer) =>
        set({
          items: get().items.map((d) => {
            if (d.id !== id) return d;
            const { answeredAt: _a, answerNote: _n, ...rest } = d;
            if (!answer) return rest;
            return { ...rest, answeredAt: answer.answeredAt, ...(answer.answerNote ? { answerNote: answer.answerNote } : {}) };
          }),
        }),
      remove: (id) => set({ items: get().items.filter((d) => d.id !== id) }),
    }),
    { name: KEYS.myDuas, storage, version: 1, partialize: ({ items }) => ({ items }) },
  ),
);

// ── Favourites ─────────────────────────────────────────────────────────
interface FavoritesState {
  ids: string[];
  toggle: (duaId: string) => void;
}
export const useFavorites = create<FavoritesState>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (duaId) => {
        const ids = get().ids;
        set({ ids: ids.includes(duaId) ? ids.filter((x) => x !== duaId) : [...ids, duaId] });
      },
    }),
    { name: KEYS.favorites, storage, version: 1, partialize: ({ ids }) => ({ ids }) },
  ),
);

// ── Drafts of the guided flow, removed when saved ──────────────────────
interface DraftsState {
  byDua: Record<string, Draft>;
  setDraft: (duaId: string, patch: { notebookText?: string; myDuaText?: string }) => void;
  clearDraft: (duaId: string, field?: 'notebookText' | 'myDuaText') => void;
}
export const useDrafts = create<DraftsState>()(
  persist(
    (set, get) => ({
      byDua: {},
      setDraft: (duaId, patch) => {
        const current = get().byDua[duaId];
        const next: Draft = { ...current, ...patch, updatedAt: nowIso() };
        if (!next.notebookText) delete next.notebookText;
        if (!next.myDuaText) delete next.myDuaText;
        const byDua = { ...get().byDua };
        if (!next.notebookText && !next.myDuaText) {
          if (!current) return;
          delete byDua[duaId];
        } else byDua[duaId] = next;
        set({ byDua });
      },
      clearDraft: (duaId, field) => {
        const current = get().byDua[duaId];
        if (!current) return;
        const byDua = { ...get().byDua };
        if (field) {
          const next = { ...current };
          delete next[field];
          if (next.notebookText || next.myDuaText) byDua[duaId] = next;
          else delete byDua[duaId];
        } else delete byDua[duaId];
        set({ byDua });
      },
    }),
    { name: KEYS.drafts, storage, version: 1, partialize: ({ byDua }) => ({ byDua }) },
  ),
);
