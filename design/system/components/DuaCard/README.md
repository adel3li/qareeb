# DuaCard

Today's dua as one card on `surface`: what kind it is, its title and hook, the dua itself in SacredText, the one-line situation, and the action that starts «عِش الدعاء».

**Anatomy, top to bottom** (blocks `stack` apart, `card-padding` inside, `radius-card`, 1px `hairline`, `card-shadow`):
1. Top row: the kind Chip («من القرآن» / «من السنة», plus «دعاء الترحيب» on the first day) and the IconButtons نسخ, مشاركة, المفضلة at the end.
2. `title` in the heading face (`shortTitle` in lists), then the hook in `body`, `text-body`.
3. SacredText with its reference.
4. The scene line in `body-sm`, `text-body`, led by «الموقف ·» in `accent` 600.
5. The primary Button «عِش الدعاء · دقيقة ونصف». After completion it is replaced by StatusBanner «دعوتَ الله اليوم بهذا الدعاء» and a secondary «أعِد التأمل».

Under the card, a Disclosure group: الموقف, (for hadith) نص الحديث كاملًا, المعنى, وقفات. Show «متى يُدعى به» only when the source states it.

**The consumer provides** the card data (`kind`, `title`, `hook`, the stored sacred `text` and reference, `sceneLine`), whether today is done, and the handlers for copy, share, favourite and start.

**Do** keep one card per screen and nothing above it but the greeting and the Hijri date. **Don't** add a separate "verse of the day", counts, or a progress indicator to the card.
