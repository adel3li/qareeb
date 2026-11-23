import { useId, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { Icon } from './Icon';

/** A group of collapsible sections under the dua card. */
export function DisclosureGroup({ children }: { children: ReactNode }) {
  return <div className="overflow-hidden rounded-card border border-solid border-hairline bg-surface shadow-card [&>*+*]:border-t [&>*+*]:border-solid [&>*+*]:border-hairline">{children}</div>;
}

export function Disclosure({ title, expanded, onToggle, children }: { title: string; expanded: boolean; onToggle: () => void; children: ReactNode }) {
  const bodyId = useId();
  return (
    <section>
      <h3 className="m-0">
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={bodyId}
          onClick={onToggle}
          className="flex min-h-[54px] w-full items-center justify-between border-0 bg-transparent px-card text-start font-sans text-t-body font-medium text-text"
        >
          {title}
          <span className={`text-text-muted transition-transform duration-fast ease-standard ${expanded ? 'rotate-180' : ''}`}>
            <Icon icon={ChevronDown} />
          </span>
        </button>
      </h3>
      <div id={bodyId} hidden={!expanded} className="flex flex-col gap-2.5 px-card pb-[18px]">
        {expanded ? children : null}
      </div>
    </section>
  );
}
