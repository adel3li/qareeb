# ChoiceGrid

Up to four large tiles of which one may be chosen with a single tap: the intention after «عِش الدعاء».

**Look:** two columns, 10px apart; tiles 64px, `surface`, 1px `hairline`, `radius-control`, `body` at 500. The chosen tile takes a 2px `cta` ring (`aria-pressed="true"`). The question above in `subtitle`, with «اختيار واحد، وهو اختياري.» under it.

**Behaviour:** choosing is optional; «تخطَّ» (quiet Button) and «متابعة» (primary) are both available. When the source names a time for the dua (after prayer, for instance), that tile is pre-selected and the reason is stated under the grid.

**The consumer provides** the options, the value and `onChange`.

**Don't** use it for more than four options, or to collect anything that is scored or counted later.
