# TextSizeStepper

The text-size setting: − and + buttons around a typed value, with a live sample under it.

**Behaviour:** the value is the root font size in px (14 to 24, default 16); every type style is rem, so the whole app scales, sacred text included. The field accepts typing and is corrected only when it loses focus (typing «١٨» must give 18, not jump on the first digit). Digits shown in Arabic-Indic; both digit sets accepted.

**Look:** the label in `body`; two 44px square buttons with `hairline` borders and `radius-control`; the value in a 56×44 `surface-sunken` field; the sample sentence on `surface-sunken` below.

**The consumer provides** the value and `onChange`.
