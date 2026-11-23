import { useEffect } from 'react';

/** The pace between sentences, from the design tokens (--pace-sentence, 2.8s). */
export const PACE_MS = 2800;

/**
 * One timer per step: while `running`, calls `tick` every PACE_MS. Cleared when the
 * step changes, when it stops running, and when the flow closes.
 */
export function useStepTimer(running: boolean, stepKey: string | number, tick: (ms: number) => void): void {
  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => tick(PACE_MS), PACE_MS);
    return () => clearInterval(t);
  }, [running, stepKey, tick]);
}
