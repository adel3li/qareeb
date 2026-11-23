# TextField

Where the user writes: search, a short field (a need, its note), and the journal area.

**Look:** `surface-sunken` fill, 1px `hairline`, `radius-control`, text in `body`, placeholder in `text-muted`. Inputs are 48px tall; the journal area at least 150px, growing with the screen, never resizable by a handle. Labels sit above in `label` 500, `text`; the journal prompt is the label of its area, set in `subtitle` above it.

**Variants**
- **Search:** the `search` icon inside the field at the start, `type="search"`, an `aria-label`. Matching normalises Arabic in both directions (`normalizeArabic`): tashkeel and tatweel ignored, alef, yaa and taa marbuta forms unified.
- **Field:** a visible label, always.
- **Journal:** under the area, the privacy line with the `lock` icon: «ما تكتبه لا يغادر جهازك.» Drafts save to the device as the user types (500ms after the last key) and come back if the experience is closed.

**The consumer provides** the label, value, placeholder and `onChange`; for the journal, the draft key.

**Don't** validate while the user types (correct on blur), or block the experience on writing: every field here is optional.
