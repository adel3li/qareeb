import { useEffect, useState } from 'react';
import { FONT_SCALE } from '../config';
import { ar } from '../copy/ar';
import { toArabicNumerals } from '../lib/arabic';
import { clampFontScale, parseFontScale } from '../lib/textSize';

/** − and + around a typed value; the typed value is corrected on blur, never while typing. */
export function TextSizeStepper({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [draft, setDraft] = useState(toArabicNumerals(value));
  useEffect(() => {
    setDraft(toArabicNumerals(value));
  }, [value]);
  const step = (delta: number) => onChange(clampFontScale(value + delta));
  const btn = 'size-touch rounded-control border border-solid border-hairline bg-transparent font-sans text-t-subtitle text-text disabled:text-text-muted';
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <span className="text-t-body text-text">{ar.settings.textSize}</span>
        <div className="flex items-center gap-1.5">
          <button type="button" className={btn} aria-label={ar.settings.larger} disabled={value >= FONT_SCALE.max} onClick={() => step(1)}>
            +
          </button>
          <input
            inputMode="numeric"
            aria-label={ar.settings.textSizeValue}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={() => {
              const next = parseFontScale(draft, value);
              setDraft(toArabicNumerals(next));
              if (next !== value) onChange(next);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
            }}
            className="box-border h-touch w-14 rounded-control border border-solid border-hairline bg-surface-sunken text-center font-sans text-t-body text-text"
          />
          <button type="button" className={btn} aria-label={ar.settings.smaller} disabled={value <= FONT_SCALE.min} onClick={() => step(-1)}>
            −
          </button>
        </div>
      </div>
      <p className="m-0 rounded-control bg-surface-sunken px-4 py-3 text-t-body text-text-body">{ar.settings.sample}</p>
    </div>
  );
}
