# JournalEntry

One thing the user wrote in «ما وجدته», after a dua or on its own, grouped under its Hijri day.

**Look:** the day above in `caption` 600, `text-muted`; the entry is a `surface` card (`radius-card`, `hairline`): the dua's short title in `caption` 600, `accent`; the user's text in `body`, `text`, line height 1.85; a foot row with the intention in `caption`, `text-muted`, and two IconButtons, تعديل and حذف, always visible. Deleting asks for confirmation in a Dialog.

**The consumer provides** the day (from the stored local date, never recomputed), the dua's short title (from the stored dua id), the text, the intention, and the edit and delete handlers.

**Don't** quote the user's text with « », share it, or include it in anything exported except the user's own backup file.
