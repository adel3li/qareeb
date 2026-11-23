import type { ButtonHTMLAttributes, ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'quiet' | 'danger';

const base =
  'inline-flex items-center justify-center gap-2 rounded-control border-0 px-[22px] font-sans text-center no-underline transition-colors duration-fast ease-standard';
const variants: Record<ButtonVariant, string> = {
  primary: 'min-h-btn bg-cta text-cta-text text-t-button font-semibold hover:bg-cta-hover active:bg-cta-hover',
  secondary: 'min-h-btn-sm bg-transparent text-text border border-solid border-hairline text-t-body font-medium active:bg-surface-sunken',
  quiet: 'min-h-touch px-3.5 bg-transparent text-text-muted text-t-body-sm',
  danger: 'min-h-btn-sm bg-transparent text-danger border border-solid border-hairline text-t-body font-medium active:bg-surface-sunken',
};
const waiting = 'aria-disabled:bg-surface-sunken aria-disabled:text-text-muted aria-disabled:cursor-default aria-disabled:hover:bg-surface-sunken';

interface Props extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'disabled'> {
  variant?: ButtonVariant;
  block?: boolean;
  icon?: ReactNode;
  /** Waiting state: stays focusable, says it is unavailable, ignores presses. */
  waiting?: boolean;
}

/** A labelled action. One primary per screen (design/system/components/Button). */
export function Button({ variant = 'secondary', block, icon, waiting: isWaiting, className = '', onClick, children, type = 'button', ...rest }: Props) {
  return (
    <button
      type={type}
      {...rest}
      aria-disabled={isWaiting || undefined}
      onClick={(e) => {
        if (isWaiting) {
          e.preventDefault();
          return;
        }
        onClick?.(e);
      }}
      className={`${base} ${variants[variant]} ${waiting} ${block ? 'flex w-full' : ''} ${className}`}
    >
      {icon}
      {children}
    </button>
  );
}
