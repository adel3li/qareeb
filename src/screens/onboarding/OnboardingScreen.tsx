import { useRef, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { Button } from '../../components/Button';
import { Door } from '../../components/Door';
import { Icon } from '../../components/Icon';
import { IconButton } from '../../components/IconButton';
import { ProgressDots } from '../../components/ProgressDots';
import { Wordmark } from '../../components/Wordmark';
import { ar } from '../../copy/ar';
import { finishOnboarding } from '../../state/actions';
import { navigate } from '../../app/router';

/** Four slides, skip from any of them, back from the second. Nothing about reminders or statistics: they do not exist. */
export default function OnboardingScreen() {
  const [i, setI] = useState(0);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const slides = ar.onboarding.slides;
  const slide = slides[i];
  const last = i === slides.length - 1;

  const go = (next: number) => {
    setI(next);
    requestAnimationFrame(() => headingRef.current?.focus());
  };
  const finish = () => {
    finishOnboarding();
    navigate({ name: 'today' }, { replace: true });
  };

  return (
    <main className="mx-auto flex min-h-dvh max-w-content flex-col px-gutter pt-3 pb-[calc(24px+env(safe-area-inset-bottom,0px))]">
      <div className="flex min-h-touch items-center justify-between">
        <div className="w-24">
          {i > 0 && (
            <IconButton label={ar.onboarding.back} tone="ink" onClick={() => go(i - 1)} className="-ms-2.5">
              <Icon as={ChevronRight} size={22} />
            </IconButton>
          )}
        </div>
        <ProgressDots count={slides.length} current={i} label={ar.onboarding.progress(i + 1, slides.length)} />
        <div className="flex w-24 justify-end">
          {!last && (
            <Button variant="quiet" onClick={finish} className="-me-3.5">
              {ar.onboarding.skip}
            </Button>
          )}
        </div>
      </div>

      <section className="flex flex-1 flex-col items-center justify-center gap-5 py-8 text-center" aria-live="polite">
        {i === 0 ? <Wordmark className="h-12" /> : <Door size="lg" />}
        <h1 ref={headingRef} tabIndex={-1} className="m-0 font-heading text-t-display text-ink outline-none">
          {slide.title}
        </h1>
        <p className="m-0 max-w-[36ch] text-t-body-lg text-body">{slide.body}</p>
        <p className="m-0 mt-2 text-t-body-lg font-medium text-ink">{slide.line}</p>
      </section>

      <Button block onClick={() => (last ? finish() : go(i + 1))}>
        {last ? ar.onboarding.start : ar.onboarding.next}
      </Button>
    </main>
  );
}
