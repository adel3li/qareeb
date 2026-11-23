import { WELCOME_DUA_ID } from '../config';
import { useDuas } from '../content/load';
import type { AppDua } from '../content/types';
import { resolveToday } from '../lib/daily';
import { useLocalDay } from '../lib/dates';
import { useCompletions, useWelcome } from '../state/store';
import type { Completion } from '../state/schemas';

export interface Today {
  day: string;
  dua: AppDua | undefined;
  role: 'welcome' | 'daily';
  /** Today's completion when it is for this dua. */
  completion: Completion | undefined;
}

/** Today's dua: the welcome dua until it is lived, then the rotation (src/lib/daily.ts). Rolls over at midnight. */
export function useToday(): Today {
  const day = useLocalDay();
  const duas = useDuas();
  const welcomeDoneOn = useWelcome((s) => s.doneOn);
  const todays = useCompletions((s) => s.items.find((c) => c.date === day));
  const { item, role } = resolveToday({ today: day, items: duas, welcomeId: WELCOME_DUA_ID, welcomeDoneOn });
  return { day, dua: item, role, completion: todays && item && todays.duaId === item.id ? todays : undefined };
}
