import { useMemo, useState } from 'react';
import { Eye } from 'lucide-react';
import { Button } from '../../components/Button';
import { Icon } from '../../components/Icon';
import { SacredText } from '../../components/SacredText';
import type { Dua, GuidedStep } from '../../content/types';
import { ar } from '../../copy/ar';
import { useStored } from '../../state/store';
import { referenceOf } from '../dua/reference';
import { Authored } from '../dua/Authored';
import type { LiveState } from './machine';

/** One paced step inside the arch. Sentences appear in a polite live region. */
export function StepView({ dua, step, sentences, state, canNext, onShowAll, onNext }: {
  dua: Dua;
  step: GuidedStep;
  sentences: string[];
  state: LiveState;
  canNext: boolean;
  onShowAll: () => void;
  onNext: () => void;
}) {
  const last = step.type === 'supplicate';
  const allShown = state.revealed >= sentences.length;
  return (
    <>
      <p className="m-0 text-center text-t-label font-semibold text-accent">{ar.live.stepLabel(state.step + 1, ar.live.steps[step.type])}</p>
      <div className={`arch flex flex-col items-center justify-center border border-solid border-sacred-frame px-[22px] pt-16 pb-8 ${last ? 'min-h-[220px]' : 'min-h-[330px]'}`}>
        <div aria-live="polite" className="flex flex-col gap-3.5 text-center">
          {sentences.slice(0, state.revealed).map((s, i) => (
            <p key={i} className="fade-in m-0 font-heading text-t-live text-ink">
              <Authored text={s} />
            </p>
          ))}
        </div>
      </div>
      {last && <Supplicate dua={dua} />}
      <div className="mt-auto flex flex-col gap-2 pt-4">
        {!allShown && (
          <Button variant="quiet" icon={<Icon as={Eye} />} onClick={onShowAll} className="self-center">
            {ar.live.showAll}
          </Button>
        )}
        <Button block waitingFor={!canNext} aria-label={canNext ? undefined : ar.live.nextWaiting} onClick={onNext}>
          {last ? ar.live.amen : ar.live.next}
        </Button>
      </div>
    </>
  );
}

/** The dua itself in the fifth step, with a tap counter only when the text names a number. */
function Supplicate({ dua }: { dua: Dua }) {
  const [count, setCount] = useState(0);
  const { showMyDuasInFlow } = useStored('settings');
  const myDuas = useStored('myDuas');
  const open = useMemo(() => myDuas.filter((d) => !d.answeredAt).slice(0, 3), [myDuas]);
  const [showNeeds, setShowNeeds] = useState(false);
  return (
    <>
      <SacredText kind={dua.kind} text={dua.text} reference={referenceOf(dua)} size="live" />
      {dua.repeatCount && (
        <div className="flex flex-col items-center gap-1">
          <button
            type="button"
            onClick={() => setCount((c) => Math.min(dua.repeatCount!, c + 1))}
            aria-label={`${ar.live.repeatTap}. ${ar.live.repeatLabel(dua.repeatCount)}`}
            className="min-h-btn-sm min-w-32 rounded-control border border-solid border-hairline bg-surface px-6 text-t-body-lg font-semibold text-ink"
          >
            <span aria-live="polite">{ar.live.repeat(count, dua.repeatCount)}</span>
          </button>
          <span className="text-t-caption font-normal text-muted">{ar.live.repeatTap}</span>
        </div>
      )}
      {showMyDuasInFlow && open.length > 0 && (
        <div className="flex flex-col items-center gap-1 text-center">
          <p className="m-0 text-t-body-sm text-body">{ar.live.myDuasHint}</p>
          <Button variant="quiet" aria-expanded={showNeeds} onClick={() => setShowNeeds((v) => !v)}>
            {showNeeds ? ar.live.myDuasHide : ar.live.myDuasShow}
          </Button>
          {showNeeds && (
            <ul className="m-0 flex list-none flex-col gap-1 p-0 text-t-body text-ink">
              {open.map((d) => (
                <li key={d.id}>{d.text}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </>
  );
}
