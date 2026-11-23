import { useRef, type KeyboardEvent } from 'react';

export interface Segment<T extends string> {
  value: T;
  label: string;
}

/**
 * Two or three equal choices, one on. `role="tabs"` switches a view (tablist/tab),
 * `role="radio"` picks a value (radiogroup/radio). Arrow keys move in reading order (RTL).
 */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  label,
  role,
  idPrefix,
}: {
  options: readonly Segment<T>[];
  value: T;
  onChange: (value: T) => void;
  label: string;
  role: 'tabs' | 'radio';
  /** For tabs: the id prefix of the panels each tab controls. */
  idPrefix?: string;
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const onKey = (e: KeyboardEvent, index: number) => {
    const step = e.key === 'ArrowLeft' ? 1 : e.key === 'ArrowRight' ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const next = (index + step + options.length) % options.length;
    onChange(options[next].value);
    refs.current[next]?.focus();
  };
  const isTabs = role === 'tabs';
  return (
    <div
      role={isTabs ? 'tablist' : 'radiogroup'}
      aria-label={label}
      className="grid auto-cols-[minmax(0,1fr)] grid-flow-col gap-1 rounded-(--radius-control) bg-surface-sunken p-1"
    >
      {options.map((o, i) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role={isTabs ? 'tab' : 'radio'}
            id={idPrefix ? `${idPrefix}-tab-${o.value}` : undefined}
            aria-controls={isTabs && idPrefix ? `${idPrefix}-panel` : undefined}
            aria-selected={isTabs ? on : undefined}
            aria-checked={isTabs ? undefined : on}
            tabIndex={on ? 0 : -1}
            onClick={() => onChange(o.value)}
            onKeyDown={(e) => onKey(e, i)}
            className={`min-h-10 rounded-(--radius-sm) px-2 text-t-body-sm font-semibold ${on ? 'bg-surface text-text shadow-(--card-shadow)' : 'bg-transparent text-text-muted'}`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
