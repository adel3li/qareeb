import type { LucideIcon, LucideProps } from 'lucide-react';

/** Lucide at the system's stroke (1.75, round caps and joins); size 20 in cards, 22 in bars. */
export function Icon({ as: Glyph, size = 20, filled, ...rest }: { as: LucideIcon; size?: number; filled?: boolean } & LucideProps) {
  return <Glyph size={size} strokeWidth={1.75} absoluteStrokeWidth={false} aria-hidden="true" fill={filled ? 'currentColor' : 'none'} {...rest} />;
}
