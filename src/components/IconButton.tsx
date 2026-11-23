import type { LucideIcon } from 'lucide-react';
import type { ButtonHTMLAttributes } from 'react';
import { Icon } from './Icon';

export interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  icon: LucideIcon;
  /** Arabic label that says what happens. */
  label: string;
  /** For toggles: on turns the icon accent and filled. */
  pressed?: boolean;
  size?: 'md' | 'lg';
  tone?: 'muted' | 'text';
}

export function IconButton({ icon, label, pressed, size = 'md', tone = 'muted', className = '', type = 'button', ...rest }: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      aria-pressed={pressed}
      className={`inline-flex size-(--touch-target) shrink-0 items-center justify-center rounded-full bg-transparent active:bg-surface-sunken aria-pressed:text-accent ${tone === 'text' ? 'text-text' : 'text-text-muted'} ${className}`}
      {...rest}
    >
      <Icon icon={icon} size={size === 'lg' ? 22 : 20} fill={pressed ? 'currentColor' : 'none'} />
    </button>
  );
}
