import type { LucideIcon } from 'lucide-react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Icon } from './Icon';

export type ButtonVariant = 'primary' | 'secondary' | 'quiet' | 'danger';

const base =
  'inline-flex items-center justify-center gap-2 rounded-(--radius-control) px-[22px] text-center no-underline transition-colors duration-(--duration-fast) ease-(--ease-standard) disabled:cursor-default';

const variants: Record<ButtonVariant, string> = {
  primary: 'min-h-(--button-height) bg-cta text-cta-text text-t-button hover:bg-cta-hover active:bg-cta-hover',
  secondary: 'min-h-(--button-height-sm) border border-hairline bg-transparent text-text text-t-body font-medium active:bg-surface-sunken',
  quiet: 'min-h-(--touch-target) bg-transparent px-[14px] text-t-body-sm text-text-muted active:bg-surface-sunken',
  danger: 'min-h-(--button-height-sm) border border-hairline bg-transparent text-danger text-t-body font-medium active:bg-surface-sunken',
};

const waiting = 'aria-disabled:bg-surface-sunken aria-disabled:text-text-muted aria-disabled:cursor-default aria-disabled:hover:bg-surface-sunken';

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  variant?: ButtonVariant;
  block?: boolean;
  icon?: LucideIcon;
  /** Shown as a waiting state (aria-disabled), still focusable. */
  waiting?: boolean;
  children: ReactNode;
}

export function Button({ variant = 'secondary', block, icon, waiting: isWaiting, className = '', children, onClick, type = 'button', ...rest }: ButtonProps) {
  return (
    <button
      type={type}
      className={`${base} ${variants[variant]} ${waiting} ${block ? 'flex w-full' : ''} ${className}`}
      aria-disabled={isWaiting || undefined}
      onClick={isWaiting ? (e) => e.preventDefault() : onClick}
      {...rest}
    >
      {icon && <Icon icon={icon} size={20} />}
      {children}
    </button>
  );
}

/** A link styled as a button (navigation to a hash route). */
export function ButtonLink({ variant = 'secondary', block, icon, href, className = '', children }: { variant?: ButtonVariant; block?: boolean; icon?: LucideIcon; href: string; className?: string; children: ReactNode }) {
  return (
    <a href={href} className={`${base} ${variants[variant]} ${block ? 'flex w-full' : ''} ${className}`}>
      {icon && <Icon icon={icon} size={20} />}
      {children}
    </a>
  );
}
