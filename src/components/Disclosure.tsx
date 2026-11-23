import { useId, useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { Icon } from './Icon';

/** A group of collapsible sections under the dua card. */
export function DisclosureGroup({ children }: { children: ReactNode }) {
  return <div className="overflow-hidden rounded-card border border-solid border-hairline bg-surface shadow-card [&>*+*]:border-t [&>*+*]:border-solid [&>*+*]:border-hairline">{children}</div>;
}

export function Disclosure({ title, children, defaultOpen = false }: { title: string; children: ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();
  return (
    <section>
      <h3 className="m-0">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen((v) => !v)}
          className="flex min-h-[54px] w-full items-center justify-between border-0 bg-transparent px-card text-start text-t-body font-medium text-ink"
        >
          <span>{title}</span>
          <Icon as={ChevronDown} className={`text-muted transition-transform duration-[var(--duration-fast)] ${open ? 'rotate-180' : ''}`} />
        </button>
      </h3>
      <div id={id} hidden={!open} className="flex flex-col gap-2.5 px-card pb-[18px]">
        {open && children}
      </div>
    </section>
  );
}
