import type { Intention } from '../../state/shapes';

/**
 * «عِش الدعاء» as an explicit state machine (05 §9):
 *   step 0..4 → intention → notebook → need → closing
 * Each step reveals its sentences one per pace tick. «التالي» is available once
 * every sentence is shown or the step's duration has passed, whichever is first.
 * «أظهر النص كاملًا» shows everything and stops the pacing; nothing ever hides text again.
 */

export const PACE_MS = 2800;
export const STEP_COUNT = 5;

export type Phase = 'step' | 'intention' | 'notebook' | 'need' | 'closing';

export interface LiveState {
  phase: Phase;
  step: number;
  /** Sentences shown in the current step (at least 1). */
  revealed: number;
  /** Sentences in the current step. */
  total: number;
  /** Milliseconds paced in the current step. */
  elapsed: number;
  /** The step's duration in milliseconds. */
  duration: number;
  showAll: boolean;
  intention: Intention | null;
}

export type LiveAction =
  | { type: 'tick' }
  | { type: 'showAll' }
  | { type: 'next'; nextTotal?: number; nextDuration?: number }
  | { type: 'intention'; value: Intention | null }
  | { type: 'toNotebook' }
  | { type: 'toNeed' }
  | { type: 'toClosing' };

export function initialState(total: number, durationSec: number): LiveState {
  return { phase: 'step', step: 0, revealed: Math.min(1, total), total, elapsed: 0, duration: durationSec * 1000, showAll: false, intention: null };
}

export function canGoNext(s: LiveState): boolean {
  return s.phase !== 'step' || s.revealed >= s.total || s.elapsed >= s.duration;
}

/** Whether the pace timer should be running. */
export function isPacing(s: LiveState): boolean {
  return s.phase === 'step' && !s.showAll && (s.revealed < s.total || s.elapsed < s.duration);
}

export function reducer(s: LiveState, a: LiveAction): LiveState {
  switch (a.type) {
    case 'tick':
      if (!isPacing(s)) return s;
      return { ...s, revealed: Math.min(s.total, s.revealed + 1), elapsed: s.elapsed + PACE_MS };
    case 'showAll':
      if (s.phase !== 'step') return s;
      return { ...s, revealed: s.total, showAll: true };
    case 'next':
      if (s.phase !== 'step' || !canGoNext(s)) return s;
      if (s.step < STEP_COUNT - 1) {
        const total = a.nextTotal ?? 1;
        return { ...s, step: s.step + 1, revealed: Math.min(1, total), total, elapsed: 0, duration: (a.nextDuration ?? 0) * 1000, showAll: false };
      }
      return { ...s, phase: 'intention' };
    case 'intention':
      return s.phase === 'intention' ? { ...s, intention: a.value } : s;
    case 'toNotebook':
      return s.phase === 'intention' ? { ...s, phase: 'notebook' } : s;
    case 'toNeed':
      return s.phase === 'notebook' ? { ...s, phase: 'need' } : s;
    case 'toClosing':
      return s.phase === 'need' ? { ...s, phase: 'closing' } : s;
  }
}

/** The dots: five steps, then the last dot stays current through the after-steps. */
export function progressIndex(s: LiveState): number {
  return s.phase === 'step' ? s.step : STEP_COUNT - 1;
}
