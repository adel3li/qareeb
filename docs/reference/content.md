# Content: cards, scripts and the review gate

The content model is in `docs/handoff/03-content-model.md`; this page documents the code as built.

## Files

| Path | What |
|---|---|
| `content/duas/dua_NNNN.json` | One card per file. The file name is the id. Ids are never reused |
| `content/retired-ids.json` | Ids that were used and removed. `validate-content` refuses them forever |
| `content/sources/` | The Qur'an texts, verbatim, with their licences (`content/sources/README.md`) |
| `src/content/schema.ts` | Zod schemas of a card (`duaSchema`, strict: an unknown field is an error) and of the built file |
| `src/content/types.ts` | The TypeScript types inferred from them, and `LEVEL_RANK` |
| `src/content/generated/duas.json` | Written by `build-content`; not in git |

Fields added to the blueprint's model: `hadith.collectionId` (`bukhari` or `muslim`: the dataset id `fetch-hadith` uses), `effectiveFrom` (the local day a card joins the rotation, `src/lib/daily.ts`), `whenToSay.intention` (the intention tile pre-selected when the source names a time), and `searchText` in the built file only.

## Scripts

| Command | Script | Does |
|---|---|---|
| `bun run fetch-quran [ids]` | `scripts/fetch-quran.ts` | Fills `quran.fullText` from `quran-qpc-hafs.json` by surah and `ayahFrom..ayahTo` (verses joined by one space; each ends with its number, drawn inside the end-of-verse mark by the font) and sets `quran.edition`. Compares the letters with Tanzil Uthmani and warns on a difference. Checks that `text` is a verbatim part of the verses. **Never writes `text`** |
| `bun run fetch-hadith [ids]` | `scripts/fetch-hadith.ts` | For `bukhari` and `muslim` only (`decide()` in `src/lib/hadithGrade.ts`), fills `hadith.fullNarration` from the open sunnah.com dataset by the collection's number (the first narration under that number), `hadith.gradings` as recorded, and `hadith.sourceUrl` (the sunnah.com page by its in-book reference). Refuses a narration with a corrupted character: it must be copied from a second source by hand. **Never writes `text`** |
| `bun run validate-content` | `scripts/validate-content.ts` | Every check of `03` §7 (below). Exit 1 on any error |
| `bun run content` | `scripts/build-content.ts` | Validates, then writes the generated file behind the gate. `dev`, `lint`, `test` and `build` run it first |

The excerpt of a verse or narration that is the dua (`text`) is the reviewer's decision. Until it is made, `text` is a placeholder such as `<<يُنسخ من المصدر: سورة الأنبياء ٨٧، والمقطع يحدده المراجع>>`. Once decided, it is copied from `fullText` or `fullNarration` (never typed), and both fetch scripts and `validate-content` check it is a verbatim part of them.

## What `validate-content` checks

- Structure: the strict Zod schema.
- Ids: unique, equal to the file name, never a retired id; orders unique; the welcome card (`WELCOME_DUA_ID` in `src/config.ts`) exists.
- Kind: `quran` cards have `quran`, `sunnah` cards have `hadith`, and not the other way; `athar` is refused until phase three.
- Qur'an: `quran.fullText` equals the source file for those verses (run `fetch-quran`, never edit); `text` is a part of it.
- Hadith: in the current scope (al-Bukhari and Muslim); `fullNarration` present and without a corrupted character; `text` is a part of it; `gradeNote` not empty (the grade is `صحيح` or `حسن` by the schema).
- Quotations in authored text (hook, scene line, retelling, meaning, reflections, steps, journal prompt, when-to-say): every `﴿…﴾` fragment is found in the Qur'an (letters only, against the King Fahd text and both Tanzil texts); every `«…»` fragment is found in the card's narration (an error in a `verified` or `approved` card, a warning in a draft).
- Placeholders `<<…>>` and `[[…]]`: allowed only in `draft`, `pending_verification` and `needs_changes`.
- Steps: exactly five, in the order presence, scene, meaning, need, supplicate, each 8 to 30 seconds.
- Review: `verified` needs `verification.by`, `.at` and `.report`, and every check true except the reviewer's own (`excerptApproved`, `authoredReviewed`, and for hadith `secondSourceMatched`, the Dorar match). `approved` needs every check true and `approval.reviewer` and `.at`. `approval` stays empty on any other status. Claude never sets `approval` or `approved`.

## The gate: production and preview

| Build | Command | Cards included | Minimum |
|---|---|---|---|
| Production | `bun run build` (sets `CONTENT_GATE=strict`) | Those at `CONTENT_MIN_LEVEL` or above: `verified` now (decision ٦), `approved` once a named reviewer exists | Fails while fewer than `CONTENT_MIN_COUNT` (30) pass |
| Preview | `CONTENT_PREVIEW=1 bun run build` | Every card, drafts included and marked | None |
| Dev, lint, tests | `bun run dev`, `lint`, `test` | As production, or every card with `CONTENT_PREVIEW=1` | Reported, not enforced |

`counts` in the built file holds how many cards reached each status, read from the data; «عن المحتوى» shows those numbers.

While no card is `verified`, the production build stops (CI's "production content gate" job is expected to fail and does not block the other checks), and a dev server without `CONTENT_PREVIEW=1` has no cards. Run `CONTENT_PREVIEW=1 bun run dev` to work with the drafts.

## How drafts display in preview builds

- A «مسودة» chip on the card.
- When a draft's `text` is still a placeholder, the app shows the **full copied verse or narration** (`quran.fullText` or `hadith.fullNarration`) inside `SacredText`, with a visible «مسودة» note saying the excerpt is not chosen yet. It never shows a cut it chose itself.
- Any other placeholder (`<<…>>`, `[[…]]`) in a field is shown as is, in a warning style, so it cannot be mistaken for content.
- Authored text in the three draft cards begins with «[نص تجريبي]».

Production builds never contain a draft: the gate removes them before the app sees them.

## Review levels

```
draft → pending_verification → verified → approved
                  ↓                 ↓
            needs_changes  ←────────┘   (back to pending_verification after changes)
```

1. **verified**: source verification by Claude, with a report in `review.verification` (what was checked, against which source with a link, what could not be checked and why, questions for the reviewer).
2. **approved**: the named scholarly reviewer, in `review.approval`.

The interface never says the content was reviewed by scholars unless every card shown is `approved`; `check-promises` looks for such wording.

## The draft cards now in the repository

| Id | Order | Kind | Source | Status |
|---|---:|---|---|---|
| `dua_0001` | 1 | quran | al-Fatiha 6–7, the welcome dua (decision ٢). Cites Sahih Muslim 395 in `context.basis` | draft |
| `dua_0002` | 2 | quran | al-Anbiya 87 | draft |
| `dua_0003` | 3 | sunnah | Sahih Muslim 2705 (first narration under that number) | draft |

Their sacred text was copied by `fetch-quran` and `fetch-hadith`; their `text` is a placeholder; their authored layer is marked «[نص تجريبي]»; meaning and sources still hold placeholders for the researcher.
