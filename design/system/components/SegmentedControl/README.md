# SegmentedControl

Two or three equal choices of which exactly one is on: switching a view, or picking a setting.

**Look:** a `surface-sunken` track with 4px inset and `radius-control`; each option 40px, `body-sm` at 600; the selected one is `surface`, `text`, `card-shadow`, `radius-sm`; the others `text-muted`.

**Two roles, two ARIA patterns:**
- Switching a view (المكتبة: مررتَ بها / المفضلة; الدفتر: ما وجدته / دعواتي): `role="tablist"` with `role="tab"` and `aria-selected`.
- Choosing a value (المظهر: تلقائي / فاتح / داكن; share image size: منشور / قصة): `role="radiogroup"` with `role="radio"` and `aria-checked`.

**The consumer provides** the options (2–3, short labels), the value and `onChange`.

**Don't** put counts in the labels («استُجيبت (٤)»): answered prayers are memories, not a tally. More than three options is a list, not a segmented control.
