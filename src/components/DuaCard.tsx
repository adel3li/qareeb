import { Copy, Heart, RotateCcw, Share2 } from 'lucide-react';
import type { AppDua } from '../content/types';
import { levelRank } from '../content/schema';
import { ar } from '../copy/ar';
import { sourceReference, shareText } from '../lib/reference';
import { copyText, duaUrl } from '../lib/clipboard';
import { useFavorites } from '../state/store';
import { useOverlays } from '../app/overlays';
import { Authored } from './Authored';
import { Button } from './Button';
import { Chip } from './Chip';
import { Icon } from './Icon';
import { IconButton } from './IconButton';
import { SacredText } from './SacredText';
import { StatusBanner } from './StatusBanner';
import { useToast } from './Toast';

interface Props {
  dua: AppDua;
  welcome?: boolean;
  /** Today was lived with this dua. */
  done?: boolean;
  onLive: () => void;
  /** Heading level of the title: 1 on the dua page, 2 on Today. */
  headingLevel?: 1 | 2;
}

/** The dua as one card: kind, title and hook, the dua in SacredText, the scene line, and «عِش الدعاء». */
export function DuaCard({ dua, welcome, done, onLive, headingLevel = 2 }: Props) {
  const favorite = useFavorites((s) => s.ids.includes(dua.id));
  const toggleFavorite = useFavorites((s) => s.toggle);
  const openShare = useOverlays((s) => s.openShare);
  const toast = useToast((s) => s.show);
  const draft = levelRank(dua.level) < levelRank('verified');
  const H = headingLevel === 1 ? 'h1' : 'h2';

  const onCopy = async () => toast((await copyText(shareText(dua, duaUrl(dua.id)))) ? ar.common.copied : ar.common.copyFailed);

  return (
    <article aria-labelledby={`title-${dua.id}`} className="flex flex-col gap-stack rounded-card border border-solid border-hairline bg-surface px-card pt-3.5 pb-5 shadow-card">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap gap-1.5 pt-2">
          <Chip>{dua.kind === 'quran' ? ar.card.fromQuran : ar.card.fromSunnah}</Chip>
          {welcome ? <Chip variant="accent">{ar.card.welcome}</Chip> : null}
          {draft ? <Chip variant="draft">{ar.card.draft}</Chip> : null}
        </div>
        <div className="-me-2.5 flex shrink-0">
          <IconButton icon={Copy} label={ar.card.copy} onClick={onCopy} />
          <IconButton icon={Share2} label={ar.card.share} onClick={() => openShare(dua.id)} />
          <IconButton icon={Heart} label={favorite ? ar.card.favoriteRemove : ar.card.favoriteAdd} pressed={favorite} onClick={() => toggleFavorite(dua.id)} />
        </div>
      </div>

      <div>
        <H id={`title-${dua.id}`} className="m-0 font-kufi text-t-title text-text">
          <Authored text={dua.title} />
        </H>
        <p className="mt-1 mb-0 text-t-body text-text-body">
          <Authored text={dua.hook} />
        </p>
      </div>

      <SacredText kind={dua.kind} text={dua.text} reference={sourceReference(dua)} />

      <p className="m-0 text-t-body-sm text-text-body">
        <b className="font-semibold text-accent">{ar.card.scenePrefix}</b> · <Authored text={dua.sceneLine} />
      </p>

      {done ? (
        <div className="flex flex-col gap-3">
          <StatusBanner>{ar.card.done}</StatusBanner>
          <Button variant="secondary" block onClick={onLive} icon={<Icon icon={RotateCcw} />}>
            {ar.card.again}
          </Button>
        </div>
      ) : (
        <Button variant="primary" block onClick={onLive}>
          {ar.card.live}
          <span className="text-t-caption font-normal">· {ar.card.liveDuration}</span>
        </Button>
      )}
    </article>
  );
}
