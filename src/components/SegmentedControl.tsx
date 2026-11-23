import { useRef, type KeyboardEvent } from 'react';

export interface Option<T extends string> {
  value: T;
  label: string;
}

/**
 * Two or three equal choices. role 'tabs' switches a view (tablist), role
 * 'radio' picks a value (radiogroup). Arrow keys move between options (RTL aware).
 */
export function SegmentedControl<T extends string>({ options, value, onChange, role, label, controls }: {
  options: Option<T>[];
  value: T;
  onChange: (v: T) => void;
  role: 'tabs' | 'radio';
  label: string;
  /** For tabs: the id of the panel they control. */
  controls?: string;
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const onKey = (e: KeyboardEvent, i: number) => {
    const step = e.key === 'ArrowLeft' ? 1 : e.key === 'ArrowRight' ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const j = (i + step + options.length) % options.length;
    onChange(options[j].value);
    refs.current[j]?.focus();
  };
  return (
    <div role={role === 'tabs' ? 'tablist' : 'radiogroup'} aria-label={label} className="grid auto-cols-fr grid-flow-col gap-1 rounded-control bg-sunken p-1">
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
            aria-selected={role === 'tabs' ? on : undefined}
            aria-checked={role === 'radio' ? on : undefined}
            aria-controls={role === 'tabs' ? controls : undefined}
            tabIndex={on ? 0 : -1}
            onClick={() => onChange(o.value)}
            onKeyDown={(e) => onKey(e, i)}
            className={`min-h-10 rounded-sm border-0 px-2 text-t-body-sm font-semibold ${on ? 'bg-surface text-ink shadow-card' : 'bg-transparent text-muted'}`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
