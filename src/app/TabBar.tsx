import { BookOpen, Calendar, PenLine, Settings, Sunrise, type LucideIcon } from 'lucide-react';
import { ar } from '../copy/ar';
import { Icon } from '../components/Icon';
import { Wordmark } from '../components/Wordmark';
import { IconButton } from '../components/IconButton';
import type { TabName } from './routes';
import { navigate } from './useRoute';

const TABS: { name: TabName; icon: LucideIcon; label: string }[] = [
  { name: 'today', icon: Sunrise, label: ar.tabs.today },
  { name: 'library', icon: BookOpen, label: ar.tabs.library },
  { name: 'notebook', icon: PenLine, label: ar.tabs.notebook },
  { name: 'calendar', icon: Calendar, label: ar.tabs.calendar },
];

/** The four sections at the bottom of the phone screen. Hidden at 768px and wider. */
export function TabBar({ current }: { current: TabName | null }) {
  return (
    <nav aria-label={ar.tabs.nav} className="fixed inset-x-0 bottom-0 z-30 border-t border-solid border-hairline bg-surface-raised wide:hidden">
      <ul className="m-0 flex list-none px-2 pt-1.5 pb-[calc(20px+env(safe-area-inset-bottom,0px))]">
        {TABS.map((t) => {
          const on = t.name === current;
          return (
            <li key={t.name} className="flex-1">
              <a
                href={`#/${t.name}`}
                aria-current={on ? 'page' : undefined}
                className={`flex min-h-14 flex-col items-center justify-center gap-1 text-t-tab no-underline ${on ? 'font-bold text-text' : 'font-semibold text-text-muted'}`}
              >
                <span className={`flex h-[30px] w-14 items-center justify-center rounded-pill ${on ? 'bg-surface-sunken' : ''}`}>
                  <Icon icon={t.icon} size="lg" />
                </span>
                {t.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** At 768px and wider the tabs move into the top bar, with the wordmark and the settings button. */
export function WideHeader({ current }: { current: TabName | null }) {
  return (
    <header className="mx-auto hidden w-full max-w-[1040px] items-center justify-between gap-4 px-6 pt-5 wide:flex">
      <a href="#/today" className="text-text" aria-label={ar.app.name}>
        <Wordmark className="h-[34px]" />
      </a>
      <nav aria-label={ar.tabs.nav}>
        <ul className="m-0 flex list-none gap-1 p-0">
          {TABS.map((t) => {
            const on = t.name === current;
            return (
              <li key={t.name}>
                <a
                  href={`#/${t.name}`}
                  aria-current={on ? 'page' : undefined}
                  className={`flex min-h-touch items-center gap-2 rounded-pill px-4 text-t-body no-underline ${on ? 'bg-surface-sunken font-bold text-text' : 'font-semibold text-text-muted'}`}
                >
                  <Icon icon={t.icon} size="lg" />
                  {t.label}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
      <IconButton icon={Settings} label={ar.common.settings} size="lg" onClick={() => navigate('#/settings')} />
    </header>
  );
}
