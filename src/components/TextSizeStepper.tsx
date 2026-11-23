import { useEffect, useId, useState } from 'react';
import { ar } from '../copy/ar';
import { toArabicNumerals } from '../lib/arabic';
import { clampFontScale, parseDigits } from '../lib/fontScale';
import { FONT_SCALE } from '../config';

/** The text-size setting: − and + around a typed value, corrected only on blur. */
export function TextSizeStepper({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [draft, setDraft] = useState(toArabicNumerals(value));
  const labelId = useId();
  useEffect(() => setDraft(toArabicNumerals(value)), [value]);

  const commit = () => {
    const next = clampFontScale(parseDigits(draft), value);
    onChange(next);
    setDraft(toArabicNumerals(next));
  };
  const btn = 'size-(--touch-target) rounded-(--radius-control) border border-hairline bg-transparent text-[1.25rem] text-text disabled:text-text-muted';
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <span id={labelId} className="text-t-body text-text">
          {ar.settings.textSize}
        </span>
        <div className="flex items-center gap-[6px]" role="group" aria-labelledby={labelId}>
          <button type="button" className={btn} aria-label={ar.settings.textSizeSmaller} disabled={value <= FONT_SCALE.min} onClick={() => onChange(value - 1)}>
            −
          </button>
          <input
            inputMode="numeric"
            aria-label={ar.settings.textSizeValue}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commit();
            }}
            className="box-border h-(--touch-target) w-14 rounded-(--radius-control) border border-hairline bg-surface-sunken text-center text-t-body text-text"
          />
          <button type="button" className={btn} aria-label={ar.settings.textSizeLarger} disabled={value >= FONT_SCALE.max} onClick={() => onChange(value + 1)}>
            +
          </button>
        </div>
      </div>
      <p className="m-0 rounded-(--radius-control) bg-surface-sunken px-[14px] py-3 text-t-body text-text-body">{ar.settings.textSizeSample}</p>
    </div>
  );
}
