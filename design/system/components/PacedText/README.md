# PacedText

The heart of «عِش الدعاء»: a step's text appears sentence by sentence inside the arch, so the reader slows down, and it can always be shown in full.

**Look:** a full screen on `page` with the `glow` behind the arch. The step label at the top in `label` 600, `accent` («٢ · الموقف»); the arch (1px `sacred-frame`, `frame-arch-x`/`frame-arch-y`) fills the middle; sentences centred in `live` style, `text`. Under it the quiet Button «أظهر النص كاملًا» and the primary «التالي» (on the fifth step «يا ربّ», and the dua itself in SacredText `size="live"` under the step's sentence). Above everything: إغلاق, ProgressDots, مشاركة.

**Behaviour**
- One sentence every `pace-sentence` (2.8s), each fading in over `duration-base`; with reduced motion they appear without a fade.
- «التالي» waits (`aria-disabled`) until all sentences are shown or the step's duration has passed, whichever comes first.
- «أظهر النص كاملًا» shows everything at once and stops the timer for this step. The timer never hides text again.
- Sentences are split without regex lookbehind (`splitSentences`), which crashes Safari before 16.4.
- The sentences live in `aria-live="polite"`.
- Closing in the middle records nothing; unsaved writing is kept as a draft and confirmed before closing.

**The consumer provides** the step (type, sentences, duration), and `onNext`, `onClose`. One timer per step, cleared on change and on close.

**Don't** add particles, pulsing light, sounds or a countdown.
