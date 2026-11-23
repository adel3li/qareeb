# Sacred text

Verses and hadith are shown exactly as copied from their source. This section is binding on every screen, share image and preview.

## Never typed

- Qur'an text comes from the King Fahd Complex text (`text_qpc_hafs`, api.quran.com) kept in `content/sources/`, copied by script, by surah and ayah. Hadith text is copied by script from the open sunnah.com dataset (al-Bukhari and Muslim only, for now), by collection and number.
- Nobody types, completes, corrects, re-vowels or paraphrases a verse or a hadith: not in code, content, tests, mockups or this design system. Mockups and previews load the text from a copied file (`assets/Content/sacred.json` here). Placeholders and tests use neutral Arabic such as «نص الآية يُنسخ من مصدره».
- Where an excerpt of a verse or narration is the dua, its boundaries are the scholarly reviewer's decision, not a designer's.

## Shown only through SacredText

| | Qur'an | Hadith |
|---|---|---|
| marks | ﴿ before, ﴾ after | « before, » after |
| face | `quran` (KFGQPC Uthmanic Script HAFS) | `ui` (Noto Sans Arabic), weight 500 |
| style | `quran` on the card, `quran-live` in the guided experience | `hadith` on the card; the full narration in `hadith-full`, without « » |
| colour | `sacred-quran` on `sacred-bg` | `sacred-hadith` on `sacred-bg` |
| frame | the arch, 1px `sacred-frame` | the same arch |
| reference | under it in `label`, `text-muted`: «سورة الأنبياء: ٨٧» | «صحيح مسلم (٢٧٢١)»; a grade only with who graded it |

- The verse number sits inside its end-of-verse mark, as the Madina Mushaf font draws it from the text. Do not add numbers or brackets of your own.
- Never pair the Mushaf font with Tanzil's text, and never set the Mushaf text in another face.
- Centre Qur'an text inside the arch. Hadith on a card is centred; the full narration is set to the start (right).

## Never cut, never decorated

- Sacred text is never truncated, clamped, faded out or scrolled inside a box, in the app or on share images. When it is long, step the size down (on share images 84 → 72 → 58 → 48px) and let the card grow.
- No animation on the letters, no glow over the text, no gradient text, no letter-spacing, no justification, no colour other than the sacred tokens.
- Nothing is placed on top of sacred text, and nothing interrupts it (no inline buttons, no highlights).
- Text quoted inside authored copy between ﴿ ﴾ or « » must match the source letter for letter; anything else is written without those marks.

## Kinds of text, told apart

| text | looks like |
|---|---|
| a verse | in the arch, ﴿ ﴾, the Mushaf face |
| a hadith | in the arch, « », the UI face at 500 |
| the retelling of the situation | `body` in `text-body`, under a «بتصرّف» chip and its source |
| reflections and guided steps | `body` or `live`, no quotation marks |
| (later) a saying of a Companion | a distinct frame and the label «من كلام…», never the arch |
