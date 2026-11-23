# TopBar

The head of a screen: on Today the wordmark and the settings button, then the greeting and the Hijri date; on a pushed screen a back button and the screen's title.

**Today:** the wordmark (`wordmark.svg` inline in `text`, or the `-on-light` / `-on-dark` file) 30px tall at the start; IconButton الإعدادات at the end. Under it, «السلام عليكم» in `body-sm`, `text-muted`, and the Hijri date in 17px/500, `text`: «الاثنين ١٣ جمادى الآخرة ١٤٤٨ هـ».

**Tabbed screens** (المكتبة، الدفتر، المداومة): the screen title alone in `title`, at the start, with `space-5` above.

**Pushed screens** (الإعدادات, a dua page): IconButton رجوع (`chevron-right`, in `text`), then the title in 22px Kufi.

**The consumer provides** the variant (`today | tab | pushed`), the title, the date string (from `src/lib/hijri.ts`), and the back or settings action. On wide screens the top bar also carries the tabs.

**Don't** put counts, streaks or a profile here. There is no account.
