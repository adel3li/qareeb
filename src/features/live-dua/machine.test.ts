import { describe, expect, it } from 'vitest';
import { canGoNext, initialState, isPacing, PACE_MS, reducer, type LiveState } from './machine';

const run = (s: LiveState, ...actions: Parameters<typeof reducer>[1][]) => actions.reduce(reducer, s);

describe('live-dua machine', () => {
  it('reveals one sentence per tick and waits for «التالي»', () => {
    let s = initialState(3, 20);
    expect(s.revealed).toBe(1);
    expect(canGoNext(s)).toBe(false);
    s = run(s, { type: 'next' });
    expect(s.step).toBe(0);
    s = run(s, { type: 'tick' }, { type: 'tick' });
    expect(s.revealed).toBe(3);
    expect(canGoNext(s)).toBe(true);
  });

  it('allows «التالي» when the duration passes before every sentence is shown', () => {
    let s = initialState(10, 8);
    s = run(s, { type: 'tick' }, { type: 'tick' }, { type: 'tick' });
    expect(s.elapsed).toBe(3 * PACE_MS);
    expect(s.revealed).toBe(4);
    expect(canGoNext(s)).toBe(true);
    expect(isPacing(s)).toBe(true); // keeps revealing the rest
  });

  it('«أظهر النص كاملًا» shows everything, stops the timer, and nothing hides text again', () => {
    let s = initialState(4, 20);
    s = run(s, { type: 'showAll' });
    expect(s.revealed).toBe(4);
    expect(isPacing(s)).toBe(false);
    s = run(s, { type: 'tick' }, { type: 'tick' });
    expect(s.revealed).toBe(4);
    expect(canGoNext(s)).toBe(true);
  });

  it('goes through five steps, then intention, notebook, need, closing', () => {
    let s = initialState(1, 10);
    for (let i = 0; i < 4; i++) s = run(s, { type: 'showAll' }, { type: 'next', nextTotal: 2, nextDuration: 15 });
    expect(s.step).toBe(4);
    expect(s.revealed).toBe(1);
    expect(s.showAll).toBe(false);
    s = run(s, { type: 'showAll' }, { type: 'next' });
    expect(s.phase).toBe('intention');
    s = run(s, { type: 'intention', value: 'sujood' }, { type: 'toNotebook' }, { type: 'toNeed' }, { type: 'toClosing' });
    expect(s.phase).toBe('closing');
    expect(s.intention).toBe('sujood');
  });

  it('ignores actions out of order', () => {
    const s = initialState(1, 10);
    expect(run(s, { type: 'toClosing' }, { type: 'intention', value: 'now' })).toEqual(s);
  });
});
