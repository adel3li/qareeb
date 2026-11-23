import { useSyncExternalStore } from 'react';
import { parseRoute, type Route } from './routes';

/** Pages visited inside the app this session, so «رجوع» never leaves the app. */
let depth = 0;
if (typeof window !== 'undefined') window.addEventListener('hashchange', () => (depth += 1));

function subscribe(cb: () => void) {
  window.addEventListener('hashchange', cb);
  return () => window.removeEventListener('hashchange', cb);
}

export function useRoute(): Route {
  const hash = useSyncExternalStore(subscribe, () => window.location.hash);
  return parseRoute(hash);
}

export function navigate(hash: string): void {
  if (window.location.hash === hash) return;
  window.location.hash = hash;
}

/** Back to the previous page in the app, or to a fallback when the page was opened directly. */
export function goBack(fallback: string): void {
  if (depth > 0) {
    depth -= 2;
    window.history.back();
  } else navigate(fallback);
}
