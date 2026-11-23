import type { ReactNode } from 'react';

const variants = {
  kind: 'bg-surface-sunken text-text-muted px-3 py-[3px]',
  accent: 'border border-accent text-accent px-[11px] py-[2px]',
  plain: 'border border-hairline text-text-muted px-[10px] py-px',
  warning: 'border border-danger text-danger px-[11px] py-[2px]',
} as const;

/** A small non-interactive label: kind of text («من القرآن»), «دعاء الترحيب», «بتصرّف». */
export function Chip({ variant = 'kind', children }: { variant?: keyof typeof variants; children: ReactNode }) {
  return <span className={`inline-flex items-center rounded-full text-t-caption ${variants[variant]}`}>{children}</span>;
}
