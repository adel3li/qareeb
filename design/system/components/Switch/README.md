# Switch

An on/off state that takes effect at once, with its label before it.

**Look:** the label in `label` style, `text-body`; a 44×26 track (`radius-pill`, `surface-sunken`, 1px `hairline`) with a 20px knob in `text-muted`. On: the track turns `cta`, the knob `cta-text`, and it slides toward the end (left) in `duration-fast`. The whole row is the button, at least 44px tall, `role="switch"` with `aria-checked`.

**Use** for «استُجيبت؟» on a need in دعواتي (turning it on opens «كيف استجاب الله؟»), and for settings that really work, such as showing three of the user's needs during the experience.

**The consumer provides** the label, `checked` and `onChange`.

**Don't** show a switch for something that does not work yet (a reminder that is never sent was Alhamd's mistake). For «أضف تذكيرًا إلى تقويمك» use a Button that downloads the calendar file.
