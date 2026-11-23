import { useMemo, useState } from 'react';
import { CalendarPlus, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { ar } from '../../copy/ar';
import { useContent } from '../../content/load';
import { TabTitle } from '../../app/ScreenHeader';
import { Button } from '../../components/Button';
import { Dialog } from '../../components/Dialog';
import { Icon } from '../../components/Icon';
import { IconButton } from '../../components/IconButton';
import { TextField } from '../../components/TextField';
import { useToast } from '../../components/Toast';
import { buildDailyReminderIcs, downloadIcs } from '../../lib/calendarReminder';
import { hijriDayLabel } from '../../lib/dayLabel';
import { parseLocalDateString, useLocalDay } from '../../lib/dates';
import { generateMonthCalendar } from '../../lib/hijri';
import { useCompletions, useNotebook } from '../../state/store';

/**
 * المداومة: the real Hijri month from Saturday, the days a dua was lived
 * marked quietly, and a day's detail from what was stored. No totals, no
 * runs of days, no percentages.
 */
export default function Calendar() {
  const today = useLocalDay();
  const [offset, setOffset] = useState(0);
  const [selected, setSelected] = useState(today);
  const [reminder, setReminder] = useState(false);
  const completions = useCompletions((s) => s.items);
  const month = useMemo(() => generateMonthCalendar(parseLocalDateString(today) ?? new Date(), offset), [today, offset]);
  const lived = useMemo(() => new Map(completions.map((c) => [c.date, c])), [completions]);
  const w = ar.calendar;

  return (
    <div className="flex flex-col gap-4">
      <TabTitle title={w.title} />
      <p className="m-0 text-t-body text-text-body">{w.intro}</p>

      <section aria-labelledby="month-title" className="rounded-card border border-solid border-hairline bg-surface px-2 pt-2 pb-3 shadow-card">
        <div className="flex items-center justify-between">
          <IconButton icon={ChevronRight} label={w.prev} tone="text" onClick={() => setOffset(offset - 1)} />
          <h2 id="month-title" aria-live="polite" className="m-0 text-[1.0625rem] leading-[1.6] font-semibold text-text">
            {month.monthTitle}
          </h2>
          {offset < 0 ? (
            <IconButton icon={ChevronLeft} label={w.next} tone="text" onClick={() => setOffset(offset + 1)} />
          ) : (
            <span aria-hidden="true" className="flex size-touch items-center justify-center text-text-muted opacity-40">
              <Icon icon={ChevronLeft} />
            </span>
          )}
        </div>
        <div className="mt-1 grid grid-cols-7 gap-y-1">
          <div className="contents">
            {w.weekdays.map((d, i) => (
              <span key={i} aria-hidden="true" className="text-center text-t-tab font-medium leading-[2] text-text-muted">
                {d}
              </span>
            ))}
          </div>
          <div className="contents">
            {Array.from({ length: month.startPadding }, (_, i) => (
              <span key={`pad-${i}`} />
            ))}
            {month.days.map((day) => {
              const c = lived.get(day.isoDate);
              const isSelected = day.isoDate === selected;
              const label = [w.weekdayNames[day.weekdayIndex], day.arabicNumber, c ? w.lived : '', day.isToday ? w.today : ''].filter(Boolean).join('، ');
              return (
                <span key={day.isoDate} className="flex justify-center">
                  <button
                    type="button"
                    aria-label={label}
                    aria-pressed={isSelected}
                    onClick={() => setSelected(day.isoDate)}
                    className={[
                      'box-border flex size-touch flex-col items-center justify-center gap-px rounded-pill p-0 font-sans text-t-body-sm',
                      c ? 'bg-surface-sunken font-semibold' : 'bg-transparent',
                      day.isFuture ? 'text-text-muted' : 'text-text',
                      isSelected ? 'border-2 border-solid border-text' : day.isToday ? 'border border-dashed border-accent font-semibold' : 'border border-solid border-transparent',
                    ].join(' ')}
                  >
                    {day.arabicNumber}
                    <span aria-hidden="true" className={`size-1 rounded-pill ${c ? 'bg-cta' : 'bg-transparent'}`} />
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      </section>

      <DayDetail day={selected} future={selected > today} />

      <Button variant="secondary" block icon={<Icon icon={CalendarPlus} />} onClick={() => setReminder(true)}>
        {w.reminder.button}
      </Button>
      {reminder ? <ReminderSheet onClose={() => setReminder(false)} /> : null}
    </div>
  );
}

function DayDetail({ day, future }: { day: string; future: boolean }) {
  const completion = useCompletions((s) => s.items.find((c) => c.date === day));
  const entries = useNotebook((s) => s.entries).filter((e) => e.date === day && (!completion || e.duaId === completion.duaId));
  const dua = useContent((s) => (completion ? s.byId.get(completion.duaId) : undefined));
  const w = ar.calendar;
  return (
    <section aria-live="polite" className="flex flex-col gap-2 rounded-card border border-solid border-hairline bg-surface px-card py-3.5 shadow-card">
      <h2 className="m-0 text-t-caption font-semibold text-text-muted">{hijriDayLabel(day)}</h2>
      {completion ? (
        <>
          <h3 className="m-0 text-[1.0625rem] leading-[1.6] font-semibold text-text">{dua?.shortTitle ?? completion.duaId}</h3>
          {completion.intention ? <p className="m-0 text-t-body-sm text-text-body">{w.intention(ar.live.intention.options[completion.intention])}</p> : null}
          {entries.map((e) => (
            <p key={e.id} className="m-0 whitespace-pre-wrap border-s-2 border-solid border-accent ps-3.5 text-t-body text-text-body">
              {e.text}
            </p>
          ))}
          {dua ? (
            <Button variant="secondary" block className="mt-1" onClick={() => (window.location.hash = `#/dua/${dua.id}`)}>
              {w.openDua}
            </Button>
          ) : null}
        </>
      ) : (
        <p className="m-0 text-t-body text-text-body">{future ? w.futureDay : w.emptyDay}</p>
      )}
    </section>
  );
}

function ReminderSheet({ onClose }: { onClose: () => void }) {
  const [time, setTime] = useState('21:00');
  const toast = useToast((s) => s.show);
  const r = ar.calendar.reminder;
  return (
    <Dialog open title={r.title} onClose={onClose}>
      <p className="m-0 text-t-body text-text-body">{r.body}</p>
      <TextField label={r.time} type="time" value={time} onChange={(e) => setTime(e.target.value)} className="text-start" dir="ltr" />
      <Button
        variant="primary"
        block
        waiting={!/^\d{2}:\d{2}$/.test(time)}
        icon={<Icon icon={Download} />}
        onClick={() => {
          const url = `${window.location.origin}${window.location.pathname}#/today`;
          downloadIcs(
            buildDailyReminderIcs({ title: r.eventTitle, description: r.eventDescription, url, time, uid: 'qareeb-daily-reminder@qareeb', productId: '-//Qareeb//Daily reminder//AR' }),
            'qareeb-reminder.ics',
          );
          toast(r.done);
          onClose();
        }}
      >
        {r.download}
      </Button>
    </Dialog>
  );
}
