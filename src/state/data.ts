import type { BackupData } from '../lib/backup';
import { isOwnKey } from './keys';
import { useCompletions, useDrafts, useFavorites, useMyDuas, useNotebook, useOnboarding, useSettings, useWelcome } from './store';
import { DEFAULT_SETTINGS } from './schemas';

/** Everything the user made, for the backup file. */
export function snapshot(): BackupData {
  const s = useSettings.getState();
  return {
    settings: { theme: s.theme, fontScale: s.fontScale, showMyDuasInFlow: s.showMyDuasInFlow },
    onboardingCompletedAt: useOnboarding.getState().completedAt,
    welcomeDoneOn: useWelcome.getState().doneOn,
    completions: useCompletions.getState().items,
    notebook: useNotebook.getState().entries,
    myDuas: useMyDuas.getState().items,
    favorites: useFavorites.getState().ids,
  };
}

/** Replaces all data with an imported backup (after the user confirmed). */
export function restore(data: BackupData): void {
  useSettings.setState({ ...data.settings });
  useOnboarding.setState({ completedAt: data.onboardingCompletedAt });
  useWelcome.setState({ doneOn: data.welcomeDoneOn });
  useCompletions.setState({ items: [...data.completions].sort((a, b) => a.date.localeCompare(b.date)) });
  useNotebook.setState({ entries: data.notebook });
  useMyDuas.setState({ items: data.myDuas });
  useFavorites.setState({ ids: [...new Set(data.favorites)] });
  useDrafts.setState({ byDua: {} });
}

/** «امسح كل بياناتي»: removes every qareeb: key and resets the stores in memory. */
export function eraseAll(): void {
  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && isOwnKey(key)) keys.push(key);
  }
  for (const key of keys) localStorage.removeItem(key);
  const quiet = <T,>(store: { setState: (s: Partial<T>) => void; persist: { clearStorage: () => void } }, s: Partial<T>) => {
    store.setState(s);
    store.persist.clearStorage();
  };
  quiet(useSettings, { ...DEFAULT_SETTINGS });
  quiet(useOnboarding, { completedAt: null });
  quiet(useWelcome, { doneOn: null });
  quiet(useCompletions, { items: [] });
  quiet(useNotebook, { entries: [] });
  quiet(useMyDuas, { items: [] });
  quiet(useFavorites, { ids: [] });
  quiet(useDrafts, { byDua: {} });
}
