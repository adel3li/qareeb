# IconButton

A 44px round button that holds one Lucide icon and no visible text: card actions, the settings entry, close.

**Use** for actions whose icon is universal and that repeat across screens: نسخ, مشاركة, المفضلة on the dua card; الإعدادات in the top bar; إغلاق in the guided experience and sheets. Rest in `text-muted`; pressed fills `surface-sunken`; a toggled-on state (`aria-pressed="true"`) turns `accent` and fills the icon (the favourite heart).

**The consumer provides** the icon (Lucide, `icon-md` 20px in cards, `icon-lg` 22px in bars), an Arabic `aria-label` that says what happens («مشاركة الدعاء», not «مشاركة»), the action, and `pressed` for toggles.

**Do**
- Keep the full 44×44 target even when the icon is 20px. Group card actions at the end of the card's top row with `margin-inline-end: -10px` so the icons align with the card edge.
- Make each share button share the thing it sits on.

**Don't**
- Use an icon button for the main action of a screen, or for an action whose icon is ambiguous: write a Button.
- Hide icon buttons until hover: they are always visible.
