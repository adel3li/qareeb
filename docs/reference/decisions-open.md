# Open decisions in the code

Decisions that are the owner's, not the developer's. Each is built so it changes with one line.

| Decision | Where it changes | Now |
|---|---|---|
| Terms of use of the KFGQPC font and the King Fahd Complex text (decision ٤) | `QURAN_EDITION` in `src/config.ts`; the fallback (Amiri Quran with Tanzil Uthmani) also needs the font in `public/fonts` and `fetch-quran` run with that edition | `kfgqpc` |
| Domain (decision ٧): user data is tied to the address | `SITE_URL` and `APP_URL` for `scripts/build-landing.ts`; the app itself uses relative URLs and needs no change | Vercel's free address; landing links to `./app/` |
| Whether living a dua from the library records a day (`02` §6, «والقرار لك») | `LIBRARY_LIVE_RECORDS_DAY` in `src/config.ts` | Off: only today's dua records the day |
| The scholarly reviewer (decision ٨ in `00` §٨) | Their name goes in each card's `review.approval`; «عن المحتوى» switches to its approved sentence only when every card shown is `approved` | Not named; the sentence says the review is in progress |
| Content level shown in production (decision ٦) | `CONTENT_MIN_LEVEL` (env, default `verified`) and `CONTENT_MIN_COUNT` (env, default 30) for `scripts/build-content.ts` | `verified`, at least 30 |
| Contact address in Settings and on the landing page (`07`) | `CONTACT_EMAIL` in `src/config.ts` | Empty: no contact row is shown |
| Showing each card's review status to users (`00` §٩: «اختياري، ويُقرر مع التصميم») | Not built: production shows only `verified` and above, and «عن المحتوى» states the level of everything shown | No per-card label in production |
| Grading rule beyond the two Sahihs (decision ٧, option B ready) | `CURRENT_SCOPE` in `src/lib/hadithGrade.ts` | `sahihayn` |
| The `.ics` reminder on iPhone and Android (`02` §8: «تُجرَّب … قبل اعتمادها») | If iOS does not offer «Add to Calendar» for a generated file, serve pre-built files per half hour (`src/lib/calendarReminder.ts` explains) | Generated on the device |
