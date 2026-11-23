import { EmptyState } from '../../components/EmptyState';
import { TodayTopBar } from '../../components/TopBar';
import { WELCOME_DUA_ID } from '../../config';
import { ar } from '../../copy/ar';
import { useContent } from '../../content/load';
import { resolveToday } from '../../lib/daily';
import { useLocalDay } from '../../lib/dates';
import { hijriDayLabel } from '../../lib/hijriLabel';
import { useCompletions, useWelcome } from '../../state/stores';
import { DuaView } from './DuaView';

export default function Today() {
  const today = useLocalDay();
  const content = useContent();
  const welcomeDoneOn = useWelcome((s) => s.doneOn);
  const doneToday = useCompletions((s) => s.items.find((c) => c.date === today));

  let body = null;
  if (content) {
    const { item, role } = resolveToday({ today, items: content.duas, welcomeId: content.welcomeId || WELCOME_DUA_ID, welcomeDoneOn });
    // What was lived today is shown as lived today, by its stored id.
    const lived = doneToday ? content.duas.find((d) => d.id === doneToday.duaId) : undefined;
    const dua = lived ?? item;
    body = dua ? (
      <DuaView key={dua.id} dua={dua} welcome={role === 'welcome' && dua.id === item?.id} done={Boolean(doneToday)} recordDay={today} />
    ) : (
      <EmptyState title={ar.today.noContentTitle} body={ar.today.noContentBody} />
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <TodayTopBar hijriDate={hijriDayLabel(today)} />
      <div className="px-(--gutter)">{body}</div>
    </div>
  );
}
