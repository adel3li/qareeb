# Content

The model and the review process are in `docs/handoff/03-content-model.md`; this file documents the code that implements them.

## Files

| Path | What |
|---|---|
| `content/duas/dua_NNNN.json` | One card per file. The file name is the id |
| `content/sources/` | The copied Qur'an texts and their licences (see its `README.md`). Never edited |
| `content/retired-ids.json` | Ids that were removed and may never be reused |
| `content/edits/` | Records of how the three cards were filled and verified on the earlier branch (word ranges into the copied text). Kept as provenance; no script reads them now |
| `src/content/schema.ts` | The Zod schema of a card, shared by the scripts and the app; `AppDua` and `ContentFile` for the generated file |
| `src/content/generated/duas.json` | Written by `build-content`; git-ignored; loaded by the app as its own chunk (`src/content/load.ts`) |

## Scripts

| Command | What it does |
|---|---|
| `bun run fetch-quran [ids…] [--check]` | Copies `quran.fullText` from `content/sources/quran-qpc-hafs.json` (King Fahd Complex, `text_qpc_hafs`) by surah and ayah, joined by one space, and sets `quran.edition`. Compares the letters with Tanzil's Uthmani text (`scripts/lib/quran.ts`, `quranLetters`: marks, small letters, tatweel and numbers removed, hamza seats and alef forms folded); all 6236 verses match (`scripts/quran.test.ts`). A card whose `text` is a placeholder gets the whole range; otherwise `text` must already be a verbatim part (the excerpt is the reviewer's decision) |
| `bun run fetch-hadith [ids…] [--check]` | Copies `hadith.fullNarration` and `hadith.gradings` from the open sunnah.com dataset (`fawazahmed0/hadith-api`) by collection and number; uses the sunnah.com page in `hadith.sourceUrl` (book/hadith) to pick the narration, else the first narration under the number. Refuses collections outside al-Bukhari and Muslim (`decide()` in `src/lib/hadithGrade.ts`) and any text with a corrupted character (to be pasted from a second source). Needs the network |
| `bun run validate-content` | The checks of 03 §7 (`scripts/lib/validate.ts`): structure (strict Zod), ids (unique, file name, not retired), unique order, the Qur'an text equal to the source and its letters equal to Tanzil, `text` a verbatim part of the verses or the narration, hadith scope and corrupted characters, glossary terms taken from the dua, every ﴿…﴾ in authored text found in the Qur'an and every «…» found in the card's sacred text, placeholders (`<<…>>`, `[[…]]`: an error from `verified` on, a warning in drafts), the five steps in order with 8–30 s, and the review gate (below) |
| `bun run build-content` | The review gate: writes the cards at `CONTENT_MIN_LEVEL` or above (default `verified`, decision ٦), without their verification report, with their `level` and a `searchText` (titles, the dua, and Tanzil's simple spelling of the verses, for search only). `CONTENT_PREVIEW=1` includes every card and marks the build as preview. `CONTENT_MIN_COUNT` (default 1) fails the build below that many cards |

`bun run build` runs `validate-content` and `build-content` before `vite build`.

## Review gate

| Status | Needs |
|---|---|
| `verified` | `review.verification.at` and a report; checks `textMatchesSource`, `referenceCorrect`, `gradeConfirmed`, `contextFaithful`, `meaningSourced`, `quotedFragmentsMatch` |
| `approved` | All of the above, `review.approval.reviewer` and `review.approval.at`, and all nine checks (including `excerptApproved`, `authoredReviewed`, `secondSourceMatched`) |

`review.approval` filled on a card that is not `approved` is an error. Claude never sets `approval` or `approved`.

## In the app

- Sacred text is shown only through `src/components/SacredText.tsx` (`SacredText` in the arch; `SacredTerm` for glossary words; `FullNarration` for the full hadith). Qur'an text in the KFGQPC HAFS face between ﴿ ﴾, hadith in Noto Sans Arabic 500 between « ».
- «عن المحتوى» reads the counts by level from `meta.levels` and says «طابقنا كل نص مع مصدره، والمراجعة العلمية جارية» unless every card shown is `approved`.
- In a preview build: a banner, a «مسودة» chip on cards below `verified`, and placeholders shown in the warning colour (`Authored`).
- Today's dua: `resolveToday` in `src/lib/daily.ts` (welcome dua `WELCOME_DUA_ID` in `src/config.ts` until it is lived, then the rotation by `order`, `effectiveFrom` supported).
- `whenToSay.intention` (optional) pre-selects that tile in the intention step when the source names the moment. None of the current cards sets it.

## Current cards

| Id | Kind | Status |
|---|---|---|
| `dua_0001` | Qur'an, al-Fatiha 6–7 (welcome dua) | verified |
| `dua_0002` | Qur'an, al-Anbiya' 87 | verified |
| `dua_0003` | Sunnah, Muslim 2705 | verified |
| `dua_0004` | Qur'an, al-Baqara 127 (whole range; excerpt proposed) | verified |
| `dua_0005` | Qur'an, al-Baqara 128 (whole range; excerpt proposed) | verified |
| `dua_0006` | Sunnah, Muslim 918 (excerpt proposed) | pending_verification |
| `dua_0007` | Qur'an, al-Baqara 129 (whole range; excerpt proposed) | verified |
| `dua_0008` | Qur'an, al-Baqara 201 (whole range; excerpt proposed) | verified |
| `dua_0009` | Sunnah, Muslim 920 (excerpt proposed) | pending_verification |
| `dua_0010` | Qur'an, al-Baqara 250 (whole range; excerpt proposed) | verified |
| `dua_0011` | Qur'an, al-Baqara 286 (whole range; excerpt proposed) | verified |
| `dua_0012` | Sunnah, Bukhari 6306 (excerpt proposed) | pending_verification |
| `dua_0013` | Qur'an, Al Imran 8 (whole range; excerpt proposed) | verified |
| `dua_0014` | Qur'an, Al Imran 35 (whole range; excerpt proposed) | verified |
| `dua_0015` | Sunnah, Muslim 2725 (excerpt proposed) | pending_verification |
| `dua_0016` | Qur'an, Al Imran 38 (whole range; excerpt proposed) | verified |
| `dua_0017` | Qur'an, Al Imran 147 (whole range; excerpt proposed) | verified |
| `dua_0018` | Sunnah, Bukhari 143 (excerpt proposed) | pending_verification |
| `dua_0019` | Qur'an, Al Imran 173 (whole range; excerpt proposed) | verified |
| `dua_0020` | Qur'an, Al Imran 191–194 (whole range; excerpt proposed) | verified |
| `dua_0021` | Sunnah, Bukhari 6334 (excerpt proposed) | pending_verification |
| `dua_0022` | Qur'an, al-A'raf 23 (whole range; excerpt proposed) | verified |
| `dua_0023` | Qur'an, al-A'raf 89 (whole range; excerpt proposed) | verified |
| `dua_0024` | Sunnah, Muslim 2697 (excerpt proposed) | pending_verification |
| `dua_0025` | Qur'an, al-A'raf 126 (whole range; excerpt proposed) | verified |
| `dua_0026` | Qur'an, al-A'raf 151 (whole range; excerpt proposed) | verified |
| `dua_0027` | Sunnah, Muslim 2721 (excerpt proposed) | pending_verification |
| `dua_0028` | Qur'an, Yunus 85–86 (whole range; excerpt proposed) | verified |
| `dua_0029` | Qur'an, Hud 47 (whole range; excerpt proposed) | verified |
| `dua_0030` | Sunnah, Bukhari 2893 (excerpt proposed) | pending_verification |
| `dua_0031` | Qur'an, Yusuf 33 (whole range; excerpt proposed) | verified |
| `dua_0032` | Qur'an, Yusuf 86 (whole range; excerpt proposed) | verified |
| `dua_0033` | Sunnah, Bukhari 6346 (excerpt proposed) | pending_verification |
| `dua_0034` | Qur'an, Yusuf 101 (whole range; excerpt proposed) | verified |
| `dua_0035` | Qur'an, Ibrahim 35 (whole range; excerpt proposed) | verified |
| `dua_0036` | Sunnah, Bukhari 6382 (excerpt proposed) | pending_verification |
| `dua_0037` | Qur'an, Ibrahim 37 (whole range; excerpt proposed) | verified |
| `dua_0038` | Qur'an, Ibrahim 40–41 (whole range; excerpt proposed) | verified |
| `dua_0040` | Qur'an, al-Isra' 24 (whole range; excerpt proposed) | verified |
| `dua_0041` | Qur'an, al-Isra' 80 (whole range; excerpt proposed) | verified |
| `dua_0043` | Qur'an, al-Kahf 10 (whole range; excerpt proposed) | verified |
| `dua_0044` | Qur'an, Maryam 4 (whole range; excerpt proposed) | verified |
| `dua_0046` | Qur'an, Ta-Ha 25–28 (whole range; excerpt proposed) | verified |
| `dua_0047` | Qur'an, Ta-Ha 114 (whole range; excerpt proposed) | verified |
| `dua_0049` | Qur'an, al-Anbiya' 83 (whole range; excerpt proposed) | verified |
| `dua_0050` | Qur'an, al-Anbiya' 89 (whole range; excerpt proposed) | verified |
| `dua_0052` | Qur'an, al-Mu'minun 29 (whole range; excerpt proposed) | verified |
| `dua_0053` | Qur'an, al-Mu'minun 97–98 (whole range; excerpt proposed) | verified |
| `dua_0055` | Qur'an, al-Mu'minun 118 (whole range; excerpt proposed) | verified |
| `dua_0056` | Qur'an, al-Furqan 74 (whole range; excerpt proposed) | verified |
| `dua_0058` | Qur'an, al-Shu'ara' 83–85 (whole range; excerpt proposed) | verified |
| `dua_0059` | Qur'an, al-Shu'ara' 169 (whole range; excerpt proposed) | verified |
| `dua_0061` | Qur'an, al-Naml 19 (whole range; excerpt proposed) | verified |
| `dua_0062` | Qur'an, al-Qasas 16 (whole range; excerpt proposed) | verified |
| `dua_0064` | Qur'an, al-Qasas 21 (whole range; excerpt proposed) | verified |
| `dua_0065` | Qur'an, al-Qasas 22 (whole range; excerpt proposed) | verified |
| `dua_0067` | Qur'an, al-Qasas 24 (whole range; excerpt proposed) | verified |
| `dua_0068` | Qur'an, al-Saffat 100 (whole range; excerpt proposed) | verified |
| `dua_0070` | Qur'an, al-Ahqaf 15 (whole range; excerpt proposed) | verified |
| `dua_0071` | Qur'an, al-Qamar 10 (whole range; excerpt proposed) | verified |
| `dua_0072` | Qur'an, al-Hashr 10 (whole range; excerpt proposed) | verified |
| `dua_0073` | Qur'an, al-Tahrim 11 (whole range; excerpt proposed) | verified |
| `dua_0074` | Qur'an, al-Mumtahana 4–5 (whole range; excerpt proposed) | verified |
| `dua_0075` | Qur'an, Nuh 28 (whole range; excerpt proposed) | verified |
| `dua_0076` | Qur'an, al-Tahrim 8 (whole range; excerpt proposed) | verified |
| `dua_0077` | Qur'an, al-Furqan 65–66 (whole range; excerpt proposed) | verified |
