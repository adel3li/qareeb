import { ChevronLeft, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Icon } from './Icon';

export function ListGroup({ label, children }: { label?: string; children: ReactNode }) {
  return (
    <section className="flex flex-col">
      {label && <h2 className="mx-1 mt-0 mb-2 text-t-caption font-semibold text-accent">{label}</h2>}
      <ul className="m-0 list-none divide-y divide-hairline overflow-hidden rounded-(--radius-card) border border-hairline bg-surface p-0">{children}</ul>
    </section>
  );
}

/** A content row (a dua lived): title, meta, end marks, opens something. */
export function ListRow({ title, meta, href, end }: { title: string; meta?: string; href: string; end?: ReactNode }) {
  return (
    <li>
      <a href={href} className="flex min-h-[72px] items-center gap-3 px-(--card-padding) py-[10px] text-text no-underline">
        <span className="flex min-w-0 flex-1 flex-col gap-[2px]">
          <span className="text-[1.0625rem] leading-[1.6] font-semibold">{title}</span>
          {meta && <span className="text-t-caption font-normal text-text-muted">{meta}</span>}
        </span>
        {end}
        <Icon icon={ChevronLeft} className="text-text-muted" />
      </a>
    </li>
  );
}

/** A settings row as a button: 56px, an icon at its start. */
export function RowButton({ icon, children, onClick, danger, href, download }: { icon: LucideIcon; children: ReactNode; onClick?: () => void; danger?: boolean; href?: string; download?: boolean }) {
  const cls = `box-border flex min-h-14 w-full items-center gap-3 border-0 bg-transparent px-(--card-padding) text-start text-t-body no-underline active:bg-surface-sunken ${danger ? 'text-danger' : 'text-text'}`;
  const inner = (
    <>
      <Icon icon={icon} className={danger ? 'text-danger' : 'text-text-muted'} />
      <span className="flex-1">{children}</span>
    </>
  );
  return (
    <li>
      {href ? (
        <a href={href} className={cls} download={download}>
          {inner}
        </a>
      ) : (
        <button type="button" className={cls} onClick={onClick}>
          {inner}
        </button>
      )}
    </li>
  );
}

/** A plain row inside a group (a switch, a stepper, a paragraph). */
export function RowItem({ children }: { children: ReactNode }) {
  return <li className="px-(--card-padding) py-3">{children}</li>;
}
