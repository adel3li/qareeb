import { Copy, Heart, RotateCcw, Share2 } from 'lucide-react';
import { Button } from '../../components/Button';
import { Chip } from '../../components/Chip';
import { Icon } from '../../components/Icon';
import { IconButton } from '../../components/IconButton';
import { SacredText } from '../../components/SacredText';
import { StatusBanner } from '../../components/StatusBanner';
import { toast } from '../../components/Toast';
import type { Dua } from '../../content/types';
import { ar, durationWords } from '../../copy/ar';
import { setFavorite } from '../../state/actions';
import { useStored } from '../../state/store';
import { useUi } from '../../state/ui';
import { shareText } from '../share/shareText';
import { Authored } from './Authored';
import { kindLabel, liveSeconds, referenceOf } from './reference';

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/** The dua as one card: kind, title, hook, the dua in SacredText, the scene line, and «عِش الدعاء». */
export function DuaCard({ dua, isWelcome = false, done = false, onLive, headingLevel = 2 }: {
  dua: Dua;
  isWelcome?: boolean;
  done?: boolean;
  onLive: () => void;
  headingLevel?: 1 | 2;
}) {
  const favorite = useStored('favorites').includes(dua.id);
  const openShare = useUi((s) => s.openShare);
  const Title = headingLevel === 1 ? 'h1' : 'h2';

  return (
    <article className="flex flex-col gap-stack rounded-card border border-solid border-hairline bg-surface px-card pt-3.5 pb-5 shadow-card" aria-labelledby={`title-${dua.id}`}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          <Chip>{kindLabel(dua)}</Chip>
          {isWelcome && <Chip variant="accent">{ar.card.welcome}</Chip>}
          {dua.isDraft && <Chip variant="draft">{ar.card.draft}</Chip>}
        </div>
        <div className="-me-2.5 flex">
          <IconButton label={ar.card.copy} onClick={async () => (await copyToClipboard(shareText(dua))) && toast(ar.card.copied)}>
            <Icon as={Copy} />
          </IconButton>
          <IconButton label={ar.card.share} onClick={() => openShare(dua.id)}>
            <Icon as={Share2} />
          </IconButton>
          <IconButton label={favorite ? ar.card.favoriteRemove : ar.card.favoriteAdd} pressed={favorite} onClick={() => setFavorite(dua.id, !favorite)}>
            <Icon as={Heart} filled={favorite} />
          </IconButton>
        </div>
      </div>

      <div>
        <Title id={`title-${dua.id}`} className="m-0 font-heading text-t-title text-ink">
          <Authored text={dua.title} />
        </Title>
        <p className="m-0 mt-1 text-t-body text-body">
          <Authored text={dua.hook} />
        </p>
      </div>

      <SacredText kind={dua.kind} text={dua.text} reference={referenceOf(dua)} />

      <p className="m-0 text-t-body-sm text-body">
        <b className="font-semibold text-accent">{ar.card.sceneLabel}</b> · <Authored text={dua.sceneLine} />
      </p>

      {dua.isDraft && <p className="m-0 text-t-caption font-normal text-danger">{ar.card.draftNote}</p>}

      {done ? (
        <div className="flex flex-col gap-3">
          <StatusBanner>{ar.today.done}</StatusBanner>
          <Button variant="secondary" block icon={<Icon as={RotateCcw} />} onClick={onLive}>
            {ar.today.again}
          </Button>
        </div>
      ) : (
        <Button block onClick={onLive} meta={`· ${durationWords(liveSeconds(dua))}`}>
          {ar.today.live}
        </Button>
      )}
    </article>
  );
}
