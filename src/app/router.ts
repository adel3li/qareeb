import { useSyncExternalStore } from 'react';

/**
 * Hash routes: #/today, #/library, #/notebook, #/calendar, #/settings, #/dua/:id.
 * Reloading keeps the screen; anything unknown goes to Today.
 */
export type Route =
  | { name: 'today' }
  | { name: 'library' }
  | { name: 'notebook' }
  | { name: 'calendar' }
  | { name: 'settings' }
  | { name: 'dua'; id: string };

export function parseHash(hash: string): Route {
  const path = hash.replace(/^#\/?/, '').split('?')[0];
  const [head, arg] = path.split('/');
  switch (head) {
    case 'library':
    case 'notebook':
    case 'calendar':
    case 'settings':
      return { name: head };
    case 'dua':
      return arg && /^dua_\d{4}$/.test(arg) ? { name: 'dua', id: arg } : { name: 'library' };
    default:
      return { name: 'today' };
  }
}

export function hrefOf(route: Route): string {
  return route.name === 'dua' ? `#/dua/${route.id}` : `#/${route.name}`;
}

function subscribe(cb: () => void) {
  window.addEventListener('hashchange', cb);
  return () => window.removeEventListener('hashchange', cb);
}

let cachedHash = '';
let cachedRoute: Route = { name: 'today' };
function snapshot(): Route {
  if (location.hash !== cachedHash) {
    cachedHash = location.hash;
    cachedRoute = parseHash(location.hash);
  }
  return cachedRoute;
}

export function useRoute(): Route {
  return useSyncExternalStore(subscribe, snapshot, () => cachedRoute);
}

export function navigate(route: Route): void {
  location.hash = hrefOf(route);
}

let inAppSteps = 0;
if (typeof window !== 'undefined') window.addEventListener('hashchange', () => (inAppSteps += 1));

/** Back from a pushed screen: history when the user came from inside the app, else the fallback. */
export function goBack(fallback: Route = { name: 'today' }): void {
  if (inAppSteps > 0) {
    inAppSteps -= 2;
    history.back();
  } else navigate(fallback);
}
