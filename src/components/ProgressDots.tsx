import { ar } from '../copy/ar';

/** Where the user is in a short fixed sequence. Never for anything that grows over time. */
export function ProgressDots({ count, current, label }: { count: number; current: number; label?: string }) {
  return (
    <ol className="m-0 flex list-none items-center gap-[6px] p-0" aria-label={label ?? ar.live.stepProgress(current + 1, count)}>
      {Array.from({ length: count }, (_, i) => (
        <li
          key={i}
          aria-current={i === current ? 'step' : undefined}
          className={`h-[6px] rounded-full ${i === current ? 'w-[22px] bg-accent' : i < current ? 'w-[6px] bg-accent' : 'w-[6px] bg-hairline'}`}
        />
      ))}
    </ol>
  );
}
