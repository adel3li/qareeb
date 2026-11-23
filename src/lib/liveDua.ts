import type { Intention } from '../content/types';

/**
 * «عِش الدعاء» as an explicit state machine:
 * step 0..4 → intention → notebook → myDua → closing.
 *
 * Within a step, sentences are revealed one at a time by a single timer (the component
 * dispatches `tick` every pace interval). «التالي» is available once every sentence is
 * shown or the step's duration has passed, whichever comes first. «أظهر النص كاملًا»
 * shows everything and stops the timer for that step; nothing hides text again.
 */

export type Phase = 'step' | 'intention' | 'notebook' | 'myDua' | 'closing';

export interface LiveState {
  phase: Phase;
  /** Current step, 0..stepCount-1, while phase is 'step'. */
  step: number;
  stepCount: number;
  /** Sentences of the current step. */
  total: number;
  /** Sentences shown so far (at least one). */
  revealed: number;
  /** Milliseconds of the step elapsed by ticks. */
  elapsed: number;
  /** The step's duration in ms. */
  duration: number;
  /** «أظهر النص كاملًا» was used in this step. */
  fullShown: boolean;
  intention: Intention | null;
}

export type LiveAction =
  | { type: 'tick'; ms: number }
  | { type: 'showAll' }
  | { type: 'next'; nextTotal?: number; nextDuration?: number }
  | { type: 'setIntention'; intention: Intention | null }
  | { type: 'toNotebook' }
  | { type: 'toMyDua' }
  | { type: 'toClosing' };

export function initLive({ stepCount, total, duration, intention = null }: { stepCount: number; total: number; duration: number; intention?: Intention | null }): LiveState {
  return { phase: 'step', step: 0, stepCount, total: Math.max(1, total), revealed: 1, elapsed: 0, duration, fullShown: false, intention };
}

export function allShown(s: LiveState): boolean {
  return s.revealed >= s.total;
}

/** «التالي» is enabled. */
export function canAdvance(s: LiveState): boolean {
  return s.phase !== 'step' || allShown(s) || s.elapsed >= s.duration;
}

/** The pacing timer should keep running. */
export function isPacing(s: LiveState): boolean {
  return s.phase === 'step' && !s.fullShown && (!allShown(s) || s.elapsed < s.duration);
}

export function liveReducer(s: LiveState, a: LiveAction): LiveState {
  switch (a.type) {
    case 'tick':
      if (!isPacing(s)) return s;
      return { ...s, revealed: Math.min(s.total, s.revealed + 1), elapsed: s.elapsed + a.ms };
    case 'showAll':
      if (s.phase !== 'step') return s;
      return { ...s, revealed: s.total, fullShown: true };
    case 'next':
      if (s.phase !== 'step' || !canAdvance(s)) return s;
      if (s.step + 1 < s.stepCount) {
        return { ...s, step: s.step + 1, total: Math.max(1, a.nextTotal ?? 1), revealed: 1, elapsed: 0, duration: a.nextDuration ?? 0, fullShown: false };
      }
      return { ...s, phase: 'intention' };
    case 'setIntention':
      return { ...s, intention: a.intention };
    case 'toNotebook':
      return s.phase === 'intention' ? { ...s, phase: 'notebook' } : s;
    case 'toMyDua':
      return s.phase === 'notebook' ? { ...s, phase: 'myDua' } : s;
    case 'toClosing':
      return s.phase === 'myDua' || s.phase === 'notebook' ? { ...s, phase: 'closing' } : s;
  }
}
