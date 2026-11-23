import { ChevronRight, Settings } from 'lucide-react';
import type { ReactNode } from 'react';
import { Icon } from '../components/Icon';
import { IconButton } from '../components/IconButton';
import { Wordmark } from '../components/Wordmark';
import { ar } from '../copy/ar';
import { navigate } from './router';

/** Today's head on phones: the wordmark and the settings button. On wide screens the AppHeader carries both. */
export function TodayTopBar() {
  return (
    <div className="flex items-center justify-between pt-3 ps-1 md:hidden">
      <Wordmark />
      <IconButton label={ar.nav.settings} onClick={() => navigate({ name: 'settings' })} className="-me-2.5">
        <Icon as={Settings} size={22} />
      </IconButton>
    </div>
  );
}

/** A tabbed screen's title. */
export function TabTitle({ children }: { children: ReactNode }) {
  return <h1 className="m-0 pt-5 font-heading text-t-title text-ink">{children}</h1>;
}

/** A pushed screen (settings, a dua page): back, then the title. */
export function PushedTitle({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div className="flex items-center gap-1 pt-3">
      <IconButton label={ar.nav.back} tone="ink" onClick={onBack} className="-ms-2.5">
        <Icon as={ChevronRight} size={22} />
      </IconButton>
      <h1 className="m-0 font-heading text-[1.375rem] leading-normal font-bold text-ink">{title}</h1>
    </div>
  );
}

