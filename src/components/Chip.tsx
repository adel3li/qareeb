import type { ReactNode } from 'react';

const variants = {
  kind: 'bg-surface-sunken text-text-muted px-3 py-[3px]',
  accent: 'border border-solid border-accent text-accent px-[11px] py-[2px]',
  plain: 'border border-solid border-hairline text-text-muted px-2.5 py-px',
  draft: 'border border-solid border-danger text-danger px-[11px] py-[2px]',
} as const;

/** A small, non-interactive label: what kind of text this is. */
export function Chip({ variant = 'kind', children }: { variant?: keyof typeof variants; children: ReactNode }) {
  return <span className={`inline-flex items-center rounded-pill text-t-caption font-medium ${variants[variant]}`}>{children}</span>;
}
