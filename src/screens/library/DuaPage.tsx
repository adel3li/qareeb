import { ar } from '../../copy/ar';
import { useDua } from '../../content/load';
import { PushedHeader } from '../../app/ScreenHeader';
import { useOverlays } from '../../app/overlays';
import { useToday } from '../../app/useToday';
import { Button } from '../../components/Button';
import { DuaCard } from '../../components/DuaCard';
import { DuaSections } from '../../components/DuaSections';
import { EmptyState } from '../../components/EmptyState';

/**
 * #/dua/:id, the page share links open: the card and its sections. Living a
 * dua here records the day only when it is today's dua (owner's choice in 02 §6;
 * see docs/decisions.md for the open question).
 */
export default function DuaPage({ id }: { id: string }) {
  const dua = useDua(id);
  const today = useToday();
  const openLive = useOverlays((s) => s.openLive);

  if (!dua) {
    return (
      <div className="flex flex-col gap-4">
        <PushedHeader title={ar.library.title} onBack={() => (window.location.hash = '#/library')} />
        <EmptyState
          headingLevel={2}
          title={ar.duaPage.notFound.title}
          body={ar.duaPage.notFound.body}
          action={
            <Button variant="primary" onClick={() => (window.location.hash = '#/today')}>
              {ar.duaPage.notFound.action}
            </Button>
          }
        />
      </div>
    );
  }

  const isToday = today.dua?.id === dua.id;
  return (
    <div className="flex flex-col gap-stack">
      <PushedHeader title={dua.shortTitle} fallback="#/library" />
      <DuaCard
        dua={dua}
        headingLevel={2}
        welcome={isToday && today.role === 'welcome'}
        done={isToday && !!today.completion}
        onLive={() => openLive({ duaId: dua.id, day: today.day, records: isToday, welcome: isToday && today.role === 'welcome' })}
      />
      {!isToday ? <p className="m-0 px-1 text-t-caption text-text-muted">{ar.duaPage.liveNote}</p> : null}
      <DuaSections dua={dua} />
    </div>
  );
}
