# Sheet

A panel that rises from the bottom over the `overlay` scrim for a short task: sharing a dua, adding a need, confirming a deletion.

**Look:** `surface-raised`, `radius-sheet` top corners, `raised-shadow`, a 40×4 grip in `hairline`, 20px side padding plus the bottom safe-area inset. The head holds the title in `subtitle` and an IconButton إغلاق. Actions at the bottom: secondary then primary in reading order, or one primary full width. Enters in `duration-slow` with `ease-standard`, leaves with `ease-exit`; with reduced motion it simply appears.

**Behaviour:** every sheet and dialog is the one `Dialog` component, rendered through a portal into `document.body`, with `role="dialog"`, `aria-modal`, focus trapped inside, Escape and the scrim closing it, page scroll locked, and focus returned to where it was. Confirmation dialogs repeat the action in their buttons («امسح» / «تراجع»).

**The consumer provides** the title, the content, the actions and `onClose`.

**Never** place a sheet inside a transformed or filtered ancestor; never open one on top of another.
