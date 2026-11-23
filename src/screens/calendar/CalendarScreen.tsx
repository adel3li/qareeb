import { useMemo, useState } from 'react';
import { CalendarPlus, ChevronLeft, ChevronRight } from 'lucide-react';
import { TabTitle } from '../../app/TopBar';
import { Button } from '../../components/Button';
import { Icon } from '../../components/Icon';
import { IconButton } from '../../components/IconButton';
import { ar } from '../../copy/ar';
import { parseLocalDateString, useLocalDay } from '../../lib/dates';
import { generateMonthCalendar } from '../../lib/hijri';
import { useStored } from '../../state/store';
import { DayDetail } from './DayDetail';
import { ReminderSheet } from './ReminderSheet';

/**
 * المداومة: the real Hijri month from Saturday, the days the user lived a dua
 * marked quietly. Never a total, a run of days, a percentage or a chart.
 */
export default function CalendarScreen() {
  const today = useLocalDay();
  const completions = useStored('completions');
  const [offset, setOffset] = useState(0);
  const [selected, setSelected] = useState(today);
  const [reminder, setReminder] = useState(false);
  const month = useMemo(() => {
    const ref = parseLocalDateString(today)!;
    return generateMonthCalendar(ref, offset);
  }, [today, offset]);
  const lived = useMemo(() => new Set(completions.map((c) => c.date)), [completions]);

  return (
    <div className="flex flex-col gap-stack">
      <div>
        <TabTitle>{ar.calendar.title}</TabTitle>
        <p className="m-0 mt-1 text-t-body-sm text-body">{ar.calendar.subtitle}</p>
      </div>

      <section aria-labelledby="month-title" className="rounded-card border border-solid border-hairline bg-surface px-2 pt-2 pb-3 shadow-card">
        <div className="flex items-center justify-between">
          <IconButton label={ar.calendar.prev} tone="ink" onClick={() => setOffset((o) => o - 1)}>
            <Icon as={ChevronRight} />
          </IconButton>
          <h2 id="month-title" aria-live="polite" className="m-0 text-center text-t-body-lg font-semibold text-ink">
            {month.monthTitle}
          </h2>
          <IconButton label={ar.calendar.next} tone="ink" disabled={offset >= 0} onClick={() => setOffset((o) => Math.min(0, o + 1))}>
            <Icon as={ChevronLeft} />
          </IconButton>
        </div>
        <div className="mt-1 grid grid-cols-7 gap-y-1">
          <div className="contents">
            {ar.calendar.weekdays.map((w, i) => (
              <abbr key={w} title={ar.calendar.weekdayNames[i]} aria-hidden="true" className="text-center text-t-tab font-medium leading-loose text-muted no-underline">
                {w}
              </abbr>
            ))}
          </div>
          <div className="contents">
            {Array.from({ length: month.startPadding }, (_, i) => (
              <span key={`pad-${i}`} aria-hidden="true" />
            ))}
            {month.days.map((d) => {
              const isLived = lived.has(d.isoDate);
              const isToday = d.isoDate === today;
              const isSelected = d.isoDate === selected;
              return (
                <span key={d.isoDate} className="flex justify-center">
                  <button
                    type="button"
                    aria-pressed={isSelected}
                    aria-label={ar.calendar.dayAria(ar.calendar.weekdayNames[d.weekdayIndex], d.arabicNumber, isLived, isToday)}
                    onClick={() => setSelected(d.isoDate)}
                    className={`box-border flex size-touch flex-col items-center justify-center gap-px rounded-pill p-0 text-t-body-sm after:size-1 after:rounded-pill after:content-[''] ${
                      isSelected ? 'border-2 border-solid border-ink' : isToday ? 'border border-dashed border-accent' : 'border border-solid border-transparent'
                    } ${isLived ? 'bg-sunken font-semibold after:bg-cta' : 'bg-transparent after:bg-transparent'} ${d.isFuture ? 'text-muted' : 'text-ink'} ${isToday ? 'font-semibold' : ''}`}
                  >
                    {d.arabicNumber}
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      </section>

      <DayDetail day={selected} today={today} />

      <Button variant="secondary" block icon={<Icon as={CalendarPlus} />} onClick={() => setReminder(true)}>
        {ar.calendar.reminder}
      </Button>
      {reminder && <ReminderSheet onClose={() => setReminder(false)} />}
    </div>
  );
}
