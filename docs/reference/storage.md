# Storage

Everything the user does is kept in `localStorage` on their device, and nowhere else. One registry of keys (`src/state/keys.ts`), one pattern `qareeb:name:v1`. Each key belongs to one small Zustand store with `persist` (`src/state/stores.ts`).

**Rules.** Never rename a key or change a stored shape without: raising that store's version, a step in `src/state/migrations.ts`, a test in `src/state/stores.test.ts`, and an update to this page, in the same pull request. Nothing is written on first run except what the user did: hydration never writes (only a migration would), and the defaults live in memory. An e2e test checks the storage is empty on a clean first load (`tests/e2e/first-run.spec.ts`).

## Envelope

Every key holds the Zustand `persist` envelope:

```json
{ "state": { … }, "version": 1 }
```

## Keys

| Key | `state` shape | Written when | In backup |
|---|---|---|---|
| `qareeb:settings:v1` | `{ theme: 'system' \| 'light' \| 'dark', fontScale: number (14–24 px, root font size), showMyDuasInFlow: boolean }` | The user changes a setting | yes |
| `qareeb:onboarding:v1` | `{ completedAt: string (ISO) \| null }` | The user finishes or skips onboarding | yes |
| `qareeb:welcome:v1` | `{ doneOn: "YYYY-MM-DD" \| null }` (local day the welcome dua was lived; the first one is kept) | The welcome dua's flow reaches its closing | yes |
| `qareeb:completions:v1` | `{ items: Array<{ date: "YYYY-MM-DD", duaId: string, completedAt: string (ISO), intention?: 'sujood' \| 'after_prayer' \| 'before_sleep' \| 'now' }> }`, one entry per local day, sorted by date | The flow reaches its closing for a day that records (today's dua) | yes |
| `qareeb:notebook:v1` | `{ items: Array<{ id, date: "YYYY-MM-DD", duaId?: string, text, createdAt, updatedAt }> }` | «احفظ في الدفتر», «اكتب الآن», edit, delete | yes |
| `qareeb:my-duas:v1` | `{ items: Array<{ id, text, note?, createdAt (ISO), answeredAt?: "YYYY-MM-DD", answerNote? }> }` | دعواتي: add, edit, answered, delete | yes |
| `qareeb:favorites:v1` | `{ ids: string[] }` (dua ids, in the order added) | The heart on a card | yes |
| `qareeb:drafts:v1` | `{ byDua: { [duaId]: { notebookText?: string, updatedAt: string } } }` | 500 ms after typing in the flow's notebook step; removed when saved or emptied | no (unsent writing stays on the device) |

Day keys come from `toLocalDateString()` (`src/lib/dates.ts`), never from UTC. A completion stores the dua id that was shown; nothing recomputes a past day's dua from its date.

Differences from the blueprint (`05` §6): `settings` has no `fontFamily` (there is one interface face; a setting that does nothing is not shown); `welcome` and `onboarding` are in the backup so a restored device does not show the welcome again.

`public/theme-boot.js` reads `qareeb:settings:v1` before first paint to set `data-theme` and the root font size. It never writes.

## Backup file

`src/features/backup/` (`schema.ts`, `backup.ts`, `export.ts`). Plain JSON, not encrypted (the privacy text says so).

```jsonc
{
  "app": "qareeb",
  "backupVersion": 1,
  "exportedAt": "2026-11-23T18:00:00.000Z",
  "data": { "settings": {…}, "onboarding": {…}, "welcome": {…}, "completions": […], "notebook": […], "myDuas": […], "favorites": […] }
}
```

- Export and import are symmetric: everything exported is imported (round-trip test in `backup.test.ts` and `tests/e2e/screens.spec.ts`).
- Import: at most 5 MB (`BACKUP_MAX_BYTES`), Zod strict on every record (unknown fields rejected), one completion per day, then a summary (days, entries, needs, favourites, export date) and a confirmation, then everything is replaced. A damaged file shows an error and changes nothing.
- «امسح كل بياناتي» resets the stores and removes every `qareeb:` key, after a confirmation.

## Not stored

No account, no analytics, no identifiers. The service worker's cache (Workbox) holds the app's own files for offline use; it holds nothing the user wrote.
