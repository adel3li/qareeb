import { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Share2, X } from 'lucide-react';
import { Button } from '../../components/Button';
import { Dialog } from '../../components/Dialog';
import { Icon } from '../../components/Icon';
import { IconButton } from '../../components/IconButton';
import { ProgressDots } from '../../components/ProgressDots';
import { toast } from '../../components/Toast';
import { findDua, useContent } from '../../content/load';
import { ar } from '../../copy/ar';
import { splitSentences } from '../../lib/arabicSearch';
import { useDialog } from '../../lib/useDialog';
import { navigate } from '../../app/router';
import { addMyDua, addNote, clearDraft, completeDua, saveDraft } from '../../state/actions';
import { getStored } from '../../state/store';
import { useUi } from '../../state/ui';
import { ClosingView, IntentionView, NeedView, NotebookView } from './AfterSteps';
import { canGoNext, initialState, isPacing, PACE_MS, progressIndex, reducer, STEP_COUNT } from './machine';
import { StepView } from './StepView';

const CLOSING_HOLD_MS = 2000;

/**
 * «عِش الدعاء»: a full screen over the app (portal, focus kept inside, Escape
 * closes, focus returns). The day is recorded only at the closing, with the
 * dua's id; closing earlier records nothing, and unsaved writing stays a draft.
 */
export default function LiveDua() {
  const live = useUi((s) => s.live)!;
  const closeLive = useUi((s) => s.closeLive);
  const shareOpen = useUi((s) => s.share !== null);
  const openShare = useUi((s) => s.openShare);
  const dua = findDua(useContent(), live.duaId);
  const sentences = useMemo(() => dua?.steps.map((s) => splitSentences(s.text)) ?? [], [dua]);
  const [state, dispatch] = useReducer(reducer, undefined, () => initialState(sentences[0]?.length ?? 1, dua?.steps[0]?.durationSec ?? 10));
  const [confirming, setConfirming] = useState(false);
  const textRef = useRef('');
  const draft = useMemo(() => getStored('drafts')[live.duaId], [live.duaId]);

  // One timer for the current step, cleared on every change and on close.
  const pacing = isPacing(state);
  useEffect(() => {
    if (!pacing) return;
    const t = setInterval(() => dispatch({ type: 'tick' }), PACE_MS);
    return () => clearInterval(t);
  }, [pacing, state.step]);

  // The closing: record the day, hold, then return to Today.
  useEffect(() => {
    if (state.phase !== 'closing' || !dua) return;
    if (live.record) completeDua(dua.id, { intention: state.intention ?? undefined, isWelcome: live.isWelcome });
    clearDraft(dua.id);
    const t = setTimeout(() => {
      closeLive();
      if (live.record) navigate({ name: 'today' });
    }, CLOSING_HOLD_MS);
    return () => clearTimeout(t);
  }, [state.phase]); // eslint-disable-line react-hooks/exhaustive-deps

  const requestClose = () => {
    if (state.phase === 'closing') return;
    const hasDraft = !!getStored('drafts')[live.duaId] || textRef.current.trim() !== '';
    if (hasDraft) setConfirming(true);
    else closeLive();
  };
  const leave = () => {
    if (textRef.current.trim()) saveDraft(live.duaId, state.phase === 'need' ? { needText: textRef.current } : { notebookText: textRef.current });
    closeLive();
  };

  const ref = useDialog<HTMLDivElement>({ onClose: requestClose, active: !confirming && !shareOpen, focusKey: `${state.phase}-${state.step}` });

  if (!dua) return null;
  const step = dua.steps[state.step];
  const next = () => {
    const n = state.step + 1;
    dispatch({ type: 'next', nextTotal: sentences[n]?.length ?? 1, nextDuration: dua.steps[n]?.durationSec });
  };
  const onType = (t: string) => {
    textRef.current = t;
  };

  return createPortal(
    <div
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-label={`${ar.live.title}: ${dua.shortTitle}`}
      tabIndex={-1}
      className="glow fixed inset-0 z-40 overflow-y-auto bg-page outline-none"
    >
      <div className="mx-auto flex min-h-full max-w-content flex-col gap-4 px-6 pt-2 pb-[calc(20px+env(safe-area-inset-bottom,0px))]">
        <div className="flex items-center justify-between">
          <IconButton label={ar.live.close} tone="ink" onClick={requestClose} className="-ms-2.5">
            <Icon as={X} size={22} />
          </IconButton>
          {state.phase !== 'closing' && <ProgressDots count={STEP_COUNT} current={progressIndex(state)} label={ar.live.progress(progressIndex(state) + 1, STEP_COUNT)} />}
          <IconButton label={ar.live.share} onClick={() => openShare(dua.id)} className="-me-2.5">
            <Icon as={Share2} size={22} />
          </IconButton>
        </div>

        {state.phase === 'step' && step && (
          <StepView
            dua={dua}
            step={step}
            sentences={sentences[state.step]}
            state={state}
            canNext={canGoNext(state)}
            onShowAll={() => dispatch({ type: 'showAll' })}
            onNext={next}
          />
        )}
        {state.phase === 'intention' && (
          <IntentionView
            value={state.intention}
            onChange={(v) => dispatch({ type: 'intention', value: v })}
            onSkip={() => {
              dispatch({ type: 'intention', value: null });
              dispatch({ type: 'toNotebook' });
            }}
            onContinue={() => dispatch({ type: 'toNotebook' })}
          />
        )}
        {state.phase === 'notebook' && (
          <NotebookView
            dua={dua}
            initial={draft?.notebookText ?? ''}
            onDraft={(t) => saveDraft(dua.id, { notebookText: t })}
            onType={onType}
            onSave={(t) => {
              if (t.trim()) addNote(t, dua.id);
              saveDraft(dua.id, { notebookText: '' });
              textRef.current = '';
              dispatch({ type: 'toNeed' });
            }}
            onFinish={() => {
              textRef.current = '';
              dispatch({ type: 'toNeed' });
            }}
          />
        )}
        {state.phase === 'need' && (
          <NeedView
            initial={draft?.needText ?? ''}
            onDraft={(t) => saveDraft(dua.id, { needText: t })}
            onType={onType}
            onAdd={(t) => {
              addMyDua(t);
              saveDraft(dua.id, { needText: '' });
              textRef.current = '';
              toast(ar.live.needAdded);
              dispatch({ type: 'toClosing' });
            }}
            onSkip={() => {
              textRef.current = '';
              dispatch({ type: 'toClosing' });
            }}
          />
        )}
        {state.phase === 'closing' && <ClosingView />}
      </div>

      {confirming && (
        <Dialog
          title={ar.live.confirmTitle}
          onClose={() => setConfirming(false)}
          actions={
            <>
              <Button block onClick={() => setConfirming(false)}>
                {ar.live.confirmStay}
              </Button>
              <Button variant="secondary" block onClick={leave}>
                {ar.live.confirmLeave}
              </Button>
            </>
          }
        >
          <p className="m-0 text-t-body text-body">{ar.live.confirmBody}</p>
        </Dialog>
      )}
    </div>,
    document.body,
  );
}
