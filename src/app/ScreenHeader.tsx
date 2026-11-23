import { ChevronRight, Settings } from 'lucide-react';
import { ar } from '../copy/ar';
import { IconButton } from '../components/IconButton';
import { Wordmark } from '../components/Wordmark';
import { goBack } from './useRoute';

/** Today: the wordmark and settings (phone only; on wide screens they are in the header). */
export function TodayHeader() {
  return (
    <div className="flex items-center justify-between ps-1 pt-3 wide:hidden">
      <Wordmark />
      <IconButton icon={Settings} label={ar.common.settings} size="lg" onClick={() => (window.location.hash = '#/settings')} className="-me-2" />
    </div>
  );
}

/** A tabbed screen's title. */
export function TabTitle({ title }: { title: string }) {
  return <h1 className="m-0 pt-5 font-kufi text-t-title text-text">{title}</h1>;
}

/** A pushed screen: back, then the title. */
export function PushedHeader({ title, onBack, fallback = '#/today' }: { title: string; onBack?: () => void; fallback?: string }) {
  return (
    <div className="flex items-center gap-1 pt-3 -ms-2">
      <IconButton icon={ChevronRight} label={ar.common.back} size="lg" tone="text" onClick={onBack ?? (() => goBack(fallback))} />
      <h1 className="m-0 font-kufi text-[1.375rem] leading-[1.5] font-bold text-text">{title}</h1>
    </div>
  );
}

