/** Hash routes: every tab has an address, and every dua has one that share links open. */
export type Route =
  | { name: 'today' }
  | { name: 'library' }
  | { name: 'notebook'; view: 'found' | 'my-duas' }
  | { name: 'calendar' }
  | { name: 'settings' }
  | { name: 'dua'; id: string };

export type TabName = 'today' | 'library' | 'notebook' | 'calendar';

export function parseRoute(hash: string): Route {
  const path = hash.replace(/^#/, '').replace(/^\/+/, '').split('?')[0];
  const [head, arg] = path.split('/');
  switch (head) {
    case 'library':
      return { name: 'library' };
    case 'notebook':
      return { name: 'notebook', view: arg === 'my-duas' ? 'my-duas' : 'found' };
    case 'calendar':
      return { name: 'calendar' };
    case 'settings':
      return { name: 'settings' };
    case 'dua':
      return arg ? { name: 'dua', id: decodeURIComponent(arg) } : { name: 'library' };
    default:
      return { name: 'today' };
  }
}

export function href(route: Route): string {
  switch (route.name) {
    case 'notebook':
      return route.view === 'my-duas' ? '#/notebook/my-duas' : '#/notebook';
    case 'dua':
      return `#/dua/${encodeURIComponent(route.id)}`;
    default:
      return `#/${route.name}`;
  }
}

/** The tab a route belongs to (a dua page belongs to the library). */
export function tabOf(route: Route): TabName | null {
  if (route.name === 'dua') return 'library';
  if (route.name === 'settings') return null;
  return route.name;
}
