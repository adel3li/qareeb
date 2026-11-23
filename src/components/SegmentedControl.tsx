import { useRef } from 'react';

interface Option<T extends string> {
  value: T;
  label: string;
}

interface Props<T extends string> {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  /** 'tabs' switches a view (tablist); 'radio' chooses a value (radiogroup). */
  role: 'tabs' | 'radio';
  label: string;
  /** For tabs: the id prefix of the panels they control. */
  idPrefix?: string;
}

/** Two or three equal choices, exactly one on. Arrow keys move between them. */
export function SegmentedControl<T extends string>({ options, value, onChange, role, label, idPrefix }: Props<T>) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const onKeyDown = (e: React.KeyboardEvent, index: number) => {
    // RTL: ArrowLeft moves to the next option, ArrowRight to the previous.
    const delta = e.key === 'ArrowLeft' ? 1 : e.key === 'ArrowRight' ? -1 : 0;
    if (!delta) return;
    e.preventDefault();
    const next = (index + delta + options.length) % options.length;
    onChange(options[next].value);
    refs.current[next]?.focus();
  };
  return (
    <div
      role={role === 'tabs' ? 'tablist' : 'radiogroup'}
      aria-label={label}
      className="grid auto-cols-fr grid-flow-col gap-1 rounded-control bg-surface-sunken p-1"
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
            role={role === 'tabs' ? 'tab' : 'radio'}
            id={idPrefix ? `${idPrefix}-tab-${o.value}` : undefined}
            aria-controls={idPrefix && role === 'tabs' ? `${idPrefix}-panel` : undefined}
            aria-selected={role === 'tabs' ? on : undefined}
            aria-checked={role === 'radio' ? on : undefined}
            tabIndex={on ? 0 : -1}
            onClick={() => onChange(o.value)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={`min-h-10 rounded-sm border-0 px-2 font-sans text-t-body-sm font-semibold ${on ? 'bg-surface text-text shadow-card' : 'bg-transparent text-text-muted'}`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
