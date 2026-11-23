import type { ReactNode } from 'react';

/** The small door: the arch in accent with the glow inside. */
export function Door({ size = 'md' }: { size?: 'md' | 'lg' }) {
  const dims = size === 'lg' ? 'w-[116px] h-[148px] rounded-[58px_58px_8px_8px/39px_39px_8px_8px]' : 'w-[92px] h-[118px] rounded-[46px_46px_6px_6px/31px_31px_6px_6px]';
  return <div aria-hidden="true" className={`glow box-border shrink-0 border-[1.5px] border-solid border-accent ${dims}`} />;
}

/** What a section shows before the user has put anything in it. */
export function EmptyState({ title, body, action, headingLevel = 2 }: { title: string; body?: string; action?: ReactNode; headingLevel?: 2 | 3 }) {
  const H = headingLevel === 2 ? 'h2' : 'h3';
  return (
    <div className="flex flex-col items-center gap-[18px] px-6 py-8 text-center">
      <Door />
      <H className="m-0 font-kufi text-t-subtitle text-text">{title}</H>
      {body ? <p className="m-0 text-t-body-sm text-text-body">{body}</p> : null}
      {action}
    </div>
  );
}
