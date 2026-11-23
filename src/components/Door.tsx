/** The only illustration: the arch of the door in accent, with the glow inside. */
export function Door({ size = 'md' }: { size?: 'md' | 'lg' }) {
  const dims = size === 'lg' ? 'h-[136px] w-[106px] [border-radius:53px_53px_6px_6px/36px_36px_6px_6px]' : 'h-[118px] w-[92px] [border-radius:46px_46px_6px_6px/31px_31px_6px_6px]';
  return <div aria-hidden="true" className={`glow box-border shrink-0 border-[1.5px] border-solid border-accent ${dims}`} />;
}
