/** The open door drawn with the arch tokens: the only illustration in قريب. */
export function Door({ className = '' }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`glow box-border h-[118px] w-[92px] border-[1.5px] border-accent [border-radius:46px_46px_6px_6px/31px_31px_6px_6px] ${className}`}
    />
  );
}
