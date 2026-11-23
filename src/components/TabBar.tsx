import { BookOpen, Calendar, PenLine, Sunrise, type LucideIcon } from 'lucide-react';
import { ar } from '../copy/ar';
import { useRoute } from '../app/router';

const TABS: { href: string; name: 'today' | 'library' | 'notebook' | 'calendar'; icon: LucideIcon }[] = [
  { href: '#/today', name: 'today', icon: Sunrise },
  { href: '#/library', name: 'library', icon: BookOpen },
  { href: '#/notebook', name: 'notebook', icon: PenLine },
  { href: '#/calendar', name: 'calendar', icon: Calendar },
];

function currentTab(name: string): string {
  return name === 'dua' ? 'library' : name;
}

/** The four sections at the bottom of the phone screen. Hidden at wide widths (WideTabs takes over). */
export function TabBar() {
  const route = useRoute();
  const current = currentTab(route.name);
  return (
    <nav aria-label={ar.tabs.nav} className="fixed inset-x-0 bottom-0 z-30 border-t border-hairline bg-surface-raised px-2 pt-[6px] pb-[calc(20px+env(safe-area-inset-bottom))] wide:hidden">
      <ul className="mx-auto m-0 flex max-w-(--content-max) list-none p-0">
        {TABS.map((t) => {
          const on = current === t.name;
          return (
            <li key={t.name} className="flex-1">
              <a
                href={t.href}
                aria-current={on ? 'page' : undefined}
                className={`flex min-h-14 flex-col items-center justify-center gap-1 text-t-tab no-underline ${on ? 'font-bold text-text' : 'text-text-muted'}`}
              >
                <span className={`flex h-[30px] w-14 items-center justify-center rounded-full ${on ? 'bg-surface-sunken' : ''}`}>
                  <t.icon size={22} strokeWidth={1.75} aria-hidden="true" />
                </span>
                {ar.tabs[t.name]}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** The same four links in the top bar at 768px and wider. */
export function WideTabs() {
  const route = useRoute();
  const current = currentTab(route.name);
  return (
    <nav aria-label={ar.tabs.nav} className="hidden wide:block">
      <ul className="m-0 flex list-none gap-1 p-0">
        {TABS.map((t) => {
          const on = current === t.name;
          return (
            <li key={t.name}>
              <a
                href={t.href}
                aria-current={on ? 'page' : undefined}
                className={`flex min-h-(--touch-target) items-center gap-2 rounded-full px-4 text-t-body-sm no-underline ${on ? 'bg-surface-sunken font-bold text-text' : 'font-semibold text-text-muted'}`}
              >
                <t.icon size={20} strokeWidth={1.75} aria-hidden="true" />
                {ar.tabs[t.name]}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
