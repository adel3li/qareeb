/** Where the user is in a short fixed sequence. Never for anything that grows over time. */
export function ProgressDots({ count, current, label }: { count: number; current: number; label: string }) {
  return (
    <ol aria-label={label} className="m-0 flex list-none items-center gap-1.5 p-0">
      {Array.from({ length: count }, (_, i) => (
        <li
          key={i}
          aria-current={i === current ? 'step' : undefined}
          className={`h-1.5 rounded-pill ${i === current ? 'w-[22px] bg-accent' : i < current ? 'w-1.5 bg-accent' : 'w-1.5 bg-hairline'}`}
        />
      ))}
    </ol>
  );
}
