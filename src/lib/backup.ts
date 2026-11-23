import { z } from 'zod';
import { BACKUP_MAX_BYTES } from '../config';
import {
  completionSchema,
  myDuaSchema,
  notebookEntrySchema,
  settingsSchema,
  type Completion,
  type MyDua,
  type NotebookEntry,
  type Settings,
} from '../state/schemas';

/**
 * The backup file: everything the user made, and only that. Export and
 * import are symmetric: whatever is exported is imported back.
 * Drafts are not exported (they are unsaved writing on this device).
 */

export const BACKUP_VERSION = 1;

export interface BackupData {
  settings: Settings;
  onboardingCompletedAt: string | null;
  welcomeDoneOn: string | null;
  completions: Completion[];
  notebook: NotebookEntry[];
  myDuas: MyDua[];
  favorites: string[];
}

const backupSchema = z.strictObject({
  app: z.literal('qareeb'),
  backupVersion: z.literal(BACKUP_VERSION),
  exportedAt: z.iso.datetime({ offset: true }),
  data: z.strictObject({
    settings: settingsSchema,
    onboardingCompletedAt: z.iso.datetime({ offset: true }).nullable(),
    welcomeDoneOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
    completions: z.array(completionSchema).max(100_000),
    notebook: z.array(notebookEntrySchema).max(100_000),
    myDuas: z.array(myDuaSchema).max(100_000),
    favorites: z.array(z.string().regex(/^dua_\d{4}$/)).max(10_000),
  }),
});

export type BackupFile = z.infer<typeof backupSchema>;

export function buildBackup(data: BackupData, now: Date = new Date()): BackupFile {
  return { app: 'qareeb', backupVersion: BACKUP_VERSION, exportedAt: now.toISOString(), data };
}

export function serializeBackup(file: BackupFile): string {
  return `${JSON.stringify(file, null, 2)}\n`;
}

export interface BackupSummary {
  days: number;
  entries: number;
  needs: number;
  favorites: number;
  exportedAt: string;
}

export type ParseResult =
  | { ok: true; file: BackupFile; summary: BackupSummary }
  | { ok: false; error: 'tooLarge' | 'notJson' | 'invalid' | 'newer' };

/** Reads an imported file. Nothing is changed here: the caller replaces data only after the user confirms. */
export function parseBackup(text: string, byteLength = new TextEncoder().encode(text).length): ParseResult {
  if (byteLength > BACKUP_MAX_BYTES) return { ok: false, error: 'tooLarge' };
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return { ok: false, error: 'notJson' };
  }
  if (!raw || typeof raw !== 'object' || (raw as { app?: unknown }).app !== 'qareeb') return { ok: false, error: 'notJson' };
  const version = (raw as { backupVersion?: unknown }).backupVersion;
  if (typeof version === 'number' && version > BACKUP_VERSION) return { ok: false, error: 'newer' };
  const parsed = backupSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: 'invalid' };
  const d = parsed.data.data;
  const ids = (xs: { id: string }[]) => new Set(xs.map((x) => x.id)).size === xs.length;
  const days = new Set(d.completions.map((c) => c.date));
  if (days.size !== d.completions.length || !ids(d.notebook) || !ids(d.myDuas)) return { ok: false, error: 'invalid' };
  return {
    ok: true,
    file: parsed.data,
    summary: { days: days.size, entries: d.notebook.length, needs: d.myDuas.length, favorites: new Set(d.favorites).size, exportedAt: parsed.data.exportedAt },
  };
}

export function backupFileName(localDay: string): string {
  return `qareeb-backup-${localDay}.json`;
}
