import type { ButtonHTMLAttributes, ReactNode } from 'react';

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  children: ReactNode;
  pressed?: boolean;
  tone?: 'muted' | 'ink';
}

/** A 44px round button holding one icon; its Arabic label says what happens. */
export function IconButton({ label, children, pressed, tone = 'muted', className = '', type = 'button', ...rest }: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      aria-pressed={pressed}
      {...rest}
      className={`inline-flex size-touch shrink-0 items-center justify-center rounded-pill border-0 bg-transparent active:bg-sunken disabled:opacity-40 ${
        pressed ? 'text-accent' : tone === 'ink' ? 'text-ink' : 'text-muted'
      } ${className}`}
    >
      {children}
    </button>
  );
}
