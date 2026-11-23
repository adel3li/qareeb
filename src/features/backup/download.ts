import { toLocalDateString } from '../../lib/dates';
import { snapshot } from '../../state/store';
import { backupFileName, buildBackup } from './backup';

/** Offers the backup file to the browser. Nothing is sent anywhere. */
export function downloadBackup(): void {
  const blob = new Blob([JSON.stringify(buildBackup(snapshot()), null, 2)], { type: 'application/json' });
  saveBlob(blob, backupFileName(toLocalDateString()));
}

export function saveBlob(blob: Blob, fileName: string): void {
  const href = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = href;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(href), 1000);
}
