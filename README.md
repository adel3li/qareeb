# قريب

دعاءٌ واحد كلَّ يوم من القرآن والسنة: موقفه، ومعناه، ثم «عِش الدعاء» في خمس خطوات. تطبيق ويب عربي، من اليمين لليسار، للجوال أولًا، يعمل بلا إنترنت، وما تكتبه لا يغادر جهازك.

```bash
bun install
bun run dev          # http://localhost:5173/ (with the draft cards)
bun run test && bun run lint && bun run validate-content && bun run check-promises
CONTENT_PREVIEW=1 bun run build && bun run e2e -- --trace off
```

Start with `CLAUDE.md` (the rules), then `docs/handoff/README.md` (the starting kit) and `docs/reference/` (the code as built: architecture, storage, content, open decisions). The design system is in `design/`.
