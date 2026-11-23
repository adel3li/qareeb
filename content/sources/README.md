# Sources

Files here are copied verbatim from their sources and never edited by hand. The scripts read them by reference (surah and ayah); nothing in a card is typed.

| File | What | Source | Licence | Fetched |
|---|---|---|---|---|
| `quran-qpc-hafs.json` | The King Fahd Complex text (`text_qpc_hafs`) of every verse, by `"surah:ayah"`. **Shown to users**, in the KFGQPC Uthmanic Script HAFS font (decision ٤) | `https://api.quran.com/api/v4/quran/verses/qpc_hafs` | **To be confirmed before public launch** (decision ٤): the Complex's font page states no licence; the terms of `api.quran.com` and of the font (from the open quran.com repository) must be read or the Complex asked. The ready fallback is Amiri Quran with Tanzil's Uthmani text (`src/config.ts`, `QURAN_EDITION`) | 2026-11-23 |
| `quran-uthmani.txt` | Tanzil Uthmani text, `surah\|ayah\|text`. Second source: `fetch-quran` compares its letters with the King Fahd text | `https://tanzil.net/pub/download/index.php?quranType=uthmani&outType=txt-2` | Tanzil Project, Creative Commons Attribution 3.0: verbatim copies only, no changes; the source (Tanzil Project) clearly indicated with a link to tanzil.net; the copyright block kept in the file (it is, at its end) | 2026-11-23 |
| `quran-simple.txt` | Tanzil Simple text (modern spelling, full vowels). **For search only**, never shown | `https://tanzil.net/pub/download/index.php?quranType=simple&outType=txt-2` | Same as above | 2026-11-23 |

Notes:

- Tanzil writes the basmala before verse 1 of every surah except al-Fatiha and at-Tawba; `scripts/lib/quran.ts` removes it when reading, because it is not part of the verse.
- The two texts' letters match in every verse after marks are removed, except one known encoding difference of the standalone hamza (2:72), which the comparison ignores.
- **Hadith** are not stored here. `scripts/fetch-hadith.ts` reads the open sunnah.com dataset (`https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/ara-<collection>.min.json`) by collection number and copies the narration into the card, with the sunnah.com page in `hadith.sourceUrl`. Dorar (dorar.net) is the second source, required for `approved` and added by hand (it refuses requests from the cloud environment).
