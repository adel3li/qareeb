import { useEffect, useState } from 'react';
import { useUi } from '../state/ui';

/** A short polite announcement above the tab bar («نُسخ النص»). */
export function Toast() {
  const toast = useUi((s) => s.toast);
  const [visible, setVisible] = useState<string | null>(null);
  useEffect(() => {
    if (!toast) return;
    setVisible(toast.text);
    const t = setTimeout(() => setVisible(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);
  return (
    <div role="status" aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-[calc(108px+env(safe-area-inset-bottom))] z-[60] flex justify-center px-4 wide:bottom-8">
      {visible && <p className="m-0 rounded-(--radius-control) bg-text px-4 py-2 text-t-body-sm text-page shadow-(--raised-shadow)">{visible}</p>}
    </div>
  );
}
