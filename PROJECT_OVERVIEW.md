# Qareeb (قريب): project overview

The starting point for anyone joining the project. Written on 27 November 2026 from a read-only survey of the repository, its branches and its pull requests. Nothing was merged or changed apart from adding this file.

> **The most important fact:** nothing is merged. The default branch (`claude/elegant-noether-v4i8dc`) holds only the docs and the design system. All app code and content live in **five open draft PRs**. Three of them (#1, #2, #3) are **competing builds of the same app**, and the content PRs (#4, #5) are stacked on #2.

---

## 1. What the project is

**قريب (Qareeb)**, "Near", named after al-Baqara 186. An Arabic-only, right-to-left, mobile-first web app that shows **one supplication (du'a) a day from the Qur'an and the Sunnah**. Each du'a comes with the situation it was said in, its meaning, short reflections and a five-step guided experience («عِش الدعاء», "live the du'a") before the user makes it.

- Sister app of **Alhamd** (الحمد, one blessing a day). The lessons from its mistakes are in `docs/handoff/06-lessons-from-alhamd.md`.
- **Promises:** no account, no backend, no network requests from the app. All user data stays in `localStorage`. No streaks, points, badges or percentages of days. Installable PWA that works offline.
- **Goal for v1:** at least 60 cards shown at launch (two months with no repeat), 30 more in the queue. The long-term target is 365.
- **Sacred-text integrity is the core rule.** Verses and hadith are copied by script from their sources and never typed or paraphrased. Content passes a two-stage review: `verified` (source check by Claude) and then `approved` (a named scholar, not yet appointed).

## 2. Tech stack

The stack as built on the PR branches. The default branch has no app code yet.

| Layer | Choice |
|---|---|
| Runtime and package manager | **Bun** (CI pins 1.4.4) |
| App | **React 19**, **TypeScript strict**, **Vite 8** |
| Styling | **Tailwind v4** mapped onto semantic design tokens (`src/styles/tokens.css`, generated from `design/system/tokens.json`). Tailwind's default palette is removed |
| State | **Zustand** `persist`, one store per `localStorage` key (`qareeb:name:v1`) |
| Validation | **Zod** (content schema, backup import) |
| PWA | `vite-plugin-pwa` / Workbox, manifest, maskable icons, iOS splash images |
| Icons | `lucide-react` |
| Tests | **Vitest** (unit, run in Asia/Riyadh, UTC and America/New_York) and **Playwright** (e2e, axe) |
| CI | GitHub Actions, `.github/workflows/ci.yml`: lint, unit tests in 3 time zones, `validate-content`, `check-promises`, build, e2e |
| Hosting | **Vercel**, free plan. Project `adel3lis-projects/qareeb`, with `vercel.json` setting a strict CSP and security headers |
| Fonts | Noto Sans Arabic and Noto Kufi Arabic (UI), Reem Kufi (wordmark), **KFGQPC Uthmanic Script HAFS** (Qur'an text), all self-hosted |

### Run, build and deploy

These commands work on the PR branches, for example `claude/qareeb-build` or `claude/qareeb-content-batch-2`.

```bash
bun install
bun run dev                       # builds content, then Vite on http://localhost:5173/
bun run lint                      # build-content + tsc --noEmit (strict)
bun run test                      # vitest
bun run e2e -- --trace off        # Playwright on the production build
bun run validate-content          # schema, sacred-text and review checks on content/duas
bun run check-promises            # product promises as code checks
bun run build                     # production: only cards at CONTENT_MIN_LEVEL (verified) or above
CONTENT_PREVIEW=1 bun run build   # preview: drafts included and marked
bun run build-landing             # static landing page into dist-landing/
bun run fetch-quran / fetch-hadith  # copy sacred text into cards by reference
```

Design tooling, on every branch:

```bash
node design/tools/build-tokens.mjs   # tokens.json -> tokens.css
node design/tools/contrast.mjs       # checks the 29 promised colour pairs in both themes
python3 design/tools/build-brand.py  # logo, icons, splash SVGs (needs fonttools brotli uharfbuzz)
node design/tools/render-icons.mjs   # PNG icons, splash images, OG image
```

**Deploy:** Vercel's GitHub integration builds every push and PR (`buildCommand: bun run build`, output `dist`). Production follows Vercel's production branch, which is presumably the default branch and so has no app yet.

### Environment variables (names only, no secrets)

There are no secrets. The app makes no network calls, and none of these variables is a secret:

| Name | Used by | Purpose |
|---|---|---|
| `CONTENT_MIN_LEVEL` | `scripts/build-content.ts` | Lowest review level shipped. Default `verified` (decision 6) |
| `CONTENT_PREVIEW` | build-content | `1` includes drafts, marked |
| `CONTENT_MIN_COUNT` | build-content | Build fails below this many shipped cards. Default 1; 60 is proposed for launch |
| `LANDING_APP_URL`, `LANDING_SITE_URL` | `scripts/build-landing.ts` | URLs the landing page links to |
| `CI` | Playwright config | CI mode |

One-line product switches live in `src/config.ts`: `QURAN_EDITION`, `WELCOME_DUA_ID`, `APP_URL_FALLBACK` (`https://qareeb.vercel.app/`), `CONTACT_EMAIL` (empty), font scale and backup limits.

## 3. Structure

### On the default branch (`claude/elegant-noether-v4i8dc`, same commit as `claude/wizardly-hopper-aknc89`)

| Path | What |
|---|---|
| `CLAUDE.md` | Project rules for Claude Code. It describes the code layout of the PR branches, which doesn't exist on this branch yet |
| `docs/handoff/` | The starting kit, in Arabic. Index in `README.md`, then: `00-decisions.md`, `01-product-brief.md`, `02-ux-and-screens.md` (every screen and flow), `03-content-model.md` (card schema, 3 content layers, review process), `04-seed-catalogue.md` + `04b-catalogue-verification.md`, `05-technical-blueprint.md` (architecture), `06-lessons-from-alhamd.md`, `07-roadmap-and-launch.md`, `08-kickoff-prompt.md`, `09-content-drafting-prompt.md`, `10-identity-brief.md`, `QAREEB_KIT.md` (single-file kit), `reusable-code/` (tested modules from Alhamd: dates, daily, hijri, arabicSearch, calendarReminder, hadithGrade, useDialog), `templates/`, `tools/` |
| `design/README.md` | The visual identity, «الباب المفتوح» (the open door), and what is left |
| `design/system/` | The design system: `tokens.json` (the only source of tokens), brand book (`README.md`, `logo.md`, `sacred-text.md`, `voice.md`), 22 components each with `README.md` and `preview.html`, fonts with licences |
| `design/tokens.css` | Generated from `tokens.json`. Don't edit it by hand |
| `design/brand/` | Wordmark, lockup, door mark, app icons, splash screens, OG image (SVG and PNG) |
| `design/tools/` | Token, contrast, brand and sacred-text scripts |
| `design/explorations/` | The three candidate directions (sahar, bab, hibr). Kept for history only |

### On the app branches (layout of `claude/qareeb-build` / `claude/qareeb-content-batch-2`)

| Path | What |
|---|---|
| `src/app/` | Shell, hash routing, error boundary, tab bar, PWA registration |
| `src/screens/` | One folder per screen: onboarding, Today, library, dua page, notebook, المداومة (calendar), settings |
| `src/features/` | `live-dua/` (5-step flow), `share/` (canvas share card), `backup/` |
| `src/components/` | Shared UI: `Dialog`, `SacredText`, `DuaCard`, `Button`… |
| `src/lib/` | Pure logic with tests: dates, daily selection, hijri, Arabic search, hadith grading, live-flow state machine, backup |
| `src/state/` | Stores, `keys.ts` (key registry), migrations, schemas |
| `src/content/` | Types, schema, loader for the generated content |
| `src/copy/ar.ts` | All interface text |
| `src/config.ts` | One-line decisions |
| `content/duas/` | The dua cards (179 on the content-batch-2 branch) |
| `content/sources/` | Qur'an source texts: `quran-qpc-hafs.json`, Tanzil simple and Uthmani |
| `content/edits/` | Recorded edits (excerpts, glossary) applied by word position |
| `scripts/` | `fetch-quran`, `fetch-hadith`, `validate-content`, `build-content`, `check-promises`, `build-landing`, `render-splash` |
| `docs/reference/` | `architecture.md`, `storage.md` (every `localStorage` key), `content.md`, `quran-coverage.md` |
| `docs/decisions.md` | The owner's decisions (copy of `00-decisions.md`) |
| `docs/screens/` | Reference screenshots (53 screens, light and dark) and `built/` |
| `landing/` | The static marketing page |
| `tests/` | Playwright specs |

## 4. Work history

All work was done by Claude Code sessions between 23 and 24 November 2026. Sessions are identified by the `Claude-Session` trailer in their commits.

| # | Session | Branch | PR | What was done | Status |
|---|---|---|---|---|---|
| 1 | `session_01Ya9qA456mxwtU9H7pinbLB` | `claude/elegant-noether-v4i8dc` (**default branch**) | none | Unpacked the starting kit into `docs/handoff/` and `CLAUDE.md`. Proposed 3 identity directions with tokens and contrast checks. After the owner chose "bab", made the logo, wordmark and app icons, then the full design system (tokens.json, brand book, 22 components, fonts, splash screens, OG image). Published the design system as Claude artifacts | **Done**. This is the base of every other branch |
| 2 | `session_01Ya9qA2fyhe1hDJGXN7uj8R` | `claude/qareeb-app` | [#1](https://github.com/adel3li/qareeb/pull/1) | **First full app build**: scaffold, content pipeline, stores, every screen and flow, sharing, PWA, e2e (28 tests) and unit tests (105), landing page, reference docs. Three cards filled and brought to `verified` | Open draft. **Superseded** by #2 and #3 in practice (see note below) |
| 2b | same session | `claude/qareeb-screens` | none | Screenshots of the PR #1 build (53 screens and states, light and dark) as the visual reference in `docs/screens/` | Done. Carried into `qareeb-build`. No PR of its own |
| 3 | `session_01Ya9qA58SEbSKxxXGkZkxUd` | `claude/qareeb-build` | [#2](https://github.com/adel3li/qareeb/pull/2) | **Second app build, written from scratch** on the design system, with `docs/screens/` as reference. Includes the screenshots commit, CI, Vercel headers, landing page, reference docs, a lint fix for fresh checkouts and `docs/screens/built/`. 96 unit tests, 14 e2e flows (which found and fixed 2 bugs). Vercel preview: qareeb-xi.vercel.app | Open draft. **The base the content work builds on** |
| 4 | `session_01Ya9qA4L4wkidzh6BFwfnNG` | `claude/qareeb-app-v2` | [#3](https://github.com/adel3li/qareeb/pull/3) | **Third app build, also from scratch** (no code copied from #1 or #2). Took the reference screens and content data from `qareeb-build`. 81 unit tests, 25 e2e tests, 34 iOS splash images | Open draft. A competing alternative to #2. Nothing is stacked on it |
| 5 | `session_01Ya9qA4tLuZxCxbZV9KvUFk` | `claude/qareeb-content-batch-1` (on `qareeb-build`) | [#4](https://github.com/adel3li/qareeb/pull/4) | **Content batch 1**: `dua_0004`–`dua_0100`, 100 cards in all. 63 Qur'an cards `verified`, 34 Sunnah drafts `pending_verification`. 23 cards are outside the seed catalogue and await the owner's confirmation. Production build: 66 cards | Open draft, stacked on #2 |
| 5b | same session | `claude/qareeb-content-batch-2` (on batch-1) | [#5](https://github.com/adel3li/qareeb/pull/5) | **Content batch 2**: `dua_0101`–`dua_0192`, 179 cards in all (82 `verified`: 81 Qur'an and 1 Sunnah; 97 pending). An audit of all 6236 verses for du'a passages (`docs/reference/quran-coverage.md`). The Sunnah scan of al-Bukhari and Muslim is close to exhausted | Open draft, stacked on #4. **The most advanced branch**: CI and Vercel preview green |
| 6 | `session_01Ya9qA5NBUASGYXNcqixqcK` (this one) | `claude/wizardly-hopper-aknc89` | none yet | This overview file | Done |

**Note on the three builds:** #1, #2 and #3 each implement the whole app independently against the same base. The owner hasn't chosen one in writing. The content PRs build on #2, so #2 is the de facto line. Choose one, merge it, then rebase or merge #4 and #5 and close the other two.

## 5. Decisions made, and why

From `docs/handoff/00-decisions.md`, copied to `docs/decisions.md` on the app branches. All were made on 23 November 2026.

| # | Decision | Why |
|---|---|---|
| 1 | Name **قريب**, code and storage prefix `qareeb` | From the du'a verse al-Baqara 186 ("I am near") |
| 2 | Welcome du'a: al-Fatiha 6–7, with the hadith qudsi in Muslim 395 | Every Muslim says it at least 17 times a day |
| 3 | Two-stage review: `verified` (Claude, source check) then `approved` (named scholar) | Alhamd shipped 100 unreviewed items with the gate off. The gate is on from day one here |
| 4 | Qur'an in **Uthmani script, Madina Mushaf font** (KFGQPC HAFS) with the King Fahd Complex text from api.quran.com. Tanzil's simple text is for search only | Reads like the printed mushaf. Tanzil's Uthmani text encodes marks differently, so it is never paired with this font. *Pending: the licence terms for the font and text* |
| 5 | Hosting on **Vercel's free address** for now | Quick start. User data is tied to the origin, so a later domain move needs a migration step, or the domain should be booked before real users arrive |
| 6 | Show cards at `verified` without waiting for the scholar (`CONTENT_MIN_LEVEL=verified`) | No reviewer yet. «عن المحتوى» must say honestly that texts were checked against sources and that scholarly review is ongoing |
| 7 | **Sunnah: al-Bukhari and Muslim only** for now. sunnah.com dataset as the source, Dorar as the second source required for `approved` | No grading disputes. Option B (al-Albani, with cases a major muhaqqiq disputes sent to the reviewer) is coded and tested in `hadithGrade.ts` for when the scope widens |
| 8 | Visual identity **«الباب المفتوح»** (the open door): stone and basalt, one turquoise for actions, an arch framing the du'a, and a wordmark whose final ب becomes a door threshold | Chosen by the owner from three directions |

Product-level choices in the brief: no stats in v1, the library shows only du'as already lived plus favourites, Qur'an and Sunnah interleaved, Companions and Salaf deferred to phase 3.

## 6. Open items, known issues, next steps

### Decisions waiting for the owner

1. **Choose the app build:** #1, #2 or #3. Merge it into the default branch, then land #4 and #5.
2. **Font and text licence:** KFGQPC font and King Fahd text (decision 4). The fallback is Amiri Quran with Tanzil's text, switched by one line (`QURAN_EDITION`).
3. **Domain:** book one before real users arrive. Available on 23 November: `qareebdua.app`, `qareebdua.com`. Otherwise build the "we moved" export/import banner.
4. **Scholarly reviewer:** not yet named. No card can reach `approved` without one.
5. Contact email (`CONTACT_EMAIL` is empty).
6. Whether living a non-today du'a from the library records a day (currently no).
7. `CONTENT_MIN_COUNT` for launch (60 proposed).
8. Per-card status labels in the UI.
9. **Content questions** listed in #4 and #5: the 23+ cards outside the catalogue, recited surahs as cards (al-Falaq, al-Nas), overlapping cards, sensitive subjects, wishing for death, `dua_0088` numbering (2654 or 2655), Yusuf 23, low-confidence passages (Ghafir 56, al-A'raf 149, al-Qalam 29–32).
10. Whether to **widen the hadith scope** beyond the two Sahihs. The Sahih scan is close to exhausted: an estimated 10–20 du'as remain.

### Known issues

- **Nothing is merged.** The default branch has no app, so the Vercel production deployment, if it tracks the default branch, has no app either.
- **CI runs on pushes to `main`, which doesn't exist.** The default branch is `claude/elegant-noether-v4i8dc`. CI runs on PRs only. Consider renaming the default branch to `main`, or changing the workflow trigger.
- `CLAUDE.md` on the default branch refers to `docs/decisions.md`, `docs/reference/` and `src/`, which exist only on the PR branches.
- **Sunnah cards are mostly drafts** (93 of 94 pending). Their excerpt (`text`) and glossary are placeholders until the reviewer picks the word range.
- **Dorar is unreachable from the cloud** (Cloudflare 403). `secondSourceMatched` is false on every Sunnah card, so `approved` is blocked. Options: open Dorar by hand at review time, or try from the owner's machine.
- The open sunnah.com dataset has corrupted characters in some narrations (for example Bukhari 834). The script refuses those narrations.
- Design contrast: `accent` text on `page` measures 4.21:1 in light mode, below 4.5:1 (noted in #1). It is still used for section labels.
- The Vercel free plan hit its limit of 100 deployments a day on 24 November, which turned PR statuses red for a day.

### Next steps (suggested order)

1. The owner picks the build. Merge it and the content PRs. Rename the default branch to `main`, or fix the CI trigger.
2. Resolve the licence and the domain. Set the Vercel production domain.
3. Get the Sunnah cards to `verified` (excerpts, glossary) so that production reaches 60 or more cards with a mix of Qur'an and Sunnah. Production has 82 now, almost all of them Qur'an.
4. Appoint the reviewer and add Dorar as the second source.
5. Go through the pre-launch checklist in `docs/handoff/07-roadmap-and-launch.md`.
6. Phase 2 (in `07`): browsing by need, curated paths, memorisation mode, a static page per du'a, an optional Capacitor app, and a bridge with Alhamd.

## 7. Important links

| What | Link |
|---|---|
| Repository | https://github.com/adel3li/qareeb |
| PRs | [#1](https://github.com/adel3li/qareeb/pull/1) · [#2](https://github.com/adel3li/qareeb/pull/2) · [#3](https://github.com/adel3li/qareeb/pull/3) · [#4](https://github.com/adel3li/qareeb/pull/4) · [#5](https://github.com/adel3li/qareeb/pull/5) |
| Vercel project | https://vercel.com/adel3lis-projects/qareeb |
| Preview, PR #2 (`qareeb-build`) | https://qareeb-xi.vercel.app |
| Preview, PR #5 (`qareeb-content-batch-2`) | https://qareeb-git-claude-qareeb-content-batch-2-adel3lis-projects.vercel.app |
| Planned production URL | `https://qareeb.vercel.app/` (fallback in `src/config.ts`, not confirmed live) |
| Design system (artifact) | https://claude.ai/artifact/Nprfohq9J9FaNnxoX5QjvT |
| UI screens board and the 3 directions (artifact) | https://claude.ai/artifact/H7rCeWhT8muVea9kr4jvfv |
| Screenshot gallery of PR #1 (artifact) | https://claude.ai/artifact/66d2V7aBbQNVgi5jHXxuLx |
| Sources | api.quran.com (`/api/v4/quran/verses/qpc_hafs`), Tanzil, sunnah.com via the `fawazahmed0/hadith-api` dataset, Dorar (second source, blocked from the cloud) |
