import { Eye } from 'lucide-react';
import { ar } from '../../copy/ar';
import { Button } from '../../components/Button';
import { Icon } from '../../components/Icon';

interface Props {
  label: string;
  sentences: string[];
  revealed: number;
  showAll: boolean;
  allShown: boolean;
  /** «التالي» is available (all shown, or the step's time has passed). */
  canAdvance: boolean;
  onShowAll: () => void;
  onNext: () => void;
  nextLabel: string;
  /** Under the step's text on the fifth step: the dua itself. */
  below?: React.ReactNode;
}

/** One paced step inside the arch: sentences appear one by one in a polite live region. */
export function PacedStep({ label, sentences, revealed, showAll, allShown, canAdvance, onShowAll, onNext, nextLabel, below }: Props) {
  const visible = showAll ? sentences : sentences.slice(0, revealed);
  return (
    <>
      <div className="flex flex-1 flex-col gap-4">
        <p className="m-0 text-center text-t-label font-semibold text-accent">{label}</p>
        <div className={`arch box-border flex ${below ? 'min-h-[min(280px,40dvh)]' : 'min-h-[min(360px,55dvh)]'} flex-col items-center justify-center border border-solid border-sacred-frame px-[22px] pt-16 pb-8`}>
          <div aria-live="polite" className="flex flex-col gap-3.5 text-center">
            {visible.map((s, i) => (
              <p key={i} className="animate-fade m-0 font-kufi text-t-live text-text">
                {s}
              </p>
            ))}
          </div>
        </div>
        {below}
      </div>
      <div className="flex flex-col gap-3 pt-4">
        {!allShown ? (
          <Button variant="quiet" onClick={onShowAll} icon={<Icon icon={Eye} />} className="self-center">
            {ar.live.showAll}
          </Button>
        ) : null}
        <Button variant="primary" block waiting={!canAdvance} onClick={onNext} aria-describedby={!canAdvance ? 'live-wait' : undefined}>
          {nextLabel}
        </Button>
        {!canAdvance ? (
          <p id="live-wait" className="sr-only">
            {ar.live.nextWaiting}
          </p>
        ) : null}
      </div>
    </>
  );
}
