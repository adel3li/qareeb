import { useState } from 'react';
import type { AppDua } from '../../content/types';
import { ar } from '../../copy/ar';
import { Button } from '../../components/Button';
import { SacredText } from '../../components/SacredText';
import { sourceReference } from '../../lib/reference';
import { toArabicNumerals } from '../../lib/arabic';
import { useMyDuas, useSettings } from '../../state/store';

/** The fifth step's extras: the dua in large type, a tap counter only when the source gives a number, and the user's needs if they want. */
export function SupplicateExtras({ dua }: { dua: AppDua }) {
  const [count, setCount] = useState(0);
  const [showNeeds, setShowNeeds] = useState(false);
  const enabled = useSettings((s) => s.showMyDuasInFlow);
  const needs = useMyDuas((s) => s.items).filter((d) => !d.answeredAt).slice(-3).reverse();
  const repeat = dua.repeatCount;
  return (
    <div className="flex flex-col gap-4">
      <SacredText kind={dua.kind} text={dua.text} reference={sourceReference(dua)} size="live" />
      {repeat ? (
        <button
          type="button"
          onClick={() => setCount((c) => Math.min(repeat, c + 1))}
          aria-label={ar.live.repeatButton}
          className="mx-auto flex min-h-touch items-center gap-2 rounded-pill border border-solid border-hairline bg-surface px-5 font-sans text-t-body text-text"
        >
          <span aria-live="polite">
            {toArabicNumerals(count)} / {toArabicNumerals(repeat)} · {ar.live.repeat(repeat - count)}
          </span>
        </button>
      ) : null}
      {enabled && needs.length ? (
        <div className="flex flex-col items-center gap-2 text-center">
          <p className="m-0 text-t-body-sm text-text-body">{ar.live.myDuasHint}</p>
          {showNeeds ? (
            <ul className="m-0 flex list-none flex-col gap-1 p-0 text-t-body text-text">
              {needs.map((n) => (
                <li key={n.id}>{n.text}</li>
              ))}
            </ul>
          ) : (
            <Button variant="quiet" onClick={() => setShowNeeds(true)}>
              {ar.live.myDuasShow}
            </Button>
          )}
        </div>
      ) : null}
    </div>
  );
}
