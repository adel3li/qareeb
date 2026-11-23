import { toLocalDateString } from '../../lib/dates';
import { snapshot, type AppData } from '../../state/stores';
import type { BackupFile } from './schema';

/** Building and downloading the backup file, without the import checks (kept out of the main chunk). */
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
