import { Share2, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { ConfirmDialog, Dialog } from '../../components/Dialog';
import { IconButton } from '../../components/IconButton';
import { ProgressDots } from '../../components/ProgressDots';
import { ar } from '../../copy/ar';
import { findDua, useContent } from '../../content/load';
import type { Dua, Intention } from '../../content/types';
import { splitSentences } from '../../lib/arabicSearch';
import { toLocalDateString } from '../../lib/dates';
import { canAdvance, initLive, isPacing, liveReducer } from '../../lib/liveDua';
import { hasPlaceholder } from '../../lib/placeholders';
import { useCompletions, useDrafts, useMyDuas, useNotebook, useWelcome } from '../../state/stores';
import { useUi } from '../../state/ui';
import { ClosingScreen, IntentionScreen, MyDuaScreen, NotebookScreen } from './AfterSteps';
import { StepScreen } from './StepScreen';
import { useStepTimer } from './useStepTimer';

/** «عِش الدعاء»: a full screen over the app, through the shared Dialog. */
export default function LiveDua() {
  const live = useUi((s) => s.live);
  const content = useContent();
  const dua = live && content ? findDua(content, live.duaId) : undefined;
  if (!live || !dua) return null;
  return <LiveFlow dua={dua} recordDay={live.recordDay} welcome={live.welcome} />;
}

function sourcedIntention(dua: Dua): Intention | null {
  const w = dua.whenToSay;
  return w?.intention && !hasPlaceholder(w.text) ? w.intention : null;
}

function LiveFlow({ dua, recordDay, welcome }: { dua: Dua; recordDay: string | null; welcome: boolean }) {
  const close = useUi((s) => s.closeLive);
  const openShare = useUi((s) => s.openShare);
  const shareOpen = useUi((s) => s.shareDuaId !== null);
  const announce = useUi((s) => s.announce);
  const complete = useCompletions((s) => s.complete);
  const markWelcome = useWelcome((s) => s.markDone);
  const addEntry = useNotebook((s) => s.add);
  const addNeed = useMyDuas((s) => s.add);
  const draft = useDrafts((s) => s.byDua[dua.id]);
  const saveDraft = useDrafts((s) => s.saveNotebookDraft);
  const clearDraft = useDrafts((s) => s.clear);

  const sentencesByStep = useMemo(() => dua.steps.map((s) => splitSentences(s.text)), [dua]);
  const [state, dispatch] = useReducer(liveReducer, undefined, () =>
    initLive({
      stepCount: dua.steps.length,
      total: sentencesByStep[0]?.length ?? 1,
      duration: (dua.steps[0]?.durationSec ?? 10) * 1000,
      intention: sourcedIntention(dua),
    }),
  );

  const tick = useCallback((ms: number) => dispatch({ type: 'tick', ms }), []);
  useStepTimer(isPacing(state), `${state.phase}-${state.step}`, tick);

  // Journal text, restored from a draft and saved as a draft 500ms after the last key.
  const [text, setText] = useState(draft?.notebookText ?? '');
  const restored = useRef(Boolean(draft?.notebookText)).current;
  useEffect(() => {
    const t = setTimeout(() => saveDraft(dua.id, text), 500);
    return () => clearTimeout(t);
  }, [text, dua.id, saveDraft]);

  const [confirming, setConfirming] = useState(false);
  const recorded = useRef(false);

  const finish = useCallback(() => {
    if (recorded.current) return;
    recorded.current = true;
    if (recordDay) {
      complete({ date: recordDay, duaId: dua.id, intention: state.intention ?? undefined });
      if (welcome) markWelcome(recordDay);
    }
    dispatch({ type: 'toClosing' });
  }, [recordDay, complete, dua.id, state.intention, welcome, markWelcome]);

  const requestClose = () => {
    if (state.phase === 'closing') return close();
    if (text.trim()) setConfirming(true);
    else close();
  };

  const next = () => {
    const nextIndex = state.step + 1;
    dispatch({ type: 'next', nextTotal: sentencesByStep[nextIndex]?.length, nextDuration: (dua.steps[nextIndex]?.durationSec ?? 0) * 1000 });
  };

  const saveEntry = () => {
    if (!text.trim()) return;
    addEntry({ date: recordDay ?? toLocalDateString(), duaId: dua.id, text: text.trim() });
    clearDraft(dua.id);
    setText('');
    dispatch({ type: 'toMyDua' });
  };

  const step = dua.steps[state.step];
  return (
    <Dialog open onClose={requestClose} title={ar.live.dialogLabel} variant="screen" suspended={shareOpen || confirming} focusKey={`${state.phase}-${state.step}`}>
      <div className="mx-auto flex min-h-full w-full max-w-(--content-max) flex-1 flex-col px-6 pt-[max(8px,env(safe-area-inset-top))] pb-[calc(20px+env(safe-area-inset-bottom))]">
        <div className="flex items-center justify-between">
          <IconButton icon={X} label={ar.live.close} onClick={requestClose} size="lg" tone="text" />
          {state.phase === 'step' ? <ProgressDots count={dua.steps.length} current={state.step} /> : <span />}
          <IconButton icon={Share2} label={ar.live.share} onClick={() => openShare(dua.id)} size="lg" />
        </div>
        <div className="flex flex-1 flex-col pt-2">
          {state.phase === 'step' && step && (
            <StepScreen
              key={state.step}
              dua={dua}
              step={step}
              index={state.step}
              count={dua.steps.length}
              sentences={sentencesByStep[state.step]}
              revealed={state.revealed}
              canNext={canAdvance(state)}
              fullShown={state.fullShown}
              onShowAll={() => dispatch({ type: 'showAll' })}
              onNext={next}
            />
          )}
          {state.phase === 'intention' && (
            <IntentionScreen dua={dua} value={state.intention} onChange={(intention) => dispatch({ type: 'setIntention', intention })} onDone={() => dispatch({ type: 'toNotebook' })} />
          )}
          {state.phase === 'notebook' && (
            <NotebookScreen dua={dua} text={text} restored={restored} onChange={setText} onSave={saveEntry} onFinish={() => dispatch({ type: 'toMyDua' })} />
          )}
          {state.phase === 'myDua' && (
            <MyDuaScreen
              onAdd={(need) => {
                addNeed({ text: need });
                announce(ar.live.myDua.added);
                finish();
              }}
              onSkip={finish}
            />
          )}
          {state.phase === 'closing' && <ClosingScreen onDone={close} />}
        </div>
      </div>
      <ConfirmDialog
        open={confirming}
        title={ar.live.confirmClose.title}
        body={ar.live.confirmClose.body}
        confirmLabel={ar.live.confirmClose.leave}
        cancelLabel={ar.live.confirmClose.stay}
        danger={false}
        onConfirm={() => {
          setConfirming(false);
          close();
        }}
        onCancel={() => setConfirming(false)}
      />
    </Dialog>
  );
}
