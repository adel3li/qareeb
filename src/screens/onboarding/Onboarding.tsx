import { useEffect, useRef, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { ar } from '../../copy/ar';
import { Button } from '../../components/Button';
import { IconButton } from '../../components/IconButton';
import { ProgressDots } from '../../components/ProgressDots';
import { Wordmark } from '../../components/Wordmark';
import { Door } from '../../components/EmptyState';
import { useOnboarding } from '../../state/store';

/** Four slides with skip and back. The last one scrolls on short screens; nothing covers the button. */
export default function Onboarding() {
  const [index, setIndex] = useState(0);
  const complete = useOnboarding((s) => s.complete);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const slides = ar.onboarding.slides;
  const slide = slides[index];
  const last = index === slides.length - 1;

  useEffect(() => {
    if (index > 0) headingRef.current?.focus();
  }, [index]);

  const finish = () => {
    complete();
    if (window.location.hash !== '#/today') window.location.hash = '#/today';
  };

  return (
    <main aria-label={ar.onboarding.label} className="mx-auto flex min-h-dvh max-w-content flex-col px-6 pt-4 pb-[calc(24px+env(safe-area-inset-bottom,0px))]">
      <div className="grid min-h-touch grid-cols-[1fr_auto_1fr] items-center">
        <div className="justify-self-start">
          {index > 0 ? <IconButton icon={ChevronRight} label={ar.common.back} tone="text" size="lg" onClick={() => setIndex(index - 1)} className="-ms-2" /> : null}
        </div>
        <ProgressDots count={slides.length} current={index} label={ar.onboarding.progress(index + 1, slides.length)} />
        <div className="justify-self-end">
          {!last ? (
            <Button variant="quiet" onClick={finish} className="-me-3.5">
              {ar.common.skip}
            </Button>
          ) : null}
        </div>
      </div>

      <section key={index} className="animate-fade flex flex-1 flex-col items-center justify-center gap-5 py-8 text-center">
        {index === 0 ? <Wordmark className="h-12" /> : <Door size="lg" />}
        <h1 ref={headingRef} tabIndex={-1} className="m-0 font-kufi text-t-display text-text outline-none">
          {slide.title}
        </h1>
        <p className="m-0 text-t-body-lg text-text-body">{slide.body}</p>
        <p className="m-0 mt-2 text-t-body-lg text-text">{slide.line}</p>
      </section>

      <Button variant="primary" block onClick={last ? finish : () => setIndex(index + 1)}>
        {last ? ar.onboarding.start : ar.common.next}
      </Button>
    </main>
  );
}
