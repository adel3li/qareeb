import { DuaCard } from '../../components/DuaCard';
import { isDraftCard } from '../../content/load';
import type { Dua } from '../../content/types';
import { copyDua } from '../../features/dua-actions';
import { useFavorites } from '../../state/stores';
import { useUi } from '../../state/ui';
import { DuaSections } from './DuaSections';

/** The dua card with its sections: Today and the library's dua page. */
export function DuaView({ dua, welcome = false, done, recordDay }: { dua: Dua; welcome?: boolean; done: boolean; recordDay: string | null }) {
  const favorite = useFavorites((s) => s.ids.includes(dua.id));
  const toggle = useFavorites((s) => s.toggle);
  const openLive = useUi((s) => s.openLive);
  const openShare = useUi((s) => s.openShare);
  return (
    <div className="flex flex-col gap-(--stack)">
      <DuaCard
        dua={dua}
        welcome={welcome}
        done={done}
        favorite={favorite}
        isDraft={isDraftCard(dua)}
        onCopy={() => void copyDua(dua)}
        onShare={() => openShare(dua.id)}
        onFavorite={() => toggle(dua.id)}
        onLive={() => openLive({ duaId: dua.id, recordDay, welcome })}
      />
      <DuaSections dua={dua} />
    </div>
  );
}
