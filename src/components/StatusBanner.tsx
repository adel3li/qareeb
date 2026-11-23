import { CircleCheck } from 'lucide-react';
import { Icon } from './Icon';

/** States a fact quietly: today's dua was lived. No celebration. */
export function StatusBanner({ children }: { children: string }) {
  return (
    <p role="status" className="m-0 flex items-center gap-[10px] rounded-(--radius-control) bg-surface-sunken px-[14px] py-3 text-t-body-sm font-medium text-text">
      <Icon icon={CircleCheck} className="text-success" />
      {children}
    </p>
  );
}
