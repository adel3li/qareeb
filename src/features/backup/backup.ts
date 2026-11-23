import { BACKUP_MAX_BYTES } from '../../config';
import { toLocalDateString } from '../../lib/dates';
import { replaceAll, snapshot, type AppData } from '../../state/stores';
import { backupFileSchema, type BackupFile } from './schema';

export function buildBackup(data: AppData = snapshot(), now: Date = new Date()): BackupFile {
  return { app: 'qareeb', backupVersion: 1, exportedAt: now.toISOString(), data };
}

export function backupFileName(now: Date = new Date()): string {
  return `qareeb-${toLocalDateString(now)}.json`;
}

/** Downloads the backup file. Plain JSON, the user's own file; nothing is sent anywhere. */
export function exportBackup(): void {
  const json = JSON.stringify(buildBackup(), null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const href = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = href;
  a.download = backupFileName();
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(href), 1_000);
}

export interface BackupSummary {
  days: number;
  entries: number;
  needs: number;
  favorites: number;
  exportedAt: string;
}

export type ParseResult = { ok: true; backup: BackupFile; summary: BackupSummary } | { ok: false; reason: 'too_large' | 'invalid' };

/** Reads and checks a backup file. Nothing is changed until the caller applies it after confirmation. */
export function parseBackup(raw: string): ParseResult {
  if (new Blob([raw]).size > BACKUP_MAX_BYTES) return { ok: false, reason: 'too_large' };
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return { ok: false, reason: 'invalid' };
  }
  const result = backupFileSchema.safeParse(json);
  if (!result.success) return { ok: false, reason: 'invalid' };
  const backup = result.data;
  const dates = new Set(backup.data.completions.map((c) => c.date));
  if (dates.size !== backup.data.completions.length) return { ok: false, reason: 'invalid' };
  return {
    ok: true,
    backup,
    summary: {
      days: dates.size,
      entries: backup.data.notebook.length,
      needs: backup.data.myDuas.length,
      favorites: backup.data.favorites.length,
      exportedAt: backup.exportedAt,
    },
  };
}

export function applyBackup(backup: BackupFile): void {
  replaceAll(backup.data);
}
