/**
 * «عِش الدعاء» as an explicit state machine (blueprint §9):
 * step(0..4) → intention → journal → myDua → closing.
 * Pure: the component owns one timer per step and dispatches TICK and
 * TIME_UP; «أظهر النص كاملًا» stops the pacing and nothing ever hides text again.
 */

export type Phase = 'step' | 'intention' | 'journal' | 'myDua' | 'closing';

export interface FlowState {
  phase: Phase;
  /** 0..4 while phase is 'step'. */
  stepIndex: number;
  /** Sentences of the current step shown so far (at least 1). */
  revealed: number;
  /** Sentences in the current step. */
  total: number;
  /** The step's duration has passed. */
  timeUp: boolean;
  /** «أظهر النص كاملًا» was pressed for this step. */
  showAll: boolean;
}

export type FlowAction =
  | { type: 'TICK' }
  | { type: 'TIME_UP' }
  | { type: 'SHOW_ALL' }
  | { type: 'NEXT'; nextTotal?: number }
  | { type: 'TO_PHASE'; phase: Exclude<Phase, 'step'> };

export const STEP_COUNT = 5;

export function initialFlow(firstStepSentences: number): FlowState {
  return { phase: 'step', stepIndex: 0, revealed: Math.min(1, firstStepSentences), total: firstStepSentences, timeUp: false, showAll: false };
}

/** All of the step's text is visible. */
export function allShown(s: FlowState): boolean {
  return s.showAll || s.revealed >= s.total;
}

/** «التالي» is enabled once every sentence is shown or the step's time has passed. */
export function canAdvance(s: FlowState): boolean {
  return s.phase !== 'step' || allShown(s) || s.timeUp;
}

export function flowReducer(s: FlowState, a: FlowAction): FlowState {
  switch (a.type) {
    case 'TICK':
      if (s.phase !== 'step' || allShown(s)) return s;
      return { ...s, revealed: s.revealed + 1 };
    case 'TIME_UP':
      if (s.phase !== 'step' || s.timeUp) return s;
      return { ...s, timeUp: true };
    case 'SHOW_ALL':
      if (s.phase !== 'step') return s;
      return { ...s, showAll: true, revealed: s.total };
    case 'NEXT': {
      if (s.phase !== 'step') return s;
      if (!canAdvance(s)) return s;
      if (s.stepIndex < STEP_COUNT - 1) {
        const total = a.nextTotal ?? 1;
        return { phase: 'step', stepIndex: s.stepIndex + 1, revealed: Math.min(1, total), total, timeUp: false, showAll: false };
      }
      return { ...s, phase: 'intention' };
    }
    case 'TO_PHASE':
      return { ...s, phase: a.phase };
  }
}
