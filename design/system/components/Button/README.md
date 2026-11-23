# Button

A labelled action: one primary button per screen in `cta`, everything else secondary, quiet or danger.

**Use**
- **Primary** (`cta` fill, `cta-text`, `button` style, `button-height`): the one thing the screen is for. «عِش الدعاء», «التالي», «يا ربّ», «احفظ في الدفتر», «ابدأ بدعاء اليوم». Full width in flows and on cards.
- **Secondary** (transparent, 1px `hairline`, `text`, 16px/500, `button-height-sm`): alternatives beside or under the primary: «أعِد التأمل», «إتمام», «نسخ النص».
- **Quiet** (no border, `text-muted`): low-stakes helpers that must stay visible: «أظهر النص كاملًا», «تخطَّ».
- **Danger** (`danger` label, `hairline` border): destructive actions; always followed by a confirmation dialog that repeats the action («امسح» / «تراجع»).
- **Waiting** (`aria-disabled="true"`, `surface-sunken`, `text-muted`): «التالي» while the step's text is still appearing. Keep it focusable; explain the wait with the quiet «أظهر النص كاملًا» next to it.

**The consumer provides** the label (from `src/copy/ar.ts`), an optional leading icon (Lucide, 18–20px, before the text in reading order), the action (`onClick` or `href`), and `variant`: `primary | secondary | quiet | danger`, `block` (full width), `disabled`.

**Do**
- Write the label as what happens: a verb or short phrase.
- Keep 44px of touch height even for quiet buttons.

**Don't**
- Put two primary buttons on one screen, or use `cta` for anything that is not the main action.
- Use a button for navigation between tabs (that is TabBar) or for toggles (that is Switch or SegmentedControl).
