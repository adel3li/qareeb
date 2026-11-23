import { useId, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useDialog } from '../lib/useDialog';
import { IconButton } from './IconButton';
import { Icon } from './Icon';
import { ar } from '../copy/ar';

/**
 * The one overlay component. Rendered through a portal into document.body, with
 * role="dialog", aria-modal, focus trapped, Escape and the scrim closing it,
 * page scroll locked and focus returned (useDialog). Shown as a sheet from the
 * bottom on phones and centred on wide screens.
 */
export function Dialog({ title, onClose, children, actions, describedBy, tone = 'default' }: {
  title: string;
  onClose: () => void;
  children?: ReactNode;
  actions?: ReactNode;
  describedBy?: string;
  tone?: 'default' | 'alert';
}) {
  const titleId = useId();
  const ref = useDialog<HTMLDivElement>({ onClose });
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center">
      <div className="fade-in absolute inset-0 bg-overlay" onClick={onClose} aria-hidden="true" />
      <div
        ref={ref}
        role={tone === 'alert' ? 'alertdialog' : 'dialog'}
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={describedBy}
        tabIndex={-1}
        className="sheet-in relative flex max-h-[92dvh] w-full max-w-content flex-col gap-4 overflow-y-auto rounded-t-sheet bg-raised px-5 pt-2 pb-[calc(28px+env(safe-area-inset-bottom,0px))] shadow-raised outline-none md:rounded-sheet md:pb-7"
      >
        <span aria-hidden="true" className="h-1 w-10 shrink-0 self-center rounded-pill bg-hairline md:hidden" />
        <div className="flex items-center justify-between gap-2">
          <h2 id={titleId} className="m-0 font-heading text-t-subtitle text-ink">
            {title}
          </h2>
          <IconButton label={ar.nav.close} onClick={onClose} className="-me-2.5">
            <Icon as={X} size={22} />
          </IconButton>
        </div>
        {children}
        {actions && <div className="flex flex-col gap-3">{actions}</div>}
      </div>
    </div>,
    document.body,
  );
}
