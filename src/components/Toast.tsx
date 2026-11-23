import { useEffect } from 'react';
import { create } from 'zustand';

interface ToastState {
  message: string | null;
  key: number;
  show: (message: string) => void;
  clear: () => void;
}

/** One quiet confirmation at a time, in a polite live region. Not persisted. */
export const useToast = create<ToastState>()((set, get) => ({
  message: null,
  key: 0,
  show: (message) => set({ message, key: get().key + 1 }),
  clear: () => set({ message: null }),
}));

export function ToastRegion() {
  const { message, key, clear } = useToast();
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(clear, 3200);
    return () => clearTimeout(t);
  }, [message, key, clear]);
  return (
    <div aria-live="polite" role="status" className="pointer-events-none fixed inset-x-0 bottom-[calc(112px+env(safe-area-inset-bottom,0px))] z-[60] flex justify-center px-gutter">
      {message ? (
        <p key={key} className="animate-fade m-0 rounded-control bg-text px-8 py-3.5 text-t-body-sm text-page shadow-raised">
          {message}
        </p>
      ) : null}
    </div>
  );
}
