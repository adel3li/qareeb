import { create } from 'zustand';

/** Overlays open right now. Not persisted. */
interface UiState {
  /** «عِش الدعاء» on a dua. `record`: the closing records the day (today's dua only). */
  live: { duaId: string; record: boolean; isWelcome: boolean } | null;
  share: { duaId: string } | null;
  openLive: (duaId: string, opts: { record: boolean; isWelcome: boolean }) => void;
  closeLive: () => void;
  openShare: (duaId: string) => void;
  closeShare: () => void;
}

export const useUi = create<UiState>((set) => ({
  live: null,
  share: null,
  openLive: (duaId, opts) => set({ live: { duaId, ...opts } }),
  closeLive: () => set({ live: null }),
  openShare: (duaId) => set({ share: { duaId } }),
  closeShare: () => set({ share: null }),
}));
