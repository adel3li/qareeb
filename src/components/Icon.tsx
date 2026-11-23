import type { LucideIcon, LucideProps } from 'lucide-react';

/** Lucide icons at the design system's stroke (1.75, round caps and joins), coloured by currentColor. */
export function Icon({ icon: Glyph, size = 20, ...rest }: { icon: LucideIcon; size?: number } & Omit<LucideProps, 'ref'>) {
  return <Glyph size={size} strokeWidth={1.75} absoluteStrokeWidth={false} aria-hidden="true" focusable="false" {...rest} />;
}
