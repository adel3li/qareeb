interface Props<T extends string> {
  options: { value: T; label: string }[];
  value: T | null;
  onChange: (value: T | null) => void;
  label: string;
}

/** Up to four tiles; one may be chosen with a tap, and tapping it again clears it. */
export function ChoiceGrid<T extends string>({ options, value, onChange, label }: Props<T>) {
  return (
    <div role="group" aria-label={label} className="grid grid-cols-2 gap-2.5">
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(on ? null : o.value)}
            className={`min-h-16 rounded-control border-solid bg-surface font-sans text-t-body font-medium text-text ${on ? 'border-2 border-cta' : 'border border-hairline'}`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
