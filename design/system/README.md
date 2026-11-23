قريب (Qareeb) is an Arabic-only, right-to-left, mobile-first web app: one supplication (dua) a day from the Qur'an and the Sunnah, the situation it was said in, its meaning, and a five-step guided experience, «عِش الدعاء». Its identity is **the open door**: stone and basalt, one luminous turquoise for action, and an arch that frames the dua. The name comes from Al-Baqarah 186; the door says the same thing without words: it is open, and it is near.

Read the sections **Sacred text**, **Voice and copy** and **Logo and app icon** before building anything that shows a verse, writes interface text, or places the logo.

## Principles

1. **The text is the hero.** Nothing competes with the dua on its card: no ornament, no gold, no patterns, no photographs.
2. **One luminous colour, for action only.** `cta` (turquoise) marks what you tap to act. Everything else is stone.
3. **The arch frames only the dua.** The arch (`frame-arch-x` × `frame-arch-y`) surrounds sacred text, the guided experience, and illustrations of the door itself. Never a button, a card or a photo.
4. **Stone is colour, not texture.** Depth comes from the four surface steps and `hairline`, not from shadows, gradients or images.
5. **Calm, and nothing to win.** No streaks, scores, badges, confetti or celebratory motion. A missed day is never shown as a failure.

## Colour

Two themes: **Stone** (light, the first theme) and **Basalt** (dark). The app follows the system setting; a user's explicit choice is set as `data-theme` on `<html>` and nowhere else. Components use tokens only: never a hex, `rgb()` or named colour in a component.

**Surfaces, from back to front:**

| token | use |
|---|---|
| `page` | the screen |
| `surface` | cards, list groups, settings groups |
| `surface-raised` | tab bar, sheets, dialogs |
| `surface-sunken` | fields, tracks of segmented controls and switches, chips, the done banner, lived days in the calendar |

Separate a surface from its neighbour with a 1px `hairline` border. Do not stack two cards on each other.

**Text:** set titles and primary labels in `text`, running authored text in `text-body`, and references, dates, captions, placeholders and resting icons in `text-muted`. All three hold 4.5:1 or more on every surface in both themes; `text` holds 7:1.

**Accent and action are different things.**
- `accent` is the stone of the identity: the door in the logo, arch outlines in illustrations, the step label in «عِش الدعاء», small section labels, the rule beside a reflection, a favourite heart. It is never a button fill.
- `cta` is the only luminous colour. Use it for the primary button of a screen (one per screen), the selected-choice ring, the dot of a lived day, and the light inside the door. Put `cta-text` on it; press with `cta-hover`. Never use `cta` for text on `page`, for decoration, or for a second button on the same screen.

**Sacred colours:** Qur'an text in `sacred-quran`, hadith in `sacred-hadith`, both on `sacred-bg` inside a 1px `sacred-frame` arch. See **Sacred text**.

**Status:** `success` and `danger` always come with a word or an icon and a word. `danger` is for destructive actions and errors only.

**Glow:** the light inside the door is `radial-gradient(70% 42% at 50% 40%, var(--glow), transparent 72%)`. Use it behind the guided experience, the closing screen and arch illustrations. Never behind a card, never over sacred text, never animated.

## Type

Three faces, all self-hosted (no request to Google Fonts: it would break the privacy promise).

| family token | face | for |
|---|---|---|
| `ui` | Noto Sans Arabic 400 · 500 · 700 | interface and all reading text, hadith included |
| `heading` | Noto Kufi Arabic 700 | titles and headings only, one weight |
| `quran` | KFGQPC Uthmanic Script HAFS | Qur'an text only, with the King Fahd Complex text |

- Use the type styles by name: `display`, `title`, `live`, `subtitle` (Kufi); `body-lg`, `body`, `body-sm`, `label`, `caption`, `tab`, `button` (Sans); `quran`, `quran-live`, `hadith`, `hadith-full` (sacred).
- Running text is never smaller than `body` (16px). `caption` and `label` are for metadata only.
- Sizes are rem: the text-size setting scales every style. Spacing does not scale.
- Arabic needs height for its marks: keep `body` at 1.75 line height, sacred text at 2 or more. Never set a line height under 1.5 on Arabic.
- No letter-spacing, no italic, no `text-transform`, no justified text (justification stretches with kashida unpredictably). Headings get `text-wrap: balance`.
- Use Arabic-Indic digits (٠١٢٣٤٥٦٧٨٩) everywhere the user reads a number, dates included: «الاثنين ١٣ جمادى الآخرة ١٤٤٨ هـ».
- Add tashkeel to interface text only where a word would be misread («عِش الدعاء», «أعِد التأمل»).

## Layout and spacing

