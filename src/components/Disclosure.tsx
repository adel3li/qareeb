import { ChevronDown } from 'lucide-react';
import { useId, useState, type ReactNode } from 'react';
import { Icon } from './Icon';

/** A row that opens one section of a dua's background. Grouped in DisclosureGroup. */
export function Disclosure({ title, children, defaultOpen = false }: { title: string; children: ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();
  return (
    <div>
      <h3 className="m-0">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen((o) => !o)}
          className="flex min-h-[54px] w-full items-center justify-between gap-3 border-0 bg-transparent px-(--card-padding) text-start text-t-body font-medium text-text"
        >
          {title}
          <Icon
            icon={ChevronDown}
            className={`text-text-muted transition-transform duration-(--duration-fast) ease-(--ease-standard) ${open ? 'rotate-180' : ''}`}
          />
        </button>
      </h3>
      <div id={id} hidden={!open} className="flex-col gap-[10px] px-(--card-padding) pb-[18px] [&:not([hidden])]:flex">
        {children}
      </div>
    </div>
  );
}

export function DisclosureGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section aria-label={label} className="divide-y divide-hairline overflow-hidden rounded-(--radius-card) border border-hairline bg-surface">
      {children}
    </section>
  );
}

/** Running text inside a disclosure body. */
export function Prose({ children }: { children: ReactNode }) {
  return <p className="m-0 text-t-body leading-[1.85] text-text-body">{children}</p>;
}

/** A source line: chips and caption text in text-muted. */
export function SourceLine({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-center gap-2 text-t-caption font-normal text-text-muted">{children}</div>;
}

/** A reflection: ours, so no quotation marks; a 2px accent rule at its start. */
export function Reflection({ children }: { children: ReactNode }) {
  return <p className="m-0 border-s-2 border-accent ps-[14px] text-t-body leading-[1.85] text-text-body">{children}</p>;
}
