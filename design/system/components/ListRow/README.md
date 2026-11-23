# ListRow

One line of a list group: a dua the user has lived, a setting, an action.

**Look:** rows live in a `surface` group with `radius-card` and 1px `hairline` dividers. A content row is at least 72px: the title in 17px/600, `text`, the meta line in `caption`, `text-muted` («من القرآن · الأحد ١٢ جمادى الآخرة»), then optional status marks (a filled `heart` in `accent` for a favourite) and `chevron-left` in `text-muted` when the row opens something. A settings row is 56px with a 20px icon in `text-muted` at its start. A destructive row is `danger`, icon included. A small label in `caption` 600, `accent` names a group above it.

**The consumer provides** the title, meta, the start icon or the end marks, and `href` or `onClick`.

**Don't** hide row actions behind swipe or hover. Lists of lived duas are ordered newest first and show no totals.
