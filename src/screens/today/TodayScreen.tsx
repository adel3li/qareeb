import { TodayTopBar } from '../../app/TopBar';
import { ar } from '../../copy/ar';
import { DuaCard } from '../../features/dua/DuaCard';
import { DuaSections } from '../../features/dua/DuaSections';
import { useToday } from '../../features/dua/useToday';
import { hijriWithWeekday } from '../../lib/format';
import { parseLocalDateString } from '../../lib/dates';
import { useUi } from '../../state/ui';

/** Today: the greeting and the Hijri date, the card, then its sections. Nothing else. */
export default function TodayScreen() {
  const { dua, isWelcome, today, done } = useToday();
  const openLive = useUi((s) => s.openLive);
  const date = parseLocalDateString(today)!;
  date.setHours(12);

  return (
    <div className="flex flex-col gap-stack">
      <TodayTopBar />
      <header className="px-1 md:pt-2">
        <p className="m-0 text-t-body-sm text-muted">{ar.today.greeting}</p>
        <h1 className="m-0 text-t-body-lg font-medium text-ink">{hijriWithWeekday(date)}</h1>
      </header>
      {dua ? (
        <>
          <DuaCard dua={dua} isWelcome={isWelcome} done={!!done} onLive={() => openLive(dua.id, { record: true, isWelcome })} />
          <DuaSections dua={dua} />
        </>
      ) : (
        <p className="m-0 text-t-body text-body">{ar.today.empty}</p>
      )}
    </div>
  );
}
