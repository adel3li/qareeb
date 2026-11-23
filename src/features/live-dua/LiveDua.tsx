import { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { Share2, X } from 'lucide-react';
import { ar, type IntentionKey } from '../../copy/ar';
import { useDua } from '../../content/load';
import { Dialog } from '../../components/Dialog';
import { IconButton } from '../../components/IconButton';
import { ProgressDots } from '../../components/ProgressDots';
import { Button } from '../../components/Button';
import { useToast } from '../../components/Toast';
import { splitSentences } from '../../lib/arabicSearch';
import { allShown, canAdvance, flowReducer, initialFlow, STEP_COUNT } from '../../lib/liveFlow';
import { useCompletions, useDrafts, useMyDuas, useNotebook, useWelcome } from '../../state/store';
import { useOverlays } from '../../app/overlays';
import { navigate } from '../../app/useRoute';
import { PacedStep } from './PacedStep';
import { SupplicateExtras } from './SupplicateExtras';
import { ClosingPanel, IntentionPanel, JournalPanel, MyDuaPanel } from './AfterSteps';

const PACE_MS = 2800;
const CLOSING_HOLD_MS = 2000;

interface Props {
  duaId: string;
  /** The local day the flow was opened on: what is recorded, whatever the clock says at the end. */
  day: string;
  /** Record the day at the closing (today's dua). */
  records: boolean;
  welcome: boolean;
}

/**
 * «عِش الدعاء»: five paced steps, then intention, journal, a need, and the
 * closing. Only the closing records the day, with the dua id that was shown.
 */
export default function LiveDua({ duaId, day, records, welcome }: Props) {
  const dua = useDua(duaId);
  const closeLive = useOverlays((s) => s.closeLive);
  const openShare = useOverlays((s) => s.openShare);
  const shareOpen = useOverlays((s) => s.shareDuaId !== null);
  const toast = useToast((s) => s.show);
  const draft = useDrafts((s) => s.byDua[duaId]);
  const { setDraft, clearDraft } = useDrafts.getState();

  const sentences = useMemo(() => (dua ? dua.steps.map((s) => splitSentences(s.text)) : []), [dua]);
  const [state, dispatch] = useReducer(flowReducer, sentences[0]?.length ?? 1, initialFlow);
  const [intention, setIntention] = useState<IntentionKey | null>(null);
  const [confirming, setConfirming] = useState(false);
  const unsaved = useRef({ journal: draft?.notebookText ?? '', myDua: draft?.myDuaText ?? '' });
  const added = useRef(false);

  // One timer per step: pace the sentences, and mark the step's duration as passed.
  const step = dua?.steps[state.stepIndex];
  const pacing = state.phase === 'step' && !allShown(state);
  useEffect(() => {
    if (state.phase !== 'step' || !step) return;
    const tick = pacing ? setInterval(() => dispatch({ type: 'TICK' }), PACE_MS) : undefined;
    const timeUp = setTimeout(() => dispatch({ type: 'TIME_UP' }), step.durationSec * 1000);
    return () => {
      if (tick) clearInterval(tick);
      clearTimeout(timeUp);
    };
  }, [state.phase, state.stepIndex, pacing, step]);

  // The closing: record, hold for two seconds, then back to Today.
  useEffect(() => {
    if (state.phase !== 'closing') return;
    if (records) useCompletions.getState().complete({ date: day, duaId, ...(intention ? { intention } : {}) });
    if (records && welcome) useWelcome.getState().markDone(day);
    if (added.current) toast(ar.live.myDua.added);
    const t = setTimeout(() => {
      closeLive();
      if (records) navigate('#/today');
    }, CLOSING_HOLD_MS);
    return () => clearTimeout(t);
  }, [state.phase]);

  if (!dua) return null;

  const hasUnsaved = () => (state.phase === 'journal' && unsaved.current.journal.trim() !== '') || (state.phase === 'myDua' && unsaved.current.myDua.trim() !== '');
  const requestClose = () => {
    if (state.phase === 'closing') return;
    if (hasUnsaved()) {
      // The text is already kept as a draft; make sure the last keys are in it.
      setDraft(duaId, { notebookText: unsaved.current.journal, myDuaText: unsaved.current.myDua });
      setConfirming(true);
    } else closeLive();
  };

  const sourcedIntention = dua.whenToSay?.intention ?? null;
  const stepName = step ? ar.live.steps[step.type] : '';

  return (
    <Dialog open title={ar.live.label} variant="full" onClose={requestClose} active={!confirming && !shareOpen} focusKey={`${state.phase}-${state.stepIndex}`}>
      <div className="glow mx-auto box-border flex min-h-dvh w-full max-w-content flex-col bg-page px-6 pt-3 pb-[calc(20px+env(safe-area-inset-bottom,0px))]">
        <div className="grid min-h-touch grid-cols-[1fr_auto_1fr] items-center">
          <IconButton icon={X} label={ar.live.close} tone="text" size="lg" onClick={requestClose} className="-ms-2.5 justify-self-start" />
          {state.phase === 'step' ? <ProgressDots count={STEP_COUNT} current={state.stepIndex} label={ar.live.progress(state.stepIndex + 1, STEP_COUNT)} /> : <span />}
          <IconButton icon={Share2} label={ar.card.share} size="lg" onClick={() => openShare(duaId)} className="-me-2.5 justify-self-end" />
        </div>

        <div className="flex flex-1 flex-col pt-2">
          {state.phase === 'step' && step ? (
            <PacedStep
              key={state.stepIndex}
              label={ar.live.stepLabel(state.stepIndex + 1, stepName)}
              sentences={sentences[state.stepIndex]}
              revealed={state.revealed}
              showAll={state.showAll}
              allShown={allShown(state)}
              canAdvance={canAdvance(state)}
              onShowAll={() => dispatch({ type: 'SHOW_ALL' })}
              onNext={() => dispatch({ type: 'NEXT', nextTotal: sentences[state.stepIndex + 1]?.length ?? 1 })}
              nextLabel={step.type === 'supplicate' ? ar.live.amen : ar.live.next}
              below={step.type === 'supplicate' ? <SupplicateExtras dua={dua} /> : undefined}
            />
          ) : null}

          {state.phase === 'intention' ? (
            <IntentionPanel
              initial={sourcedIntention}
              sourced={sourcedIntention !== null}
              onDone={(value) => {
                setIntention(value);
                dispatch({ type: 'TO_PHASE', phase: 'journal' });
              }}
            />
          ) : null}

          {state.phase === 'journal' ? (
            <JournalPanel
              prompt={dua.journalPrompt}
              initial={unsaved.current.journal}
              onChange={(v) => (unsaved.current.journal = v)}
              onDraft={(v) => setDraft(duaId, { notebookText: v })}
              onSave={(text) => {
                useNotebook.getState().add({ date: day, text, duaId });
                unsaved.current.journal = '';
                clearDraft(duaId, 'notebookText');
                dispatch({ type: 'TO_PHASE', phase: 'myDua' });
              }}
              onFinish={() => dispatch({ type: 'TO_PHASE', phase: 'myDua' })}
            />
          ) : null}

          {state.phase === 'myDua' ? (
            <MyDuaPanel
              initial={unsaved.current.myDua}
              onChange={(v) => (unsaved.current.myDua = v)}
              onDraft={(v) => setDraft(duaId, { myDuaText: v })}
              onAdd={(text) => {
                useMyDuas.getState().add({ text });
                unsaved.current.myDua = '';
                clearDraft(duaId, 'myDuaText');
                added.current = true;
                dispatch({ type: 'TO_PHASE', phase: 'closing' });
              }}
              onSkip={() => dispatch({ type: 'TO_PHASE', phase: 'closing' })}
            />
          ) : null}

          {state.phase === 'closing' ? <ClosingPanel /> : null}
        </div>
      </div>

      <Dialog open={confirming} title={ar.live.confirmClose.title} onClose={() => setConfirming(false)}>
        <p className="m-0 text-t-body text-text-body">{ar.live.confirmClose.body}</p>
        <Button variant="primary" block onClick={() => setConfirming(false)}>
          {ar.live.confirmClose.cancel}
        </Button>
        <Button
          variant="secondary"
          block
          onClick={() => {
            setConfirming(false);
            closeLive();
          }}
        >
          {ar.live.confirmClose.confirm}
        </Button>
      </Dialog>
    </Dialog>
  );
}
