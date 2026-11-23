# Architecture as built

React 19, TypeScript strict, Vite 8, Tailwind v4, Zustand 5, Zod 4, lucide-react, vite-plugin-pwa. Bun for scripts. No backend.

## Folders

| Path | What |
|---|---|
| `src/main.tsx` | Mounts the app inside the root error boundary; registers the service worker in production |
| `src/config.ts` | Settings the owner changes with one line: name, storage prefix, Qur'an edition, welcome id, library-records-a-day, text-size range, backup limit, privacy date, contact |
| `src/app/` | `App.tsx` (shell, lazy screens, overlays), `router.ts` (hash routes), `theme.ts` (appearance on `<html>` only), `ErrorBoundary.tsx`, `Toast.tsx` |
| `src/screens/` | `today/` (Today, the card with its sections), `library/` (Library, DuaPage), `notebook/`, `calendar/`, `settings/`, `onboarding/` |
| `src/features/` | `live-dua/` («عِش الدعاء»), `share/` (sheet and canvas), `backup/`, `dua-actions.ts` (copy text, links) |
| `src/components/` | The design-system components rebuilt on the tokens: Button, IconButton, Chip, SacredText, DuaCard, Disclosure, StatusBanner, EmptyState (with Door), TopBar, TabBar, ProgressDots, SegmentedControl, Switch, TextField, TextSizeStepper, ChoiceGrid, ListRow, JournalEntry, HijriCalendar, Dialog (sheet, screen, alert; ConfirmDialog), PacedText, Wordmark, Icon, Authored |
| `src/lib/` | Pure logic with tests: dates, daily, hijri, hijriLabel, arabic, arabicSearch, calendarReminder, hadithGrade, liveDua (state machine), library, notebook, reference, placeholders, fontScale, shareLayout; and `useDialog` |
| `src/state/` | `keys.ts`, `stores.ts` (one persisted store per key), `migrations.ts`, `ui.ts` (transient overlay state), `types.ts` |
| `src/content/` | `schema.ts` (Zod), `types.ts`, `constants.ts`, `load.ts` (dynamic import of the generated content chunk) |
| `src/copy/ar.ts` | Every interface string |
| `src/styles/` | `tokens.css` (generated from `design/system/tokens.json`), `app.css` (Tailwind `@theme` mapping and the few utilities: `arch`, `glow`, `fade-in`) |
| `scripts/` | Content pipeline and promise checks (`docs/reference/content.md`) |
| `tests/e2e/` | Playwright |

## Routes

`#/today`, `#/library`, `#/notebook`, `#/calendar`, `#/settings`, `#/dua/:id`. Anything unknown goes to Today; a malformed dua id to the library. Every screen is a lazy chunk; the content is its own chunk. The four tabs are a bottom bar on phones and move into the top bar at 48rem (768px) and wider.

## Theming

Tokens only. `app.css` removes Tailwind's default palette and fonts and maps the semantic variables: colours as `--color-*` (`bg-surface`, `text-text-muted`, `border-hairline`…), type styles as `--text-t-*` (`text-t-body`, `text-t-title`…), faces as `font-q-ui`, `font-q-heading`, `font-q-quran`. Sizes, radii and durations are used straight from the variables (`rounded-(--radius-card)`, `h-(--button-height)`, `duration-(--duration-fast)`). The theme is `data-theme` on `<html>` only; «تلقائي» removes it and follows `prefers-color-scheme`. The text size is the root font size; every type style is rem.

`scripts/check-promises.ts` fails on any hex, `rgb(` or `hsl(` colour or Tailwind palette name in `src/` outside `tokens.css`. The share canvas reads its colours from the computed variables at draw time.

## Overlays

Every overlay is `Dialog` (`src/components/Dialog.tsx`): a portal into `document.body`, `role="dialog"` (or `alertdialog`), `aria-modal`, focus trapped and returned, Escape and the scrim close it, page scroll locked (`useDialog`). «عِش الدعاء» is a `screen` dialog; the share sheet can open over it, and the flow suspends its keyboard handling meanwhile. No screen root has `transform`, `filter` or `animation-fill-mode: forwards`.

## «عِش الدعاء»

`src/lib/liveDua.ts` is the state machine: `step 0..4 → intention → notebook → myDua → closing`. One interval timer per step (`useStepTimer`, 2.8 s per sentence) reveals the next sentence; «التالي» waits (`aria-disabled`) until every sentence is shown or the step's duration has passed; «أظهر النص كاملًا» shows all and stops the timer, and nothing hides text again. Sentences are split by `splitSentences` (no lookbehind). The completion is recorded when the closing is reached, with the dua id and the day the flow was opened on; closing earlier records nothing, and unsaved writing is kept in `qareeb:drafts:v1` and confirmed before closing. The repeat counter appears only when the card has `repeatCount`. The reminder of three open needs follows the `showMyDuasInFlow` setting.

## Daily dua

`resolveToday` (`src/lib/daily.ts`): the welcome dua until it is lived, shown as done for the rest of that day, then the rotation (`pool[dayNumber mod n]`, ordered by `order`, `effectiveFrom` respected). Today re-reads the day every minute and on returning to the tab (`useLocalDay`), so it rolls over at midnight without a reload. What was lived today is shown by its stored id.

## Offline and install

`vite-plugin-pwa` (generateSW) precaches the app, fonts, icons and the content chunk; navigation falls back to `index.html`. The manifest carries the `any` and `maskable` icons; `index.html` carries the apple-touch icon and the iOS startup images for each device size (light and dark), generated by `scripts/render-splash.ts`.
