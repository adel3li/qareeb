import { backupFileName, buildBackup, serializeBackup } from '../../lib/backup';
import { toLocalDateString } from '../../lib/dates';
import { downloadFile } from '../../lib/download';
import { snapshot } from '../../state/data';

/** Downloads the backup file. Works from the error screen too: it reads the stores only. */
export function exportBackup(): void {
  const text = serializeBackup(buildBackup(snapshot()));
  downloadFile(text, backupFileName(toLocalDateString()), 'application/json');
}
