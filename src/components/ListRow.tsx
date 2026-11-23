import type { LucideIcon } from 'lucide-react';
import { ChevronLeft } from 'lucide-react';
import type { ReactNode } from 'react';
import { Icon } from './Icon';

/** A group of rows on a surface, with hairline dividers. */
export function ListGroup({ children, label }: { children: ReactNode; label?: string }) {
  return (
    <ul aria-label={label} className="m-0 list-none overflow-hidden rounded-card border border-solid border-hairline bg-surface p-0 shadow-card [&>li+li]:border-t [&>li+li]:border-solid [&>li+li]:border-hairline">
      {children}
    </ul>
  );
}

export function SectionLabel({ children, id }: { children: ReactNode; id?: string }) {
  return (
    <h2 id={id} className="mx-1 mt-0 mb-2 text-t-caption font-semibold text-accent">
      {children}
    </h2>
  );
}

/** A content row that opens something: title, meta, end marks, chevron. */
export function LinkRow({ href, title, meta, end }: { href: string; title: string; meta?: string; end?: ReactNode }) {
  return (
    <li>
      <a href={href} className="flex min-h-[72px] items-center gap-3 px-card py-2.5 text-text no-underline">
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="text-[1.0625rem] leading-[1.6] font-semibold">{title}</span>
          {meta ? <span className="text-t-caption text-text-muted">{meta}</span> : null}
        </span>
        {end}
        <span className="text-text-muted">
          <Icon icon={ChevronLeft} />
        </span>
      </a>
    </li>
  );
}

/** A settings action row: icon at the start, label; `danger` for destructive ones. */
export function ButtonRow({ icon, label, onClick, danger }: { icon: LucideIcon; label: string; onClick: () => void; danger?: boolean }) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className={`box-border flex min-h-14 w-full items-center gap-3 border-0 bg-transparent px-card text-start font-sans text-t-body ${danger ? 'text-danger' : 'text-text'}`}
      >
        <span className={danger ? 'text-danger' : 'text-text-muted'}>
          <Icon icon={icon} />
        </span>
        {label}
      </button>
    </li>
  );
}
