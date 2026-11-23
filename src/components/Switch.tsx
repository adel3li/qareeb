/** An on/off state that takes effect at once; the whole row is the button. */
export function Switch({ label, checked, onChange, className = '' }: { label: string; checked: boolean; onChange: (v: boolean) => void; className?: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`inline-flex min-h-touch items-center gap-2.5 border-0 bg-transparent p-0 text-start text-t-label font-normal text-body ${className}`}
    >
      <span className="flex-1">{label}</span>
      <span
        aria-hidden="true"
        className={`box-border flex h-[26px] w-11 shrink-0 items-center rounded-pill border border-solid p-0.5 transition-colors duration-[var(--duration-fast)] ${checked ? 'border-cta bg-cta' : 'border-hairline bg-sunken'}`}
      >
        <span className={`size-5 rounded-pill transition-transform duration-[var(--duration-fast)] ${checked ? '-translate-x-[18px] bg-cta-text' : 'bg-muted'}`} />
      </span>
    </button>
  );
}
