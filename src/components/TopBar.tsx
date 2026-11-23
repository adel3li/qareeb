import { ChevronRight, Settings } from 'lucide-react';
import type { ReactNode } from 'react';
import { ar } from '../copy/ar';
import { IconButton } from './IconButton';
import { Wordmark } from './Wordmark';
import { WideTabs } from './TabBar';

/** Today: wordmark and settings, then the greeting and Hijri date. */
export function TodayTopBar({ hijriDate }: { hijriDate: string }) {
  return (
    <header>
      <div className="flex items-center justify-between px-2 pt-3">
        <Wordmark className="ms-3 h-[30px] text-text" />
        <WideTabs />
        <a href="#/settings" aria-label={ar.common.settings} className="inline-flex size-(--touch-target) items-center justify-center rounded-full text-text-muted active:bg-surface-sunken">
          <Settings size={22} strokeWidth={1.75} aria-hidden="true" />
        </a>
      </div>
      <div className="px-5 pt-1">
        <p className="m-0 text-t-body-sm leading-[1.6] text-text-muted">{ar.today.greeting}</p>
        <p className="m-0 text-t-body-lg font-medium leading-[1.6] text-text">{hijriDate}</p>
      </div>
    </header>
  );
}

/** A tabbed screen: its title alone, at the start. */
export function TabTopBar({ title, end }: { title: string; end?: ReactNode }) {
  return (
    <header>
      <div className="hidden items-center justify-between px-2 pt-3 wide:flex">
        <Wordmark className="ms-3 h-[30px] text-text" />
        <WideTabs />
        <span className="size-(--touch-target)" />
      </div>
      <div className="flex items-center justify-between gap-2 px-5 pt-5">
        <h1 className="m-0 font-q-heading text-t-title">{title}</h1>
        {end}
      </div>
    </header>
  );
}

/** A pushed screen: back, then the title. */
export function PushedTopBar({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <header className="flex items-center gap-1 px-2 pt-3">
      <IconButton icon={ChevronRight} label={ar.common.back} onClick={onBack} size="lg" tone="text" />
      <h1 className="m-0 font-q-heading text-[1.375rem] leading-normal font-bold">{title}</h1>
    </header>
  );
}
