import type { LucideIcon } from 'lucide-react';

/** A Lucide icon at the design system's stroke (1.75), sized `md` (20px) or `lg` (22px), coloured by currentColor. */
export function Icon({ icon: Glyph, size = 'md', filled = false, className }: { icon: LucideIcon; size?: 'md' | 'lg' | 'sm'; filled?: boolean; className?: string }) {
  const px = size === 'lg' ? 22 : size === 'sm' ? 18 : 20;
  return <Glyph aria-hidden="true" focusable="false" size={px} strokeWidth={1.75} absoluteStrokeWidth={false} fill={filled ? 'currentColor' : 'none'} className={`shrink-0 ${className ?? ''}`} />;
}
