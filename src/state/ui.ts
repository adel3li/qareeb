import { create } from 'zustand';

/** Transient interface state (not persisted): which overlay is open, and a short announcement. */
interface UiStore {
  live: { duaId: string; recordDay: string | null; welcome: boolean } | null;
  shareDuaId: string | null;
  toast: { id: number; text: string } | null;
  openLive: (live: { duaId: string; recordDay: string | null; welcome: boolean }) => void;
  closeLive: () => void;
  openShare: (duaId: string) => void;
  closeShare: () => void;
  announce: (text: string) => void;
}

export const useUi = create<UiStore>()((set) => ({
  live: null,
  shareDuaId: null,
  toast: null,
  openLive: (live) => set({ live }),
  closeLive: () => set({ live: null }),
  openShare: (shareDuaId) => set({ shareDuaId }),
  closeShare: () => set({ shareDuaId: null }),
  announce: (text) => set({ toast: { id: Date.now(), text } }),
}));
