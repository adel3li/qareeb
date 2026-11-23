/** An on/off state that takes effect at once; the whole row is the button. */
export function Switch({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="group inline-flex min-h-(--touch-target) items-center gap-[10px] border-0 bg-transparent p-0 text-start text-t-label font-normal text-text-body"
    >
      <span className="flex-1">{label}</span>
      <span
        aria-hidden="true"
        className="box-border flex h-[26px] w-11 shrink-0 items-center rounded-full border border-hairline bg-surface-sunken p-[2px] transition-colors duration-(--duration-fast) group-aria-checked:border-cta group-aria-checked:bg-cta"
      >
        <span className="size-5 rounded-full bg-text-muted transition-transform duration-(--duration-fast) group-aria-checked:-translate-x-[18px] group-aria-checked:bg-cta-text" />
      </span>
    </button>
  );
}
