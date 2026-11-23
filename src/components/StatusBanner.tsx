import { CircleCheck } from 'lucide-react';
import { Icon } from './Icon';

/** A quiet line that states a fact: today's dua was lived. No celebration. */
export function StatusBanner({ children }: { children: React.ReactNode }) {
  return (
    <p role="status" className="m-0 flex items-center gap-2.5 rounded-control bg-surface-sunken px-3.5 py-3 text-t-body-sm font-medium text-text">
      <span className="text-success">
        <Icon icon={CircleCheck} />
      </span>
      {children}
    </p>
  );
}
