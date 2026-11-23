import { PushedTitle } from '../../app/TopBar';
import { goBack, navigate } from '../../app/router';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { findDua, useContent } from '../../content/load';
import { ar } from '../../copy/ar';
import { DuaCard } from '../../features/dua/DuaCard';
import { DuaSections } from '../../features/dua/DuaSections';
import { useToday } from '../../features/dua/useToday';
import { useUi } from '../../state/ui';

/**
 * A dua's own page (#/dua/:id), opened from the library or a shared link.
 * «عِش الدعاء» here records the day only when this is today's dua.
 */
export default function DuaScreen({ id }: { id: string }) {
  const dua = findDua(useContent(), id);
  const today = useToday();
  const openLive = useUi((s) => s.openLive);
  const back = () => goBack({ name: 'library' });

  if (!dua) {
    return (
      <div className="flex flex-col gap-stack">
        <PushedTitle title={ar.library.title} onBack={back} />
        <EmptyState title={ar.library.notFoundTitle} body={ar.library.notFoundBody} action={<Button onClick={() => navigate({ name: 'today' })}>{ar.library.goToday}</Button>} />
      </div>
    );
  }

  const isToday = today.dua?.id === dua.id;
  return (
    <div className="flex flex-col gap-stack">
      <PushedTitle title={dua.shortTitle} onBack={back} />
      <DuaCard
        dua={dua}
        isWelcome={isToday && today.isWelcome}
        done={isToday && !!today.done}
        onLive={() => openLive(dua.id, { record: isToday, isWelcome: isToday && today.isWelcome })}
      />
      {!isToday && <p className="m-0 px-1 text-t-caption font-normal text-muted">{ar.live.notRecorded}</p>}
      <DuaSections dua={dua} />
    </div>
  );
}
