import { describe, expect, it } from 'vitest';
import { allShown, canAdvance, flowReducer, initialFlow, type FlowState } from './liveFlow';

describe('the guided flow', () => {
  it('reveals one sentence per tick and waits for the text or the time', () => {
    let s = initialFlow(3);
    expect(s.revealed).toBe(1);
    expect(canAdvance(s)).toBe(false);
    expect(flowReducer(s, { type: 'NEXT', nextTotal: 2 })).toBe(s);
    s = flowReducer(s, { type: 'TICK' });
    s = flowReducer(s, { type: 'TICK' });
    expect(s.revealed).toBe(3);
    expect(canAdvance(s)).toBe(true);
    expect(flowReducer(s, { type: 'TICK' })).toBe(s);
  });

  it('enables «التالي» when the step’s time is up', () => {
    const s = flowReducer(initialFlow(4), { type: 'TIME_UP' });
    expect(allShown(s)).toBe(false);
    expect(canAdvance(s)).toBe(true);
  });

  it('shows the whole text and never hides it again', () => {
    let s = flowReducer(initialFlow(4), { type: 'SHOW_ALL' });
    expect(s.revealed).toBe(4);
    s = flowReducer(s, { type: 'TICK' });
    s = flowReducer(s, { type: 'TIME_UP' });
    expect(s.revealed).toBe(4);
    expect(s.showAll).toBe(true);
  });

  it('goes through five steps, then intention, journal, need and closing', () => {
    let s: FlowState = initialFlow(1);
    for (let i = 1; i < 5; i++) {
      s = flowReducer(s, { type: 'NEXT', nextTotal: 2 });
      expect(s).toMatchObject({ phase: 'step', stepIndex: i, revealed: 1, total: 2, showAll: false, timeUp: false });
      s = flowReducer(s, { type: 'SHOW_ALL' });
    }
    s = flowReducer(s, { type: 'NEXT' });
    expect(s.phase).toBe('intention');
    s = flowReducer(s, { type: 'TO_PHASE', phase: 'journal' });
    s = flowReducer(s, { type: 'TO_PHASE', phase: 'myDua' });
    s = flowReducer(s, { type: 'TO_PHASE', phase: 'closing' });
    expect(s.phase).toBe('closing');
  });
});
