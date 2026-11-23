# SacredText

The only way a verse or a hadith appears anywhere: copied text in its face, its marks and its colour, inside the arch, with its reference under it.

**Use** wherever the dua itself is shown: the dua card, the «الدعاء» step of the guided experience, share images, the library's dua page.
- `kind="quran"`: ﴿ ﴾ around the text, `quran` style (KFGQPC Uthmanic Script HAFS with the King Fahd Complex text), `sacred-quran`, centred. The verse numbers inside their end marks come from the text; add nothing.
- `kind="hadith"`: « » around the text, `hadith` style (Noto Sans Arabic 500, its full vowelling kept), `sacred-hadith`, centred.
- The frame is the arch: `sacred-bg`, 1px `sacred-frame`, radius `frame-arch-x`/`frame-arch-y` over `radius-card`, 64px top padding. The reference sits under the text in `label`, `text-muted`: «سورة الفاتحة: ٦–٧», «صحيح مسلم (٢٧٢١)».
- `size="live"` uses `quran-live` (32px) in the guided experience.

**The consumer provides** `kind`, the text exactly as stored in the card (never a string typed in code), the reference, and optionally `size`. Long text grows the frame; on share images the type steps down (84 → 72 → 58 → 48px).

**Never** truncate, clamp, fade, scroll inside a box, animate the letters, put a glow over it, change its face or colour, justify it, or place anything on it. The full narration of a hadith is not this component: it is `hadith-full` text inside a Disclosure, without « ». See the section **Sacred text**.
