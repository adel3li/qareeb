import type { ReactNode } from 'react';
import { Door } from './Door';

export function EmptyState({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-[18px] px-6 py-8 text-center">
      <Door />
      <h2 className="m-0 whitespace-pre-line font-heading text-t-subtitle text-ink">{title}</h2>
      <p className="m-0 max-w-[34ch] text-t-body-sm text-body">{body}</p>
      {action}
    </div>
  );
}
