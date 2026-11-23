import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { FONT_SCALE } from '../config';
import type { Intention } from '../content/types';
import { KEYS, isAppKey } from './keys';
import { migrate } from './migrations';
import type { Completion, Draft, MyDua, NotebookEntry, Settings } from './types';

/**
 * One small persisted store per storage key (src/state/keys.ts). Each stores
 * `{ state: <data>, version }` through Zustand `persist`; nothing is written
 * until the user does something (hydration without a migration never writes).
 */

const VERSION = 1;

function persistOptions<S, D>(key: string, pick: (s: S) => D) {
  return {
    name: key,
    version: VERSION,
    storage: createJSONStorage<D>(() => localStorage),
    partialize: pick,
    migrate: (state: unknown, fromVersion: number) => migrate(key, state, fromVersion) as never,
  };
}

export function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

const now = () => new Date().toISOString();

// ── Settings ───────────────────────────────────────────────────────────────

export const DEFAULT_SETTINGS: Settings = { theme: 'system', fontScale: FONT_SCALE.default, showMyDuasInFlow: true };

interface SettingsStore extends Settings {
  update: (patch: Partial<Settings>) => void;
}

export const useSettings = create<SettingsStore>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,
      update: (patch) => set(patch),
    }),
    persistOptions(KEYS.settings, (s: SettingsStore): Settings => ({
      theme: s.theme,
      fontScale: s.fontScale,
      showMyDuasInFlow: s.showMyDuasInFlow,
    })),
  ),
);

// ── Onboarding and the welcome dua ─────────────────────────────────────────

interface OnboardingStore {
  completedAt: string | null;
  complete: () => void;
}

export const useOnboarding = create<OnboardingStore>()(
  persist(
    (set) => ({ completedAt: null, complete: () => set({ completedAt: now() }) }),
    persistOptions(KEYS.onboarding, (s: OnboardingStore) => ({ completedAt: s.completedAt })),
  ),
);

interface WelcomeStore {
  /** Local day on which the welcome dua was lived, or null. */
  doneOn: string | null;
  markDone: (day: string) => void;
}

export const useWelcome = create<WelcomeStore>()(
  persist(
    (set, get) => ({
      doneOn: null,
      markDone: (day) => {
        if (get().doneOn === null) set({ doneOn: day });
      },
    }),
    persistOptions(KEYS.welcome, (s: WelcomeStore) => ({ doneOn: s.doneOn })),
  ),
);

// ── Completions: one entry per local day, with the dua that was shown ──────

interface CompletionsStore {
  items: Completion[];
  /** Records the day once; living it again keeps the first dua and updates the intention if one is given. */
  complete: (entry: { date: string; duaId: string; intention?: Intention }) => void;
}

export const useCompletions = create<CompletionsStore>()(
  persist(
    (set, get) => ({
      items: [],
      complete: ({ date, duaId, intention }) => {
        const items = get().items;
        const existing = items.find((c) => c.date === date);
        if (existing) {
          if (intention && existing.intention !== intention) {
            set({ items: items.map((c) => (c.date === date ? { ...c, intention } : c)) });
          }
          return;
        }
        const entry: Completion = { date, duaId, completedAt: now(), ...(intention ? { intention } : {}) };
        set({ items: [...items, entry].sort((a, b) => a.date.localeCompare(b.date)) });
      },
    }),
    persistOptions(KEYS.completions, (s: CompletionsStore) => ({ items: s.items })),
  ),
);

// ── Notebook: «ما وجدته» ───────────────────────────────────────────────────

interface NotebookStore {
  items: NotebookEntry[];
  add: (entry: { date: string; duaId?: string; text: string }) => NotebookEntry;
  edit: (id: string, text: string) => void;
  remove: (id: string) => void;
}

export const useNotebook = create<NotebookStore>()(
  persist(
    (set, get) => ({
      items: [],
      add: ({ date, duaId, text }) => {
        const t = now();
        const entry: NotebookEntry = { id: newId(), date, ...(duaId ? { duaId } : {}), text, createdAt: t, updatedAt: t };
        set({ items: [...get().items, entry] });
        return entry;
      },
      edit: (id, text) => set({ items: get().items.map((e) => (e.id === id ? { ...e, text, updatedAt: now() } : e)) }),
      remove: (id) => set({ items: get().items.filter((e) => e.id !== id) }),
    }),
    persistOptions(KEYS.notebook, (s: NotebookStore) => ({ items: s.items })),
  ),
);

// ── دعواتي ─────────────────────────────────────────────────────────────────

interface MyDuasStore {
  items: MyDua[];
  add: (entry: { text: string; note?: string }) => void;
  edit: (id: string, patch: { text?: string; note?: string; answerNote?: string }) => void;
  markAnswered: (id: string, day: string, answerNote?: string) => void;
  markOpen: (id: string) => void;
  remove: (id: string) => void;
}

const clean = (s?: string) => (s && s.trim() ? s.trim() : undefined);

