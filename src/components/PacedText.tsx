import { ar } from '../copy/ar';

/**
 * The sentences of a step inside the arch, revealed one at a time by the caller's timer,
 * in a polite live region. Each new sentence fades in (no fade with reduced motion).
 */
export function PacedText({ stepLabel, sentences, revealed, children }: { stepLabel: string; sentences: string[]; revealed: number; children?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4">
      <p className="m-0 text-center text-t-label font-semibold text-accent">{stepLabel}</p>
      <div className="arch flex min-h-[min(360px,52dvh)] flex-col items-center justify-center gap-5 border border-sacred-frame px-[22px] pt-16 pb-8">
        <div aria-live="polite" className="flex flex-col gap-[14px] text-center">
          {sentences.slice(0, revealed).map((s, i) => (
            <p key={i} className="fade-in m-0 font-q-heading text-t-live leading-[1.85] text-text">
              {s}
            </p>
          ))}
        </div>
        {children}
      </div>
      <span className="sr-only">{revealed < sentences.length ? ar.live.waitHint : ''}</span>
    </div>
  );
}
