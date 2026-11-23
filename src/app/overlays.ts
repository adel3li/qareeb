import { create } from 'zustand';

/** The overlays opened from any screen: the guided flow and the share sheet. Not persisted. */
interface OverlayState {
  live: { duaId: string; day: string; records: boolean; welcome: boolean } | null;
  shareDuaId: string | null;
  openLive: (live: OverlayState['live']) => void;
  closeLive: () => void;
  openShare: (duaId: string) => void;
  closeShare: () => void;
}

export const useOverlays = create<OverlayState>()((set) => ({
  live: null,
  shareDuaId: null,
  openLive: (live) => set({ live }),
  closeLive: () => set({ live: null }),
  openShare: (shareDuaId) => set({ shareDuaId }),
  closeShare: () => set({ shareDuaId: null }),
}));