export const useMyDuas = create<MyDuasStore>()(
  persist(
    (set, get) => ({
      items: [],
      add: ({ text, note }) => {
        const n = clean(note);
        set({ items: [...get().items, { id: newId(), text: text.trim(), ...(n ? { note: n } : {}), createdAt: now() }] });
      },
      edit: (id, patch) =>
        set({
          items: get().items.map((d) => {
            if (d.id !== id) return d;
            const next: MyDua = { ...d };
            if (patch.text !== undefined) next.text = patch.text.trim();
            if (patch.note !== undefined) {
              const n = clean(patch.note);
              if (n) next.note = n;
              else delete next.note;
            }
            if (patch.answerNote !== undefined) {
              const a = clean(patch.answerNote);
              if (a) next.answerNote = a;
              else delete next.answerNote;
            }
            return next;
          }),
        }),
      markAnswered: (id, day, answerNote) =>
        set({
          items: get().items.map((d) => {
            if (d.id !== id) return d;
            const a = clean(answerNote);
            return { ...d, answeredAt: day, ...(a ? { answerNote: a } : {}) };
          }),
        }),
      markOpen: (id) =>
        set({
          items: get().items.map((d) => {
            if (d.id !== id) return d;
            const { answeredAt: _a, answerNote: _n, ...rest } = d;
            return rest;
          }),
        }),
      remove: (id) => set({ items: get().items.filter((d) => d.id !== id) }),
    }),
    persistOptions(KEYS.myDuas, (s: MyDuasStore) => ({ items: s.items })),
  ),
);

// ── Favourites ─────────────────────────────────────────────────────────────

interface FavoritesStore {
  ids: string[];
  toggle: (id: string) => void;
}

export const useFavorites = create<FavoritesStore>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (id) => {
        const ids = get().ids;
        set({ ids: ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id] });
      },
    }),
    persistOptions(KEYS.favorites, (s: FavoritesStore) => ({ ids: s.ids })),
  ),
);

// ── Drafts of unsaved writing in «عِش الدعاء» ───────────────────────────────

interface DraftsStore {
  byDua: Record<string, Draft>;
  saveNotebookDraft: (duaId: string, text: string) => void;
  clear: (duaId: string) => void;
}

export const useDrafts = create<DraftsStore>()(
  persist(
    (set, get) => ({
      byDua: {},
      saveNotebookDraft: (duaId, text) => {
        const byDua = { ...get().byDua };
        if (text.trim()) byDua[duaId] = { notebookText: text, updatedAt: now() };
        else delete byDua[duaId];
        set({ byDua });
      },
      clear: (duaId) => {
        if (!(duaId in get().byDua)) return;
        const byDua = { ...get().byDua };
        delete byDua[duaId];
        set({ byDua });
      },
    }),
    persistOptions(KEYS.drafts, (s: DraftsStore) => ({ byDua: s.byDua })),
  ),
);

// ── Whole-data operations (backup import, erase) ───────────────────────────

export interface AppData {
  settings: Settings;
  onboarding: { completedAt: string | null };
  welcome: { doneOn: string | null };
  completions: Completion[];
  notebook: NotebookEntry[];
  myDuas: MyDua[];
  favorites: string[];
}

export function snapshot(): AppData {
  const s = useSettings.getState();
  return {
    settings: { theme: s.theme, fontScale: s.fontScale, showMyDuasInFlow: s.showMyDuasInFlow },
    onboarding: { completedAt: useOnboarding.getState().completedAt },
    welcome: { doneOn: useWelcome.getState().doneOn },
    completions: useCompletions.getState().items,
    notebook: useNotebook.getState().items,
    myDuas: useMyDuas.getState().items,
    favorites: useFavorites.getState().ids,
  };
}

/** Replaces everything with imported data (after the user confirmed the summary). */
export function replaceAll(data: AppData): void {
  useSettings.setState(data.settings);
  useOnboarding.setState(data.onboarding);
  useWelcome.setState(data.welcome);
  useCompletions.setState({ items: data.completions });
  useNotebook.setState({ items: data.notebook });
  useMyDuas.setState({ items: data.myDuas });
  useFavorites.setState({ ids: data.favorites });
  useDrafts.setState({ byDua: {} });
}

/**
 * Back to a first run: in-memory state to defaults, then every app key removed
 * (setState writes through persist, so storage is cleared after it).
 */
export function eraseAll(): void {
  useSettings.setState(DEFAULT_SETTINGS);
  useOnboarding.setState({ completedAt: null });
  useWelcome.setState({ doneOn: null });
  useCompletions.setState({ items: [] });
  useNotebook.setState({ items: [] });
  useMyDuas.setState({ items: [] });
  useFavorites.setState({ ids: [] });
  useDrafts.setState({ byDua: {} });
  const stores = [useSettings, useOnboarding, useWelcome, useCompletions, useNotebook, useMyDuas, useFavorites, useDrafts];
  for (const store of stores) store.persist.clearStorage();
  for (const key of Object.keys(localStorage)) if (isAppKey(key)) localStorage.removeItem(key);
}
