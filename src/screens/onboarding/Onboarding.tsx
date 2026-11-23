import { ChevronRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '../../components/Button';
import { Door } from '../../components/Door';
import { IconButton } from '../../components/IconButton';
import { ProgressDots } from '../../components/ProgressDots';
import { Wordmark } from '../../components/Wordmark';
import { ar } from '../../copy/ar';
import { useApplyAppearance } from '../../app/theme';
import { useOnboarding } from '../../state/stores';

/** Four slides, skip from any of them, back; the last one scrolls on short screens. No switches here. */
export default function Onboarding() {
  useApplyAppearance();
  const complete = useOnboarding((s) => s.complete);
  const [index, setIndex] = useState(0);
  const heading = useRef<HTMLHeadingElement>(null);
  const slides = ar.onboarding.slides;
  const slide = slides[index];
  const last = index === slides.length - 1;

  useEffect(() => {
    heading.current?.focus();
  }, [index]);

  const finish = () => {
    complete();
    location.hash = '#/today';
  };

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-(--content-max) flex-col px-6 pt-[max(12px,env(safe-area-inset-top))] pb-[calc(24px+env(safe-area-inset-bottom))]">
      <div className="flex min-h-(--touch-target) items-center justify-between">
        {index > 0 ? <IconButton icon={ChevronRight} label={ar.onboarding.back} onClick={() => setIndex(index - 1)} size="lg" tone="text" /> : <span className="size-(--touch-target)" />}
        <ProgressDots count={slides.length} current={index} label={ar.onboarding.progress(index + 1, slides.length)} />
        {!last ? (
          <Button variant="quiet" onClick={finish}>
            {ar.onboarding.skip}
          </Button>
        ) : (
          <span className="size-(--touch-target)" />
        )}
      </div>
      <section className="flex flex-1 flex-col items-center justify-center gap-6 py-8 text-center" aria-roledescription="شريحة">
        {index === 0 ? <Wordmark className="h-12 text-text" /> : <Door />}
        <h1 ref={heading} tabIndex={-1} className="m-0 font-q-heading text-t-display outline-none">
          {slide.title}
        </h1>
        <p className="m-0 max-w-[34ch] text-t-body-lg text-text-body">{slide.body}</p>
        <p className="m-0 text-t-body font-medium text-accent">{slide.line}</p>
      </section>
      <div className="flex flex-col gap-2">
        {last ? (
          <Button variant="primary" block onClick={finish}>
            {ar.onboarding.start}
          </Button>
        ) : (
          <Button variant="primary" block onClick={() => setIndex(index + 1)}>
            {ar.onboarding.next}
          </Button>
        )}
      </div>
    </main>
  );
}
