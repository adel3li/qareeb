import { navigate } from '../../app/router';
import { Button } from '../../components/Button';
import { useContent } from '../../content/load';
import { ar } from '../../copy/ar';
import { hijriOfDay } from '../../lib/format';
import { completionOn } from '../../lib/progress';
import { useStored } from '../../state/store';

/** The chosen day: the dua stored for it (by id, never recomputed), the intention, and what was written. */
export function DayDetail({ day, today }: { day: string; today: string }) {
  const completions = useStored('completions');
  const notes = useStored('notebook');
  const bundle = useContent();
  const c = completionOn(completions, day);
  const dua = c ? bundle.duas.find((d) => d.id === c.duaId) : undefined;
  const written = c ? notes.filter((n) => n.date === day && n.duaId === c.duaId) : [];

  return (
    <section aria-live="polite" className="flex flex-col gap-2 rounded-card border border-solid border-hairline bg-surface px-card py-3.5 shadow-card">
      <h2 className="m-0 text-t-caption font-semibold text-muted">{hijriOfDay(day)}</h2>
      {c ? (
        <>
          <p className="m-0 font-heading text-t-subtitle text-ink">{dua ? dua.shortTitle : ar.calendar.missingDua}</p>
          {c.intention && <p className="m-0 text-t-body-sm text-muted">{ar.intentionLine(ar.intentions[c.intention])}</p>}
          {written.map((n) => (
            <p key={n.id} className="m-0 whitespace-pre-wrap break-words border-0 border-s-2 border-solid border-accent ps-3 text-t-body text-body">
              {n.text}
            </p>
          ))}
          {dua && (
            <Button variant="secondary" block className="mt-1" onClick={() => navigate({ name: 'dua', id: dua.id })}>
              {ar.calendar.openDua}
            </Button>
          )}
        </>
      ) : (
        <p className="m-0 text-t-body text-body">{day > today ? ar.calendar.futureDay : ar.calendar.emptyDay}</p>
      )}
    </section>
  );
}
