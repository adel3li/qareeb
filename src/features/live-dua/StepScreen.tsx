import { Eye } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../../components/Button';
import { PacedText } from '../../components/PacedText';
import { SacredText } from '../../components/SacredText';
import { ar } from '../../copy/ar';
import type { Dua, GuidedStep } from '../../content/types';
import { displayTextOf, referenceOf, sacredKindOf } from '../../lib/reference';
import { useMyDuas, useSettings } from '../../state/stores';

/** One of the five steps: paced sentences, «أظهر النص كاملًا», «التالي» (or «يا ربّ»). */
export function StepScreen({
  dua,
  step,
  index,
  count,
  sentences,
  revealed,
  canNext,
  fullShown,
  onShowAll,
  onNext,
}: {
  dua: Dua;
  step: GuidedStep;
  index: number;
  count: number;
  sentences: string[];
  revealed: number;
  canNext: boolean;
  fullShown: boolean;
  onShowAll: () => void;
  onNext: () => void;
}) {
  const last = index === count - 1;
  const shown = displayTextOf(dua);
  return (
    <div className="flex flex-1 flex-col gap-4">
      <PacedText stepLabel={ar.live.stepLabel(index + 1, ar.live.stepNames[step.type])} sentences={sentences} revealed={revealed} />
      {last && (
        <>
          <SacredText kind={sacredKindOf(dua)} text={shown.text} reference={referenceOf(dua)} size="live" placeholder={shown.isPlaceholder} />
          {dua.repeatCount && <RepeatCounter count={dua.repeatCount} />}
          <MyDuasReminder />
        </>
      )}
      <div className="mt-auto flex flex-col gap-2 pt-2">
        {!fullShown && revealed < sentences.length && (
          <Button variant="quiet" icon={Eye} onClick={onShowAll} className="self-center">
            {ar.live.showAll}
          </Button>
        )}
        <Button variant="primary" block waiting={!canNext} onClick={onNext}>
          {last ? ar.live.amen : ar.live.next}
        </Button>
      </div>
    </div>
  );
}

/** Only when the text itself names a number of times. */
function RepeatCounter({ count }: { count: number }) {
  const [done, setDone] = useState(0);
  return (
    <div className="flex flex-col items-center gap-2">
      <p className="m-0 text-center text-t-body-sm text-text-body">{ar.live.repeatHint(count)}</p>
      <button
        type="button"
        aria-label={ar.live.repeatLabel}
        aria-live="polite"
        onClick={() => setDone((d) => Math.min(count, d + 1))}
        className="size-24 rounded-full border border-hairline bg-surface text-t-body font-semibold text-text active:bg-surface-sunken"
      >
        {ar.live.repeatButton(done, count)}
      </button>
    </div>
  );
}

/** «تذكّر حاجاتك في دعائك اليوم», with three open needs if the user asks (a setting that can be turned off). */
function MyDuasReminder() {
  const enabled = useSettings((s) => s.showMyDuasInFlow);
  const open = useMyDuas((s) => s.items.filter((d) => !d.answeredAt));
  const [shown, setShown] = useState(false);
  if (!enabled || open.length === 0) return null;
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <p className="m-0 text-t-body-sm text-text-body">{ar.live.myDuasReminder}</p>
      {shown ? (
        <ul className="m-0 flex list-none flex-col gap-1 p-0 text-t-body text-text">
          {open.slice(-3).map((d) => (
            <li key={d.id}>{d.text}</li>
          ))}
        </ul>
      ) : (
        <Button variant="quiet" onClick={() => setShown(true)}>
          {ar.live.myDuasShow}
        </Button>
      )}
    </div>
  );
}
