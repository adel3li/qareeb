import { useEffect } from 'react';
import { create } from 'zustand';

interface ToastState {
  message: string | null;
  key: number;
  show: (message: string) => void;
  clear: () => void;
}

export const useToast = create<ToastState>((set) => ({
  message: null,
  key: 0,
  show: (message) => set((s) => ({ message, key: s.key + 1 })),
  clear: () => set({ message: null }),
}));

export const toast = (message: string) => useToast.getState().show(message);

/** A short confirmation in a polite live region, above the tab bar; it leaves after a few seconds. */
export function Toaster() {
  const { message, key, clear } = useToast();
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(clear, 3200);
    return () => clearTimeout(t);
  }, [message, key, clear]);
  return (
    <div role="status" aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-[calc(108px+env(safe-area-inset-bottom,0px))] z-[60] flex justify-center px-gutter md:bottom-8">
      {message && (
        <p key={key} className="fade-in m-0 rounded-control bg-ink px-5 py-3 text-t-body-sm font-medium text-page shadow-raised">
          {message}
        </p>
      )}
    </div>
  );
}
