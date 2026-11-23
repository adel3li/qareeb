import { WELCOME_DUA_ID } from '../../config';
import { useContent } from '../../content/load';
import type { Dua } from '../../content/types';
import { resolveToday } from '../../lib/daily';
import { useLocalDay } from '../../lib/dates';
import { completionOn } from '../../lib/progress';
import type { Completion } from '../../state/shapes';
import { useStored } from '../../state/store';

/**
 * Today's dua for this user: the welcome dua until it is completed (and for the
 * rest of that day), then the rotation everyone shares. Re-read at local midnight.
 */
export function useToday(): { dua: Dua | undefined; isWelcome: boolean; today: string; done: Completion | undefined } {
  const bundle = useContent();
  const today = useLocalDay();
  const welcome = useStored('welcome');
  const completions = useStored('completions');
  const { item, role } = resolveToday({ today, items: bundle.duas, welcomeId: WELCOME_DUA_ID, welcomeDoneOn: welcome.doneOn });
  const done = completionOn(completions, today);
  return { dua: item, isWelcome: role === 'welcome', today, done: done && item && done.duaId === item.id ? done : undefined };
}
