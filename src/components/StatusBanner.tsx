import { CircleCheck } from 'lucide-react';
import { Icon } from './Icon';

/** States a fact quietly: today's dua was lived. No celebration. */
export function StatusBanner({ children }: { children: string }) {
  return (
    <p role="status" className="m-0 flex items-center gap-2.5 rounded-control bg-sunken px-3.5 py-3 text-t-body-sm font-medium text-ink">
      <Icon as={CircleCheck} className="text-success" />
      {children}
    </p>
  );
}
