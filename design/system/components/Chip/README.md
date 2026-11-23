# Chip

A small non-interactive label in `caption` style that says what kind of text the reader is looking at.

**Use**
- **Kind** (`surface-sunken`, `text-muted`): «من القرآن», «من السنة» at the start of every dua card and share image.
- **Accent** (outlined in `accent`): a one-off status of the dua itself, only «دعاء الترحيب» on the first day.
- **Plain** (outlined in `hairline`): «بتصرّف» before a retelling, marking our wording as distinct from the source.

**The consumer provides** the text and the variant (`kind | accent | plain`).

**Don't** make chips tappable (use SegmentedControl or a Button), stack more than two on a card, or use a chip for counts, scores or achievements.
