import type { ReactNode } from 'react';
import { Door } from './Door';

/** Before a section has anything in it: the door, one reassuring line, one explanation, one action. */
export function EmptyState({ title, body, action }: { title: string; body?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-[18px] px-6 py-8 text-center">
      <Door />
      <h2 className="m-0 font-q-heading text-t-subtitle">{title}</h2>
      {body && <p className="m-0 text-t-body-sm text-text-body">{body}</p>}
      {action}
    </div>
  );
}