- Phone first. Screens have a `gutter` of 16px on each side; cards have `card-padding` (18px) inside; stacked cards and the blocks of the dua card are `stack` (14px) apart. Other gaps come from the `space-*` scale.
- On tablets and desktop the reading column stays `content-max` (560px) wide and centred; the bottom tab bar becomes a top bar.
- Right to left everywhere: use logical properties (`margin-inline-start`, `padding-inline`, `inset-inline-end`), never left and right. Mirror directional icons (back, chevrons). The first item of a row is on the right.
- Every full screen scrolls; nothing is clipped at 360×640 or with the largest text size; no button covers another.
- Tappable things are at least `touch-target` (44px) in both directions. Primary buttons are `button-height` (54px) tall and full width in flows; secondary buttons `button-height-sm`.

## Shape

| token | where |
|---|---|
| `radius-control` 14px | buttons, fields, segmented controls, choice tiles, the done banner |
| `radius-sm` 10px | the selected segment inside a segmented control |
| `radius-card` 18px | cards and list groups; the bottom corners of the arch |
| `radius-sheet` 24px | top corners of sheets |
| `radius-pill` | chips, tab highlight, switches, progress dots, calendar days |

**The arch:** `border-radius: var(--frame-arch-x) var(--frame-arch-x) var(--radius-card) var(--radius-card) / var(--frame-arch-y) var(--frame-arch-y) var(--radius-card) var(--radius-card)`, a 1px `sacred-frame` border, and enough top padding (64px on a card) that text never meets the curve. The head is always 3:2, wider than tall. On 1080px share images use `frame-arch-x-lg` and `frame-arch-y-lg`.

## Elevation

Depth is the surface order plus `hairline`. Cards take `card-shadow` (a whisper in light, an inner highlight in dark). Only sheets and dialogs take `raised-shadow`, over the `overlay` scrim.

## Motion

- Durations: `duration-fast` for presses and toggles, `duration-base` for a sentence fading in or a disclosure opening, `duration-slow` for sheets. Ease in with `ease-standard`, out with `ease-exit`.
- The guided experience reveals one sentence every `pace-sentence` (2.8s) inside a polite live region. «أظهر النص كاملًا» is always there and stops the pacing for that step; the timer never hides text again.
- The closing line holds for `closing-hold` (2s), then returns to Today.
- With `prefers-reduced-motion`, durations are 0: no fades, no movement; sentences still pace but appear without a fade.
- Never put `transform`, `filter` or `animation-fill-mode: forwards` on a screen root (it breaks fixed overlays). No pulsing, no particles, no confetti, no parallax.

## Iconography

- **Lucide**, outline, stroke 1.75, round caps and joins, `icon-md` (20px) in buttons and card actions, `icon-lg` (22px) in bars. Colour from `currentColor`: `text-muted` at rest, `text` when current. Never emoji. A filled icon means "on" (the favourite heart).
- The set in use: `sunrise` اليوم · `book-open` المكتبة · `pen-line` الدفتر · `calendar` المداومة · `settings` الإعدادات · `copy` نسخ · `share-2` مشاركة · `heart` المفضلة · `x` إغلاق · `chevron-down` أقسام · `chevron-right` رجوع · `chevron-left` التالي/فتح · `circle-check` تمّ · `rotate-ccw` أعِد التأمل · `eye` أظهر النص كاملًا · `lock` خصوصية · `plus` إضافة · `search` بحث · `trash-2` حذف · `download` تصدير · `upload` استيراد · `calendar-plus` تذكير في التقويم · `circle-alert` خطأ.
- In RTL, "back" is `chevron-right` and "forward/open" is `chevron-left`.
- Every icon-only button has an Arabic `aria-label` that says what happens («مشاركة الدعاء», «إغلاق»).

## Imagery and illustration

No photographs, no people, no arabesque, star grids or geometric patterns, no gold, no mosque silhouettes. The only illustration is the door: the arch outline in `accent` with the `glow` inside, used for empty states, the closing screen and onboarding (`mark-on-light`, `mark-on-dark`, or drawn with the arch tokens). Share images follow the ShareCard component.

## States

- **Focus:** a 2px solid `focus-ring` outline with 2px offset on every focusable element, never removed.
- **Pressed:** `cta-hover` for primary; `surface-sunken` behind secondary and icon buttons.
- **Disabled:** `surface-sunken` fill, `text-muted` label, `aria-disabled="true"`; it still explains why nearby when it is not obvious (the «التالي» button waits for the text).
- **Selected:** a segment is `surface` with `card-shadow` on the `surface-sunken` track; a choice tile takes a 2px `cta` ring; a tab takes the `surface-sunken` pill and `text` at weight 700.
- **Error:** a sentence in `danger` that says what happened and what to do, under the thing it is about. No red borders alone.

## Accessibility

- Contrast: text 4.5:1, `text` and sacred text 7:1, marks, borders of controls and the focus ring 3:1, in both themes (checked by `design/tools/contrast.mjs`).
- `lang="ar" dir="rtl"` on `<html>`. Never block pinch zoom.
- One `Dialog` component for every overlay: focus trapped, Escape closes, focus returns.
- Paced text lives in `aria-live="polite"` and can always be shown in full.
- Nothing essential behind hover: delete and edit buttons are always visible.
- Test every flow with VoiceOver and TalkBack in Arabic before release.
