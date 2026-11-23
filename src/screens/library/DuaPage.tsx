import { ButtonLink } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { PushedTopBar } from '../../components/TopBar';
import { LIBRARY_LIVE_RECORDS_DAY, WELCOME_DUA_ID } from '../../config';
import { ar } from '../../copy/ar';
import { findDua, useContent } from '../../content/load';
import { goBack } from '../../app/router';
import { resolveToday } from '../../lib/daily';
import { useLocalDay } from '../../lib/dates';
import { useCompletions, useWelcome } from '../../state/stores';
import { DuaView } from '../today/DuaView';

/**
 * A dua's own page (#/dua/:id), opened from the library or a shared link. Living it here
 * records today only when it is today's dua (or when LIBRARY_LIVE_RECORDS_DAY is on).
 */
export default function DuaPage({ id }: { id: string }) {
  const content = useContent();
  const today = useLocalDay();
  const welcomeDoneOn = useWelcome((s) => s.doneOn);
  const doneToday = useCompletions((s) => s.items.find((c) => c.date === today));
  if (!content) return null;
  const dua = findDua(content, id);
  const todays = resolveToday({ today, items: content.duas, welcomeId: content.welcomeId || WELCOME_DUA_ID, welcomeDoneOn });
  const isTodays = todays.item?.id === id;
  const recordDay = isTodays || LIBRARY_LIVE_RECORDS_DAY ? today : null;
  return (
    <div className="flex flex-col gap-5">
      <PushedTopBar title={dua ? dua.shortTitle : ar.library.title} onBack={() => goBack({ name: 'library' })} />
      <div className="px-(--gutter)">
        {dua ? (
          <DuaView dua={dua} welcome={isTodays && todays.role === 'welcome'} done={doneToday?.duaId === id} recordDay={recordDay} />
        ) : (
          <EmptyState
            title={ar.library.duaNotFoundTitle}
            body={ar.library.duaNotFoundBody}
            action={
              <ButtonLink variant="primary" href="#/today">
                {ar.library.emptyLivedAction}
              </ButtonLink>
            }
          />
        )}
      </div>
    </div>
  );
}
