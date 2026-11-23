import { useEffect, useSyncExternalStore } from 'react';

/** Hash routes: #/today, #/library, #/notebook, #/calendar, #/settings, #/dua/:id. */
export type Route =
  | { name: 'today' }
  | { name: 'library' }
  | { name: 'notebook' }
  | { name: 'calendar' }
  | { name: 'settings' }
  | { name: 'dua'; id: string };

export type TabName = 'today' | 'library' | 'notebook' | 'calendar';
export const TABS: TabName[] = ['today', 'library', 'notebook', 'calendar'];

export function parseHash(hash: string): Route | null {
  const path = hash.replace(/^#\/?/, '').split('?')[0];
  const [head, arg] = path.split('/');
  switch (head) {
    case '':
    case 'today':
      return { name: 'today' };
    case 'library':
    case 'notebook':
    case 'calendar':
    case 'settings':
      return { name: head };
    case 'dua':
      return arg ? { name: 'dua', id: decodeURIComponent(arg) } : null;
    default:
      return null;
  }
}

export function hrefOf(route: Route): string {
  return route.name === 'dua' ? `#/dua/${encodeURIComponent(route.id)}` : `#/${route.name}`;
}

/** How many entries the user has pushed inside the app, so «رجوع» never leaves it. */
let depth = 0;
if (typeof window !== 'undefined') window.addEventListener('popstate', () => (depth = Math.max(0, depth - 1)));

export function navigate(route: Route, opts: { replace?: boolean } = {}): void {
  const href = hrefOf(route);
  if (href === window.location.hash) return;
  if (opts.replace) history.replaceState(null, '', href);
  else {
    history.pushState(null, '', href);
    depth++;
  }
  window.dispatchEvent(new HashChangeEvent('hashchange'));
}

/** Back to the previous screen inside the app, or to `fallback` when the page was opened on this address. */
export function goBack(fallback: Route): void {
  if (depth > 0) history.back();
  else navigate(fallback, { replace: true });
}

const subscribe = (cb: () => void) => {
  window.addEventListener('hashchange', cb);
  window.addEventListener('popstate', cb);
  return () => {
    window.removeEventListener('hashchange', cb);
    window.removeEventListener('popstate', cb);
  };
};

/** The current route; an unknown address is replaced by #/today. */
export function useRoute(): Route {
  const hash = useSyncExternalStore(subscribe, () => window.location.hash);
  const route = parseHash(hash);
  useEffect(() => {
    if (!route) navigate({ name: 'today' }, { replace: true });
  }, [route]);
  return route ?? { name: 'today' };
}

/** The tab a route belongs to (a dua page belongs to the library). */
export function tabOf(route: Route): TabName | null {
  if (route.name === 'dua') return 'library';
  if (route.name === 'settings') return null;
  return route.name;
}
