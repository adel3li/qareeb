import { useId, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useDialog } from '../lib/useDialog';
import { ar } from '../copy/ar';
import { IconButton } from './IconButton';

interface Props {
  open: boolean;
  onClose: () => void;
  /** Visible title of a sheet; for a full-screen dialog, its accessible name. */
  title: string;
  /** 'sheet' rises from the bottom over the scrim; 'full' covers the screen (the guided flow). */
  variant?: 'sheet' | 'full';
  /** Hide the title visually (full screens that show their own heading). */
  hideTitle?: boolean;
  children: ReactNode;
  /** Changes when the content is replaced, to move focus back into the dialog. */
  focusKey?: string | number;
  /** False while a dialog on top of this one owns the keyboard. */
  active?: boolean;
  /** Close on Escape and on the scrim. Default true. */
  dismissible?: boolean;
}

/**
 * The one overlay component: a portal into document.body, role="dialog",
 * aria-modal, focus trapped, Escape and the scrim close it, page scroll
 * locked, focus returned on close (useDialog).
 */
export function Dialog({ open, onClose, title, variant = 'sheet', hideTitle, children, focusKey, active = true, dismissible = true }: Props) {
  if (!open) return null;
  return createPortal(
    <DialogBody onClose={onClose} title={title} variant={variant} hideTitle={hideTitle} focusKey={focusKey} active={active} dismissible={dismissible}>
      {children}
    </DialogBody>,
    document.body,
  );
}

function DialogBody({ onClose, title, variant, hideTitle, children, focusKey, active, dismissible }: Omit<Props, 'open'>) {
  const titleId = useId();
  const ref = useDialog<HTMLDivElement>({ onClose: dismissible ? onClose : undefined, active, focusKey });

  if (variant === 'full') {
    return (
      <div ref={ref} role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1} className="fixed inset-0 z-40 overflow-y-auto bg-page outline-none">
        <h2 id={titleId} className="sr-only">
          {title}
        </h2>
        {children}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div aria-hidden="true" className="animate-scrim absolute inset-0 bg-overlay" onClick={dismissible ? onClose : undefined} />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="animate-sheet relative mx-auto flex max-h-[92dvh] w-full max-w-content flex-col rounded-t-sheet bg-surface-raised shadow-raised outline-none"
      >
        <div aria-hidden="true" className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-pill bg-hairline" />
        <div className="flex shrink-0 items-center justify-between gap-2 ps-5 pe-2 pt-2">
          <h2 id={titleId} className={`m-0 font-kufi text-t-subtitle text-text ${hideTitle ? 'sr-only' : ''}`}>
            {title}
          </h2>
          <IconButton icon={X} label={ar.common.close} onClick={onClose} size="lg" />
        </div>
        <div className="flex flex-col gap-4 overflow-y-auto px-5 pt-2 pb-[calc(28px+env(safe-area-inset-bottom,0px))]">{children}</div>
      </div>
    </div>
  );
}
