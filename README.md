# قريب (Qareeb)

دعاءٌ واحد كلَّ يوم من القرآن والسنة، مع موقفه ومعناه، وتجربة قصيرة تعيش فيها الدعاء قبل أن تدعو به. تطبيق ويب عربي، للجوال أولًا، بلا حساب ولا خادم، ويعمل بلا إنترنت.

Start with `CLAUDE.md` (the rules), then `docs/handoff/README.md`. The code as built is documented in `docs/reference/` (`architecture.md`, `storage.md`, `content.md`). Owner's decisions: `docs/decisions.md`.

```bash
bun install
bun run dev               # http://localhost:5173/
bun run lint              # tsc strict
bun run test              # vitest (unit)
bun run e2e -- --trace off  # Playwright on the production build
bun run validate-content
bun run check-promises
bun run build             # production: cards at CONTENT_MIN_LEVEL (verified) or above
CONTENT_PREVIEW=1 bun run build   # preview: drafts included, marked
bun run build-landing     # the static landing page into dist-landing/
```
