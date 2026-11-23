import type { LucideIcon } from 'lucide-react';
import { Icon } from './Icon';

interface Props {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
  size?: 'md' | 'lg';
  /** For toggles: on turns the icon accent and fills it. */
  pressed?: boolean;
  tone?: 'muted' | 'text';
  className?: string;
  /** Mirrors a directional icon in RTL is not needed: callers pick chevron-right for back. */
  id?: string;
}

/** A 44px round button with one icon and an Arabic label that says what happens. */
export function IconButton({ icon, label, onClick, size = 'md', pressed, tone = 'muted', className = '', id }: Props) {
  return (
    <button
      type="button"
      id={id}
      aria-label={label}
      title={label}
      aria-pressed={pressed === undefined ? undefined : pressed}
      onClick={onClick}
      className={`inline-flex size-touch items-center justify-center rounded-pill border-0 bg-transparent ${tone === 'text' ? 'text-text' : 'text-text-muted'} active:bg-surface-sunken aria-pressed:text-accent ${className}`}
    >
      <Icon icon={icon} size={size} filled={pressed} />
    </button>
  );
}
