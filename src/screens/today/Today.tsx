import { ar } from '../../copy/ar';
import { DuaCard } from '../../components/DuaCard';
import { DuaSections } from '../../components/DuaSections';
import { EmptyState } from '../../components/EmptyState';
import { hijriDayLabel } from '../../lib/dayLabel';
import { useToday } from '../../app/useToday';
import { useOverlays } from '../../app/overlays';
import { TodayHeader } from '../../app/ScreenHeader';

/** Today: the greeting and the Hijri date, today's dua, and its sections. Nothing else. */
export default function Today() {
  const { day, dua, role, completion } = useToday();
  const openLive = useOverlays((s) => s.openLive);

  return (
    <div className="flex flex-col gap-stack">
      <header>
        <TodayHeader />
        <div className="px-1 pt-1 pb-2">
          <p className="m-0 text-t-body-sm text-text-muted">{ar.today.greeting}</p>
          <h1 className="m-0 font-sans text-t-body-lg font-medium text-text">{hijriDayLabel(day)}</h1>
        </div>
      </header>
      {dua ? (
        <>
          <DuaCard
            dua={dua}
            welcome={role === 'welcome'}
            done={!!completion}
            onLive={() => openLive({ duaId: dua.id, day, records: true, welcome: role === 'welcome' })}
          />
          <DuaSections dua={dua} />
        </>
      ) : (
        <EmptyState title={ar.today.noContent} />
      )}
    </div>
  );
}
