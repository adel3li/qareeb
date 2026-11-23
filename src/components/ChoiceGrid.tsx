/** Up to four tiles, one of which may be chosen; choosing again clears it. */
export function ChoiceGrid<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: readonly { value: T; label: string }[];
  value: T | null;
  onChange: (v: T | null) => void;
  label: string;
}) {
  return (
    <div role="group" aria-label={label} className="grid grid-cols-2 gap-[10px]">
      {options.map((o) => {
        const on = value === o.value;
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(on ? null : o.value)}
            className={`min-h-16 rounded-(--radius-control) bg-surface px-2 text-t-body font-medium text-text ${on ? 'border-2 border-cta' : 'border border-hairline'}`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
