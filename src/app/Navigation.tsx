import { BookOpen, Calendar, PenLine, Settings, Sunrise, type LucideIcon } from 'lucide-react';
import type { MouseEvent } from 'react';
import { Icon } from '../components/Icon';
import { IconButton } from '../components/IconButton';
import { Wordmark } from '../components/Wordmark';
import { ar } from '../copy/ar';
import { hrefOf, navigate, TABS, type TabName } from './router';

const ICONS: Record<TabName, LucideIcon> = { today: Sunrise, library: BookOpen, notebook: PenLine, calendar: Calendar };

function onLink(e: MouseEvent<HTMLAnchorElement>, tab: TabName) {
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
  e.preventDefault();
  navigate({ name: tab });
}

/** The four tabs at the bottom of a phone screen. */
export function TabBar({ current }: { current: TabName | null }) {
  return (
    <nav aria-label={ar.nav.mainNav} className="sticky bottom-0 z-30 border-0 border-t border-solid border-hairline bg-raised md:hidden">
      <ul className="m-0 flex list-none px-2 pt-1.5 pb-[calc(20px+env(safe-area-inset-bottom,0px))]">
        {TABS.map((tab) => {
          const on = tab === current;
          return (
            <li key={tab} className="flex-1">
              <a
                href={hrefOf({ name: tab })}
                onClick={(e) => onLink(e, tab)}
                aria-current={on ? 'page' : undefined}
                className={`flex min-h-14 flex-col items-center justify-center gap-1 text-t-tab no-underline ${on ? 'font-bold text-ink' : 'text-muted'}`}
              >
                <span className={`flex h-[30px] w-14 items-center justify-center rounded-pill ${on ? 'bg-sunken' : ''}`}>
                  <Icon as={ICONS[tab]} size={22} />
                </span>
                {ar.tabs[tab]}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** At 768px and wider the tabs move into the top bar, with the wordmark and settings. */
export function WideHeader({ current, settingsOpen }: { current: TabName | null; settingsOpen: boolean }) {
  return (
    <header className="sticky top-0 z-30 hidden bg-page md:block">
      <div className="mx-auto flex max-w-[760px] items-center gap-6 px-gutter py-3">
        <a href={hrefOf({ name: 'today' })} onClick={(e) => onLink(e, 'today')} className="text-ink">
          <Wordmark className="h-8" />
        </a>
        <nav aria-label={ar.nav.mainNav} className="flex-1">
          <ul className="m-0 flex list-none gap-1 p-0">
            {TABS.map((tab) => {
              const on = tab === current;
              return (
                <li key={tab}>
                  <a
                    href={hrefOf({ name: tab })}
                    onClick={(e) => onLink(e, tab)}
                    aria-current={on ? 'page' : undefined}
                    className={`flex min-h-touch items-center gap-2 rounded-pill px-4 text-t-body-sm no-underline ${on ? 'bg-sunken font-bold text-ink' : 'font-semibold text-muted'}`}
                  >
                    <Icon as={ICONS[tab]} size={22} />
                    {ar.tabs[tab]}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
        <IconButton label={ar.nav.settings} pressed={undefined} tone={settingsOpen ? 'ink' : 'muted'} onClick={() => navigate({ name: 'settings' })}>
          <Icon as={Settings} size={22} />
        </IconButton>
      </div>
    </header>
  );
}
