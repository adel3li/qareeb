# ProgressDots

Where the user is in a short, fixed sequence: the five steps of «عِش الدعاء» and the four onboarding slides.

**Look:** 6px dots `radius-pill`, 6px apart; done in `accent`, current a 22px `accent` pill, upcoming `hairline`. The first step is on the right. The list carries an `aria-label` that says it in words: «الخطوة ٢ من ٥».

**The consumer provides** `count` and `current`.

**Don't** use dots for anything that grows over time (days, duas lived): that would turn a practice into a score.
