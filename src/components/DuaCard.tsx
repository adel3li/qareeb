import { Copy, Heart, RotateCcw, Share2 } from 'lucide-react';
import { ar } from '../copy/ar';
import type { Dua } from '../content/types';
import { displayTextOf, kindLabel, referenceOf, sacredKindOf } from '../lib/reference';
import { Authored } from './Authored';
import { Button } from './Button';
import { Chip } from './Chip';
import { IconButton } from './IconButton';
import { SacredText } from './SacredText';
import { StatusBanner } from './StatusBanner';

/** The dua as one card: kind, title and hook, the dua in SacredText, the scene line, the action. */
export function DuaCard({
  dua,
  welcome = false,
  done = false,
  favorite,
  onCopy,
  onShare,
  onFavorite,
  onLive,
  isDraft = false,
}: {
  dua: Dua;
  welcome?: boolean;
  done?: boolean;
  favorite: boolean;
  onCopy: () => void;
  onShare: () => void;
  onFavorite: () => void;
  onLive: () => void;
  isDraft?: boolean;
}) {
  const shown = displayTextOf(dua);
  return (
    <article className="flex flex-col gap-(--stack) rounded-(--radius-card) border border-hairline bg-surface px-(--card-padding) pt-[14px] pb-5 shadow-(--card-shadow)">
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-wrap gap-[6px]">
          <Chip>{kindLabel(dua.kind)}</Chip>
          {welcome && <Chip variant="accent">{ar.today.welcomeChip}</Chip>}
          {isDraft && <Chip variant="warning">{ar.draft.label}</Chip>}
        </div>
        <div className="-me-[10px] flex">
          <IconButton icon={Copy} label={ar.today.copy} onClick={onCopy} />
          <IconButton icon={Share2} label={ar.today.share} onClick={onShare} />
          <IconButton icon={Heart} label={favorite ? ar.today.unfavorite : ar.today.favorite} pressed={favorite} onClick={onFavorite} />
        </div>
      </div>
      <div>
        <h2 className="m-0 font-q-heading text-t-title">
          <Authored text={dua.title} />
        </h2>
        <p className="mt-1 mb-0 text-t-body text-text-body">
          <Authored text={dua.hook} />
        </p>
      </div>
      <SacredText
        kind={sacredKindOf(dua)}
        text={shown.text}
        reference={referenceOf(dua)}
        placeholder={shown.isPlaceholder}
        note={shown.isFullSource ? ar.draft.fullTextNote : shown.isPlaceholder ? ar.draft.placeholderNote : undefined}
      />
      <p className="m-0 text-t-body-sm text-text-body">
        <b className="font-semibold text-accent">{ar.today.sceneLead}</b> <Authored text={dua.sceneLine} />
      </p>
      {done ? (
        <div className="flex flex-col gap-[10px]">
          <StatusBanner>{ar.today.done}</StatusBanner>
          <Button variant="secondary" icon={RotateCcw} onClick={onLive} block>
            {ar.today.again}
          </Button>
        </div>
      ) : (
        <Button variant="primary" block onClick={onLive}>
          {ar.today.live}
          <span className="text-t-caption font-normal">· {ar.today.liveDuration(dua.steps.reduce((t, s) => t + s.durationSec, 0))}</span>
        </Button>
      )}
    </article>
  );
}
