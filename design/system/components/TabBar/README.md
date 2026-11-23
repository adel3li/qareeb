# TabBar

The four sections of the app at the bottom of the phone screen: اليوم، المكتبة، الدفتر، المداومة, in that order from the right.

**Look:** `surface-raised` with a 1px `hairline` top, 20px extra bottom padding plus the safe-area inset. Each tab is 56px tall: a 22px Lucide icon (`sunrise`, `book-open`, `pen-line`, `calendar`) in a 56×30 pill, the label in `tab` style. The current tab has `aria-current="page"`, the `surface-sunken` pill and `text` at 700; the others are `text-muted`.

**Behaviour:** each tab is a link to its hash route (`#/today`, `#/library`, `#/notebook`, `#/calendar`); reloading keeps the tab. At 768px and wider the same four links move into the TopBar.

**The consumer provides** the current route. Settings is not a tab: it lives in the TopBar of Today.

**Don't** add badges, dots or counts to tabs, or a fifth tab.
