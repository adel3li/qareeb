import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'quiet' | 'danger';

const base =
  'inline-flex items-center justify-center gap-2 rounded-control px-5 text-center transition-colors duration-[var(--duration-fast)] ease-standard';
const variants: Record<Variant, string> = {
  primary: 'min-h-btn border-0 bg-cta text-cta-text text-t-button hover:bg-cta-hover active:bg-cta-hover',
  secondary: 'min-h-btn-sm border border-solid border-hairline bg-transparent text-ink text-t-body font-medium active:bg-sunken',
  quiet: 'min-h-touch border-0 bg-transparent px-3.5 text-t-body-sm text-muted active:bg-sunken',
  danger: 'min-h-btn-sm border border-solid border-hairline bg-transparent text-danger text-t-body font-medium active:bg-sunken',
};
const waiting = 'min-h-btn border-0 bg-sunken text-muted text-t-button cursor-default';

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'disabled'> {
  variant?: Variant;
  block?: boolean;
  /** Waiting state: stays focusable, announced as unavailable, does nothing when pressed. */
  waitingFor?: boolean;
  icon?: ReactNode;
  meta?: ReactNode;
}

export function Button({ variant = 'primary', block, waitingFor, icon, meta, className = '', children, onClick, type = 'button', ...rest }: ButtonProps) {
  return (
    <button
      type={type}
      {...rest}
      aria-disabled={waitingFor || undefined}
      onClick={waitingFor ? (e) => e.preventDefault() : onClick}
      className={`${base} ${waitingFor ? waiting : variants[variant]} ${block ? 'flex w-full' : ''} ${className}`}
    >
      {icon}
      <span>{children}</span>
      {meta && <span className="text-t-caption font-normal">{meta}</span>}
    </button>
  );
}
