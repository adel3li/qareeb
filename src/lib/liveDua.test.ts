import { describe, expect, it } from 'vitest';
import { canAdvance, initLive, isPacing, liveReducer, type LiveState } from './liveDua';

const start = () => initLive({ stepCount: 5, total: 3, duration: 20_000 });
const run = (s: LiveState, ...actions: Parameters<typeof liveReducer>[1][]) => actions.reduce(liveReducer, s);

describe('liveReducer', () => {
  it('shows the first sentence at once and waits before «التالي»', () => {
    const s = start();
    expect(s.revealed).toBe(1);
    expect(canAdvance(s)).toBe(false);
    expect(liveReducer(s, { type: 'next' })).toBe(s);
  });

  it('reveals one sentence per tick, then allows «التالي»', () => {
    const s = run(start(), { type: 'tick', ms: 2800 }, { type: 'tick', ms: 2800 });
    expect(s.revealed).toBe(3);
    expect(canAdvance(s)).toBe(true);
  });

  it('allows «التالي» when the duration has passed, whichever comes first', () => {
    let s = initLive({ stepCount: 5, total: 10, duration: 5000 });
    s = run(s, { type: 'tick', ms: 2800 }, { type: 'tick', ms: 2800 });
    expect(s.revealed).toBe(3);
    expect(canAdvance(s)).toBe(true);
  });

  it('«أظهر النص كاملًا» shows everything and stops the timer; ticks never hide text', () => {
    let s = liveReducer(start(), { type: 'showAll' });
    expect(s.revealed).toBe(3);
    expect(isPacing(s)).toBe(false);
    s = run(s, { type: 'tick', ms: 2800 }, { type: 'tick', ms: 2800 });
    expect(s.revealed).toBe(3);
    expect(canAdvance(s)).toBe(true);
  });

  it('walks the five steps, then intention, notebook, my duas and closing', () => {
    let s = start();
    for (let i = 0; i < 5; i++) {
      expect(s.phase).toBe('step');
      expect(s.step).toBe(i);
      s = run(s, { type: 'showAll' }, { type: 'next', nextTotal: 2, nextDuration: 10_000 });
    }
    expect(s.phase).toBe('intention');
    s = run(s, { type: 'setIntention', intention: 'sujood' }, { type: 'toNotebook' }, { type: 'toMyDua' }, { type: 'toClosing' });
    expect(s).toMatchObject({ phase: 'closing', intention: 'sujood' });
  });

  it('resets reveal and the full-text flag on the next step', () => {
    const s = run(start(), { type: 'showAll' }, { type: 'next', nextTotal: 4, nextDuration: 15_000 });
    expect(s).toMatchObject({ step: 1, total: 4, revealed: 1, fullShown: false, elapsed: 0 });
  });

  it('ignores phase jumps out of order', () => {
    const s = start();
    expect(liveReducer(s, { type: 'toClosing' })).toBe(s);
    expect(liveReducer(s, { type: 'toNotebook' })).toBe(s);
  });
});
