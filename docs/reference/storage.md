# Storage

Everything the user makes lives in `localStorage` on their device. Nothing is sent anywhere. Every key is declared in `src/state/keys.ts` and follows one pattern, `qareeb:name:v1`. Each key holds one persisted Zustand store (`src/state/store.ts`), stored as:

```json
{ "state": { … }, "version": 1 }
```

Rules:

- Nothing is written on first run. Zustand `persist` writes on `set`, not on hydration; the first key written is `qareeb:onboarding:v1`, when the user finishes or skips onboarding (tested in `tests/first-run.spec.ts` and `src/state/store.test.ts`).
- A key is never renamed and a shape never changes without a migration in `src/state/migrations.ts`, its test in `migrations.test.ts`, and an update to this file.
- Day keys (`date`, `doneOn`) are local days from `src/lib/dates.ts`. Full timestamps are ISO strings.
- «امسح كل بياناتي» removes every key starting with `qareeb:` (`eraseAll` in `src/state/data.ts`).

## Keys

| Key | Store | `state` shape | Written when |
|---|---|---|---|
| `qareeb:settings:v1` | `useSettings` | `{ theme: 'system' \| 'light' \| 'dark', fontScale: number (14–24, px), showMyDuasInFlow: boolean }` | The user changes a setting. Read before first paint by `public/theme-boot.js` |
| `qareeb:onboarding:v1` | `useOnboarding` | `{ completedAt: string \| null }` | Onboarding finished or skipped |
| `qareeb:welcome:v1` | `useWelcome` | `{ doneOn: "YYYY-MM-DD" \| null }` | The welcome dua is lived for the first time (set once) |
| `qareeb:completions:v1` | `useCompletions` | `{ items: Array<{ date: "YYYY-MM-DD", duaId: "dua_0001", completedAt: string, intention?: 'sujood' \| 'after_prayer' \| 'before_sleep' \| 'now' }> }`, one entry per local day, sorted by date | The closing of «عِش الدعاء» for today's dua. The dua id shown is stored; a past day's dua is never recomputed from its date |
| `qareeb:notebook:v1` | `useNotebook` | `{ entries: Array<{ id, date: "YYYY-MM-DD", duaId?, text, createdAt, updatedAt }> }` | «احفظ في الدفتر» in the flow, «اكتب الآن», edit, delete |
| `qareeb:my-duas:v1` | `useMyDuas` | `{ items: Array<{ id, text, note?, createdAt, answeredAt?, answerNote? }> }` | A need is added, edited, answered, un-answered or deleted |
| `qareeb:favorites:v1` | `useFavorites` | `{ ids: string[] }` (dua ids) | The heart on a dua card |
| `qareeb:drafts:v1` | `useDrafts` | `{ byDua: { [duaId]: { notebookText?, myDuaText?, updatedAt } } }` | 500 ms after typing in the flow's journal or need field; the field is removed when saved, the dua's entry when empty |

The schemas of these shapes are in `src/state/schemas.ts` (Zod); the backup import checks every record against them.

The notebook's intention label is read from the completion with the same `date` and `duaId`, not stored twice.

## Backup file

`صدّر نسخة احتياطية` downloads `qareeb-backup-YYYY-MM-DD.json`, plain JSON, not encrypted (the privacy policy says so):

```jsonc
{
  "app": "qareeb",
  "backupVersion": 1,
  "exportedAt": "2026-11-23T18:00:00.000Z",
  "data": {
    "settings": { "theme": "system", "fontScale": 16, "showMyDuasInFlow": true },
    "onboardingCompletedAt": "…" ,
    "welcomeDoneOn": "2026-11-14",
    "completions": [ … ],
    "notebook": [ … ],
    "myDuas": [ … ],
    "favorites": [ … ]
  }
}
```

- Export and import are symmetric: everything exported is imported (round-trip test in `src/state/store.test.ts`). Drafts are not exported: they are unsaved writing on this device.
- Import (`parseBackup` in `src/lib/backup.ts`): at most 5 MB, valid JSON, `app: "qareeb"`, a known `backupVersion` (a newer one is refused with its own message), every record checked by Zod with unknown fields rejected, one completion per day, unique ids. Then a summary and a confirmation; only then are the stores replaced. A failure changes nothing.

## Not in localStorage

- `sessionStorage`: nothing.
- The service worker cache (`vite-plugin-pwa`) holds the app's own files and the content chunk, for offline use. It holds nothing the user wrote.
