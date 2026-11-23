/** An on/off state that takes effect at once; the whole row is the button. */
export function Switch({ label, checked, onChange, className = '' }: { label: string; checked: boolean; onChange: (next: boolean) => void; className?: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`inline-flex min-h-touch items-center justify-between gap-2.5 border-0 bg-transparent p-0 text-start font-sans text-t-label text-text-body ${className}`}
    >
      <span>{label}</span>
      <span
        aria-hidden="true"
        className={`flex h-[26px] w-11 shrink-0 items-center rounded-pill border border-solid p-0.5 transition-colors duration-fast ease-standard ${checked ? 'border-cta bg-cta' : 'border-hairline bg-surface-sunken'}`}
      >
        <span className={`size-5 rounded-pill transition-transform duration-fast ease-standard ${checked ? '-translate-x-[18px] bg-cta-text' : 'bg-text-muted'}`} />
      </span>
    </button>
  );
}
