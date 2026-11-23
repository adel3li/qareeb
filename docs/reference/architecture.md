# Architecture

React 19, TypeScript strict, Vite, Tailwind v4, Zustand, Zod, Bun. No backend. The plan is `docs/handoff/05-technical-blueprint.md`; this is what was built.

## Layout

| Path | What |
|---|---|
| `src/main.tsx` | Mounts `App` inside the root `ErrorBoundary`; registers the service worker in production |
| `src/app/` | `App` (onboarding gate, shell, overlays), hash routes (`routes.ts`, `useRoute.ts`), `TabBar` and the wide `WideHeader`, `ScreenHeader`, `ErrorBoundary`, `useAppearance` (theme and text size on `<html>`), `useToday`, `overlays` (the guided flow and the share sheet, opened from any screen) |
| `src/screens/` | `onboarding/`, `today/`, `library/` (`Library`, `DuaPage`), `notebook/` (`Notebook`, `FoundList`, `MyDuasList`), `calendar/`, `settings/` (`Settings`, `InfoSheets`). Each is loaded lazily |
| `src/features/` | `live-dua/` (the flow), `share/` (canvas image and sheet), `backup/` (export, import sheet) |
| `src/components/` | The design system in React: `Button`, `IconButton`, `Chip`, `SacredText`, `Dialog` (the one overlay: portal, `useDialog`), `Disclosure`, `SegmentedControl`, `Switch`, `TextField`/`TextArea`/`SearchField`, `TextSizeStepper`, `ChoiceGrid`, `ListRow`, `EmptyState`/`Door`, `StatusBanner`, `ProgressDots`, `Wordmark`, `Toast`, `DuaCard`, `DuaSections`, `Authored` |
| `src/lib/` | Pure logic with tests: `dates`, `daily`, `hijri`, `dayLabel`, `arabic`, `arabicSearch`, `calendarReminder`, `hadithGrade`, `liveFlow` (the flow's state machine), `backup`, `notebook`, `reference` (references and share text), `shareLayout` (wrapping and fitting for the image), `textSize`; plus `useDialog`, `download`, `clipboard` |
| `src/state/` | `keys.ts`, `schemas.ts`, `store.ts`, `migrations.ts`, `data.ts` (snapshot, restore, erase). See `storage.md` |
| `src/content/` | Schema, types, loader |
| `src/copy/ar.ts` | Every interface string |
| `src/styles/` | `tokens.css` (copied from `design/tokens.css`, generated from `design/system/tokens.json`) and `app.css` (Tailwind and the `@theme` mapping) |
| `src/config.ts` | Values that change with one line, each tied to a decision |

## Routes

`#/today` (default), `#/library`, `#/dua/:id`, `#/notebook`, `#/notebook/my-duas`, `#/calendar`, `#/settings`. Unknown routes show Today. The guided flow and the share sheet are overlays, not routes.

## Theming

Tokens are CSS variables on `:root`; the dark values apply under `prefers-color-scheme: dark` unless `<html data-theme="light">`, and under `<html data-theme="dark">`. `@theme inline reference` in `app.css` maps them to utilities without redefining them: colours as `bg-surface`, `text-text-muted`, `border-hairline`…; fonts `font-sans`, `font-kufi`, `font-mushaf`; type styles `text-t-title`, `text-t-body`, `text-t-quran`… (prefixed so they never meet the colour names); radii `rounded-card`…; `--spacing` is 4px so spacing never grows with the text-size setting, while type (rem) does. `arch` and `glow` are utilities. `check-promises` fails on a hex, `rgb(` or `hsl(` in `src/` outside `tokens.css`.

## The guided flow

`src/lib/liveFlow.ts`: `step(0..4) → intention → journal → myDua → closing`. One interval paces sentences every 2.8 s and one timeout marks the step's duration as passed; both are cleared on each step change. «التالي» waits (`aria-disabled`) until the text is shown or the time has passed. «أظهر النص كاملًا» shows everything and nothing hides it again. The closing records `{ date, duaId, intention }` with the local day the flow was opened on, marks the welcome dua done, holds 2 s and returns to Today. Closing early records nothing; text typed in the journal or the need field is saved as a draft (500 ms) and confirmed before closing.

From the dua page, the flow records the day only if the dua is today's dua; journal lines are saved either way with that dua's id.

## Share image

`src/features/share/drawShareCard.ts` draws 1080×1350 or 1080×1920 after `document.fonts.load` for each face, with colours read from the tokens on `<html>`. The sacred text steps down 84 → 72 → 58 → 48 px (hadith 66 → 56 → 46 → 38) and the image grows when even the smallest size does not fit (`fitText` in `src/lib/shareLayout.ts`, tested). Shared with `navigator.share({ files })` where supported, otherwise downloaded.

## PWA

`vite-plugin-pwa` (generateSW): manifest with `any` and `maskable` icons, precache of the app, fonts and content. iOS startup images for 19 device sizes in both colour schemes (`scripts/render-splash.ts` renders them from `design/brand/splash-*.svg`; the `<link>` tags are injected into `index.html` by a small Vite plugin). `public/theme-boot.js` applies the saved theme and text size before first paint (the CSP allows only same-origin scripts).
