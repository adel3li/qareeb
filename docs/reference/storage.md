# Storage

Everything the user does is kept in `localStorage` on their device; there is no server. Every key is registered in `src/state/keys.ts`, one pattern: `qareeb:name:v1`. Shapes are Zod schemas in `src/state/shapes.ts`; versions and migrations in `src/state/migrations.ts`.

**Rules.** Never rename a key or change a stored shape without a migration, a test in `src/state/migrations.test.ts`, and an update to this file in the same pull request. Nothing is written on first run: a key appears only when the user does the thing it records (tested in `src/state/store.test.ts`). No key grows per day.

## Envelope

Each key is one Zustand store with `persist`, stored as:

```json
{ "state": { "value": <the value below> }, "version": 1 }
```

On reading, a record that does not match its shape is dropped (arrays keep their valid records; settings fall back field by field to the defaults). Nothing is "repaired" into something the user did not write.

## Keys

| Key | Value (version 1) | Written when |
|---|---|---|
| `qareeb:settings:v1` | `{ theme: 'system' \| 'light' \| 'dark', fontScale: 14–24 (root px, default 16), showMyDuasInFlow: boolean (default true) }` | The user changes a setting |
| `qareeb:onboarding:v1` | `{ completedAt: ISO string \| null }` | The user finishes or skips onboarding |
| `qareeb:welcome:v1` | `{ doneOn: "YYYY-MM-DD" \| null }` | The user completes «عِش الدعاء» on the welcome dua (local day) |
| `qareeb:completions:v1` | `Array<{ date: "YYYY-MM-DD", duaId: string, completedAt: ISO, intention?: 'sujood' \| 'after_prayer' \| 'before_sleep' \| 'now' }>`, one per local day, sorted by date | The closing of «عِش الدعاء». The dua id shown is stored; a past day's dua is never recomputed from its date. Living again the same day keeps the day's dua and updates the intention |
| `qareeb:notebook:v1` | `Array<{ id, date: "YYYY-MM-DD", duaId?: string, text, createdAt: ISO, updatedAt: ISO }>` | «احفظ في الدفتر», «اكتب الآن», edit, delete |
| `qareeb:my-duas:v1` | `Array<{ id, text (≤500), note?, createdAt: ISO, answeredAt?: ISO, answerNote? }>`, newest first | Adding, editing, answering or deleting a need |
| `qareeb:favorites:v1` | `string[]` (dua ids, newest first) | The heart on a dua |
| `qareeb:drafts:v1` | `{ [duaId]: { notebookText?: string, needText?: string, updatedAt: ISO } }` | Typing in «عِش الدعاء» (500 ms after the last key); removed when saved or emptied |

Day keys come from `src/lib/dates.ts` (`toLocalDateString`), never from `toISOString()`.

## Backup file

`src/features/backup/backup.ts`. Plain JSON, not encrypted (the privacy policy says so):

```jsonc
{ "app": "qareeb", "backupVersion": 1, "exportedAt": "<ISO>",
  "data": { "settings": {…}, "onboarding": {…}, "welcome": {…}, "completions": […], "notebook": […], "myDuas": […], "favorites": […], "drafts": {…} } }
```

Export and import are symmetric: every key above is exported and imported. Import rejects files over 5 MB, unknown fields at any level, records that fail their shape, and two completions on one day; it shows a summary (days, entries, needs, favourites, export date) and replaces data only after «استبدل بياناتي». Files from before `onboarding`, `welcome` and `drafts` were exported are accepted without them.

## Erase

«امسح كل بياناتي» resets every store and removes every key starting with `qareeb:`; other sites' keys are untouched.
