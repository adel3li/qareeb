import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useMemo } from 'react';
import { ar } from '../copy/ar';
import { generateMonthCalendar } from '../lib/hijri';
import { IconButton } from './IconButton';

/**
 * The month view of المداومة: real Hijri months (Umm al-Qura), weeks from Saturday,
 * lived days marked quietly. No totals and no percentages (product promises).
 */
export function HijriCalendar({
  monthOffset,
  onMonthChange,
  lived,
  selected,
  onSelect,
  today,
}: {
  /** 0 is the current Hijri month, -1 the one before (stepping by real Hijri months). */
  monthOffset: number;
  onMonthChange: (offset: number) => void;
  /** Local days on which a dua was lived. */
  lived: ReadonlySet<string>;
  selected: string | null;
  onSelect: (day: string) => void;
  /** Today's local day, so the view re-renders at midnight. */
  today: string;
}) {
  const month = useMemo(() => generateMonthCalendar(new Date(), monthOffset), [monthOffset, today]);
  return (
    <section aria-label={month.monthTitle} className="rounded-(--radius-card) border border-hairline bg-surface px-2 pt-2 pb-3">
      <div className="flex items-center justify-between">
        <IconButton icon={ChevronRight} label={ar.calendar.prevMonth} onClick={() => onMonthChange(monthOffset - 1)} tone="text" />
        <h2 aria-live="polite" className="m-0 text-[1.0625rem] leading-[1.6] font-semibold">
          {month.monthTitle}
        </h2>
        <IconButton icon={ChevronLeft} label={ar.calendar.nextMonth} onClick={() => onMonthChange(monthOffset + 1)} disabled={monthOffset >= 0} tone="text" className="disabled:opacity-40" />
      </div>
      <div role="grid" aria-label={month.monthTitle} className="mt-1">
        <div role="row" className="grid grid-cols-7">
          {ar.calendar.weekdays.map((d, i) => (
            <span key={d} role="columnheader" aria-label={ar.calendar.weekdayNames[i]} className="text-center text-[0.75rem] leading-[2] font-medium text-text-muted">
              {d}
            </span>
          ))}
        </div>
        <div role="row" className="grid grid-cols-7 gap-y-1">
          {Array.from({ length: month.startPadding }, (_, i) => (
            <span key={`pad-${i}`} role="gridcell" aria-hidden="true" />
          ))}
          {month.days.map((d) => {
            const isLived = lived.has(d.isoDate);
            const isSelected = selected === d.isoDate;
            const words = [ar.calendar.weekdayNames[d.weekdayIndex], d.arabicNumber];
            const label = `${words.join(' ')}${d.isToday ? `، ${ar.calendar.dayToday}` : ''}${isLived ? `، ${ar.calendar.dayLived}` : ''}`;
            return (
              <span key={d.isoDate} role="gridcell" className="flex justify-center">
                <button
                  type="button"
                  aria-label={label}
                  aria-pressed={isSelected}
                  data-day={d.isoDate}
                  onClick={() => onSelect(d.isoDate)}
                  className={[
                    'box-border flex size-(--touch-target) flex-col items-center justify-center gap-px rounded-full p-0 text-t-body-sm',
                    'after:size-1 after:rounded-full after:content-[""]',
                    isLived ? 'bg-surface-sunken font-semibold after:bg-cta' : 'bg-transparent',
                    isSelected ? 'border-2 border-text' : d.isToday ? 'border border-dashed border-accent font-semibold' : 'border border-transparent',
                    d.isFuture ? 'text-text-muted' : 'text-text',
                  ].join(' ')}
                >
                  {d.arabicNumber}
                </button>
              </span>
            );
          })}
        </div>
      </div>
    </section>
  );
}
