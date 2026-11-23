import { CalendarPlus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button, ButtonLink } from '../../components/Button';
import { HijriCalendar } from '../../components/HijriCalendar';
import { TabTopBar } from '../../components/TopBar';
import { ar } from '../../copy/ar';
import { useContent } from '../../content/load';
import { useLocalDay } from '../../lib/dates';
import { hijriDayLabel } from '../../lib/hijriLabel';
import { useCompletions, useNotebook } from '../../state/stores';
import { ReminderSheet } from './ReminderSheet';

export default function CalendarScreen() {
  const today = useLocalDay();
  const content = useContent();
  const completions = useCompletions((s) => s.items);
  const entries = useNotebook((s) => s.items);
  const [offset, setOffset] = useState(0);
  const [selected, setSelected] = useState<string>(today);
  const [reminder, setReminder] = useState(false);

  const lived = useMemo(() => new Set(completions.map((c) => c.date)), [completions]);
  const completion = completions.find((c) => c.date === selected);
  // The dua of that day is the one stored with it, never recomputed from the date.
  const dua = completion && content ? content.duas.find((d) => d.id === completion.duaId) : undefined;
  const notes = entries.filter((e) => e.date === selected && (!completion || e.duaId === completion.duaId || !e.duaId));

  return (
    <div className="flex flex-col gap-5">
      <TabTopBar title={ar.calendar.title} />
      <div className="flex flex-col gap-4 px-(--gutter)">
        <p className="m-0 text-t-body-sm text-text-body">{ar.calendar.intro}</p>
        <HijriCalendar monthOffset={offset} onMonthChange={setOffset} lived={lived} selected={selected} onSelect={setSelected} today={today} />
        <section aria-live="polite" className="flex flex-col gap-2 rounded-(--radius-card) border border-hairline bg-surface px-(--card-padding) py-[14px]">
          <h2 className="m-0 text-t-caption font-semibold text-text-muted">{hijriDayLabel(selected)}</h2>
          {completion ? (
            <>
              <p className="m-0 text-[1.0625rem] leading-[1.6] font-semibold text-text">{dua?.shortTitle ?? completion.duaId}</p>
              {completion.intention && (
                <p className="m-0 text-t-body-sm text-text-body">
                  {ar.calendar.intentionLabel}: {ar.live.intention.options[completion.intention]}
                </p>
              )}
              {notes.map((n) => (
                <p key={n.id} className="m-0 border-s-2 border-accent ps-3 text-t-body whitespace-pre-wrap text-text">
                  {n.text}
                </p>
              ))}
              {dua && (
                <ButtonLink variant="secondary" href={`#/dua/${dua.id}`}>
                  {ar.calendar.openDua}
                </ButtonLink>
              )}
            </>
          ) : (
            <p className="m-0 text-t-body text-text-body">{selected > today ? ar.calendar.futureDay : ar.calendar.noDuaThatDay}</p>
          )}
        </section>
        <Button variant="secondary" icon={CalendarPlus} onClick={() => setReminder(true)} block>
          {ar.calendar.reminder}
        </Button>
      </div>
      {reminder && <ReminderSheet onClose={() => setReminder(false)} />}
    </div>
  );
}
