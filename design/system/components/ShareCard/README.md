# ShareCard

The image a user shares: the dua as it appears on its card, drawn on a canvas at 1080×1350 (post, 4:5) or 1080×1920 (story, 9:16), in the user's current theme.

**Anatomy:** the kind chip (32px), the title (64px Kufi), the arch (`frame-arch-x-lg` × `frame-arch-y-lg`, 3px `sacred-frame`, `sacred-bg`) holding the sacred text and its reference, then, by the user's choice, the scene line («الموقف ·» in `accent`) or one reflection (with a 4px `accent` rule), and the foot: the lockup (`lockup-on-light` / `lockup-on-dark`, 76px tall) and «دعاءٌ واحد كلَّ يوم» in `text-muted`, over a 2px `hairline`. `page` with the `glow` behind. Margins 96px at the sides; the story format adds 200px at the top.

**Sacred text is never cut.** The Qur'an size steps down with length: 84px, then 72, 58, 48; if it still does not fit, the story format grows. Wait for `document.fonts.ready` and load the Mushaf face explicitly before drawing; wrap lines by measuring words with `ctx.direction = 'rtl'`.

**The consumer provides** the card, the format (`post | story`), the level (`dua | scene | reflection`) and the theme. Shared with `navigator.share({ files })` where supported, otherwise downloaded. The text version for copying is:

```
«{العنوان}»
{نص الدعاء بعلامته}
[{المصدر}]

{سطر الموقف}
— قريب  {رابط الدعاء}
```

**Never** include anything the user wrote.
