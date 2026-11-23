import { X } from 'lucide-react';
import { useId, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { ar } from '../copy/ar';
import { useDialog } from '../lib/useDialog';
import { IconButton } from './IconButton';

/**
 * The one overlay component: rendered through a portal into document.body (so no
 * transformed ancestor can trap it), role="dialog", aria-modal, focus trapped,
 * Escape and the scrim close it, page scroll locked, focus returned on close.
 *
 * - `sheet`: rises from the bottom (Sheet in the design system).
 * - `screen`: a full screen over the app («عِش الدعاء»).
 * - `alert`: a centred confirmation that repeats the action in its buttons.
 */
export function Dialog({
  open,
  onClose,
  title,
  variant = 'sheet',
  children,
  footer,
  suspended = false,
  hideTitle = false,
  focusKey,
  closeLabel = ar.common.close,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  variant?: 'sheet' | 'screen' | 'alert';
  children: ReactNode;
  footer?: ReactNode;
  /** True while another dialog on top owns the keyboard. */
  suspended?: boolean;
  hideTitle?: boolean;
  focusKey?: string | number;
  closeLabel?: string;
}) {
  if (!open) return null;
  return createPortal(
    <DialogInner {...{ onClose, title, variant, children, footer, suspended, hideTitle, focusKey, closeLabel }} />,
    document.body,
  );
}

function DialogInner({
  onClose,
  title,
  variant,
  children,
  footer,
  suspended,
  hideTitle,
  focusKey,
  closeLabel,
}: {
  onClose: () => void;
  title: string;
  variant: 'sheet' | 'screen' | 'alert';
  children: ReactNode;
  footer?: ReactNode;
  suspended: boolean;
  hideTitle: boolean;
  focusKey?: string | number;
  closeLabel: string;
}) {
  const ref = useDialog<HTMLDivElement>({ onClose, active: !suspended, focusKey });
  const titleId = useId();

  if (variant === 'screen') {
    return (
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="fixed inset-0 z-40 flex flex-col overflow-y-auto overscroll-contain bg-page outline-none glow"
      >
        <h2 id={titleId} className="sr-only">
          {title}
        </h2>
        {children}
      </div>
    );
  }

  const isAlert = variant === 'alert';
  return (
    <div className={`fixed inset-0 z-50 flex ${isAlert ? 'items-center justify-center p-6' : 'items-end justify-center'}`}>
      <div aria-hidden="true" className="absolute inset-0 bg-overlay" onClick={onClose} />
      <div
        ref={ref}
        role={isAlert ? 'alertdialog' : 'dialog'}
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={
          isAlert
            ? 'relative flex max-h-full w-full max-w-[400px] flex-col gap-4 overflow-y-auto rounded-(--radius-card) bg-surface-raised p-6 shadow-(--raised-shadow) outline-none'
            : 'q-sheet relative flex max-h-[92dvh] w-full max-w-(--content-max) flex-col gap-4 overflow-y-auto rounded-t-(--radius-sheet) bg-surface-raised px-5 pt-2 pb-[calc(28px+env(safe-area-inset-bottom))] shadow-(--raised-shadow) outline-none'
        }
      >
        {!isAlert && <div aria-hidden="true" className="h-1 w-10 shrink-0 self-center rounded-full bg-hairline" />}
        <div className={`flex items-center justify-between gap-2 ${hideTitle ? 'sr-only' : ''}`}>
          <h2 id={titleId} className="m-0 font-q-heading text-t-subtitle">
            {title}
          </h2>
          {!isAlert && <IconButton icon={X} label={closeLabel} onClick={onClose} className="-me-[10px]" />}
        </div>
        {children}
        {footer && <div className="flex flex-col gap-[10px]">{footer}</div>}
      </div>
    </div>
  );
}

/** A confirmation that repeats the action: «امسح» / «تراجع». */
export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel,
  cancelLabel = ar.common.cancel,
  onConfirm,
  onCancel,
  danger = true,
}: {
  open: boolean;
  title: string;
  body?: string;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
}) {
  return (
    <Dialog open={open} onClose={onCancel} title={title} variant="alert">
      {body && <p className="m-0 text-t-body text-text-body">{body}</p>}
      <div className="flex flex-col gap-[10px]">
        <button
          type="button"
          onClick={onConfirm}
          className={`min-h-(--button-height-sm) rounded-(--radius-control) border border-hairline px-[22px] text-t-body font-medium ${danger ? 'text-danger' : 'text-text'} active:bg-surface-sunken`}
        >
          {confirmLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="min-h-(--button-height-sm) rounded-(--radius-control) border border-hairline px-[22px] text-t-body font-medium text-text active:bg-surface-sunken"
        >
          {cancelLabel}
        </button>
      </div>
    </Dialog>
  );
}
