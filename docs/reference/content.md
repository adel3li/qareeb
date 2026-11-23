# Content

The dua cards are data in `content/duas/dua_NNNN.json`, one card per file, checked by Zod (`src/content/schema.ts`) and by `scripts/validate-content.ts`. The model and the review process are in `docs/handoff/03-content-model.md`.

## Three layers

| Layer | Fields | How it gets there |
|---|---|---|
| Sacred text, verbatim | `text`, `quran.fullText`, `hadith.fullNarration`, `meaning.glossary[].term` | Copied by script, never typed: `fetch-quran` (by surah and ayah), `fetch-hadith` (by collection and number), and `apply-edit` (excerpts and glossary terms by word position) |
| Transmitted, cited | `speaker`, `sceneLine`, `context.basis`, `meaning`, `whenToSay`, `repeatCount`, `hadith.gradings`, `gradeNote` | The researcher, with a citation |
| Authored, reviewed | `title`, `shortTitle`, `hook`, `context.retelling`, `reflections`, `steps`, `journalPrompt` | Written, then reviewed; adds no event, name, quote or ruling |

## Sources (`content/sources/`, see its README)

- **Qur'an shown:** the King Fahd Complex text (`text_qpc_hafs` from api.quran.com) in `quran-qpc-hafs.json`, shown in KFGQPC Uthmanic Script HAFS (`public/fonts/UthmanicHafs1Ver18.woff2`, never subset). `src/config.ts` `QURAN_EDITION` names the fallback.
- **Qur'an compared:** Tanzil Uthmani (`quran-uthmani.txt`): `fetch-quran` compares the letters of every verse a card uses (decomposed, marks removed). Across the whole Qur'an the two editions differ in one verse, 2:72 (standalone hamza encoding), which is listed in `KNOWN_LETTER_DIFFERENCES`.
- **Qur'an searched:** Tanzil Simple (`quran-simple.txt`) is copied into each Qur'an card's `searchExtra` in the app bundle, for search only.
- **Hadith:** the open sunnah.com dataset (`fawazahmed0/hadith-api`), al-Bukhari and Muslim only (`decide()` in `src/lib/hadithGrade.ts`). For Muslim the dataset's `arabicnumber` is Abdul-Baqi's number with the narration after the dot (2705.01 is the first narration under 2705). A narration with a character outside the expected set (U+FFFD and the like; 17 of 7,589 in al-Bukhari, 834 among them) is refused: copy it from a second source.

## Scripts

| Command | What it does |
|---|---|
| `bun run fetch-quran` | Fills `quran.fullText` and `quran.edition` from the source file; `--check` changes nothing |
| `bun scripts/fetch-hadith.ts dua_0003 [--variant n]` | Copies `fullNarration`, `gradings` and `sourceUrl` from the dataset (network); `--check` compares every sunnah card |
| `bun scripts/apply-edit.ts content/edits/<file>.json` | Applies an edit: `textWords` and `glossary[].words` choose sacred text by word position (1-based, inclusive; a no-break space separates words, so a verse number is a word), `set` merges other fields. An edit may not set `text`, `fullText` or `fullNarration` directly |
| `bun run validate-content` | All checks below |
| `bun run build-content` | Writes `src/content/generated/duas.json` (gitignored) through the review gate |

## Checks (`scripts/lib/validate.ts`)

Schema (strict: unknown fields fail); file name and id; duplicate or retired ids (`content/retired-ids.json`); duplicate `order`; `<<…>>` and `[[…]]` placeholders (errors at `verified` and above, warnings below); `quran.fullText` equals the source verses and its letters match Tanzil; `text` is a verbatim excerpt of the full text; hadith narration has no corrupted character and is in al-Bukhari or Muslim; `gradeNote` is not empty; glossary terms are copied from the full text; every ﴿…﴾ in authored or transmitted text is found in the Qur'an (normalised, either edition); every «…» not found in the card's sacred text or the Qur'an is a warning to check by hand; five steps in the fixed order, 8–30 s each; a `verified` card has a report, a date and the stage-one checks true; an `approved` card has the reviewer's name and date and every check true; `approval` is empty unless approved; re-applying every edit in `content/edits/` leaves each card unchanged.

## The review gate

`build-content` includes cards at `CONTENT_MIN_LEVEL` or above (`verified` by the owner's decision ٦; `approved` once a reviewer exists). It fails if the welcome dua (`WELCOME_DUA_ID` in `src/config.ts`) is not included, or if fewer than `CONTENT_MIN_COUNT` cards pass (default 1; the launch minimum, decision ١٠, is 60). `CONTENT_PREVIEW=1` includes every card; the app marks those below the gate «مسودة» and shows placeholders in `danger`.

The app receives each card without its review report, with `level` (its status), `isDraft` and `searchExtra`, plus `levelCounts`, which «عن المحتوى» reads. The bundle is loaded with a dynamic `import()`, as its own chunk.

## Daily rotation

`src/lib/daily.ts`: everyone sees the same dua on the same local date (`pool[dayNumber mod n]`, pool sorted by `order`, without the welcome dua), changing at local midnight. The welcome dua is shown until the user completes it and for the rest of that day. A card's optional `effectiveFrom` ("YYYY-MM-DD") holds it out of the rotation until that day.
