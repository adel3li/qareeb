import { useEffect, useState } from 'react';
import { ar, num } from '../../copy/ar';

const MIN = 14;
const MAX = 24;

/** Reads Western or Arabic-Indic digits. */
export function parseSize(input: string): number | null {
  const western = input.replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d))).replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)));
  const n = Number.parseInt(western.trim(), 10);
  return Number.isFinite(n) ? n : null;
}

export function clampSize(n: number | null, fallback: number): number {
  if (n === null) return fallback;
  return Math.min(MAX, Math.max(MIN, n));
}

/** − and + around a typed value; the typed value is corrected only when the field loses focus (U-06). */
export function TextSizeStepper({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [draft, setDraft] = useState(num(value));
  useEffect(() => setDraft(num(value)), [value]);
  const commit = () => {
    const next = clampSize(parseSize(draft), value);
    setDraft(num(next));
    if (next !== value) onChange(next);
  };
  const btn = 'box-border size-touch shrink-0 rounded-control border border-solid border-hairline bg-transparent text-[1.25rem] text-ink disabled:text-muted';
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <span className="text-t-body text-ink" id="text-size-label">
          {ar.settings.textSize}
        </span>
        <div className="flex items-center gap-1.5" role="group" aria-labelledby="text-size-label">
          <button type="button" className={btn} aria-label={ar.settings.textLarger} disabled={value >= MAX} onClick={() => onChange(Math.min(MAX, value + 1))}>
            +
          </button>
          <input
            inputMode="numeric"
            aria-label={ar.settings.textValue}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => e.key === 'Enter' && commit()}
            className="box-border h-touch w-14 rounded-control border border-solid border-hairline bg-sunken text-center text-t-body text-ink"
          />
          <button type="button" className={btn} aria-label={ar.settings.textSmaller} disabled={value <= MIN} onClick={() => onChange(Math.max(MIN, value - 1))}>
            −
          </button>
        </div>
      </div>
      <p className="m-0 rounded-control bg-sunken px-4 py-3 text-t-body text-body">{ar.settings.textSample}</p>
    </div>
  );
}
