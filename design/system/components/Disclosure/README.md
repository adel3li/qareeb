# Disclosure

A row that opens to reveal one section of a dua's background, grouped with its siblings in one `surface` box under the DuaCard.

**Use** for الموقف, نص الحديث كاملًا, المعنى, وقفات and, only when the source states it, متى يُدعى به. Rows are 54px, `body` at 500 in `text`, a `chevron-down` in `text-muted` that turns 180° (`duration-fast`) when open. Rows are separated by 1px `hairline`; the group has `radius-card`.

**Bodies**
- الموقف: the retelling in `body`, `text-body`, then a «بتصرّف» Chip and the source in `caption`, `text-muted`.
- نص الحديث كاملًا: the narration in `hadith-full`, exactly as copied, then «صحيح مسلم (٢٧٢١) · نُسخ من sunnah.com».
- المعنى: glossary terms (copied from the text) and the summary, with their source.
- وقفات: each reflection in `body`, `text-body`, with a 2px `accent` rule at its start. Not quotation marks: reflections are ours.

**The consumer provides** the title, the body, `expanded`, and `onToggle`. The head is a `<button aria-expanded>`; the body follows it in the DOM.

**Don't** hide a section that has no content behind a row that opens empty: leave the row out.
