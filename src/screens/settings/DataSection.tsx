import { Download, Trash2, Upload } from 'lucide-react';
import { useRef, useState } from 'react';
import { Button } from '../../components/Button';
import { ConfirmDialog, Dialog } from '../../components/Dialog';
import { ListGroup, RowButton } from '../../components/ListRow';
import { ar } from '../../copy/ar';
import { applyBackup, exportBackup, parseBackup, type ParseResult } from '../../features/backup/backup';
import { BACKUP_MAX_BYTES } from '../../config';
import { toLocalDateString } from '../../lib/dates';
import { hijriDayLabel } from '../../lib/hijriLabel';
import { eraseAll } from '../../state/stores';
import { useUi } from '../../state/ui';

/** بياناتي: export, import with a checked summary and confirmation, erase everything. */
export function DataSection() {
  const announce = useUi((s) => s.announce);
  const input = useRef<HTMLInputElement>(null);
  const [parsed, setParsed] = useState<ParseResult | null>(null);
  const [erasing, setErasing] = useState(false);

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    if (file.size > BACKUP_MAX_BYTES) return setParsed({ ok: false, reason: 'too_large' });
    setParsed(parseBackup(await file.text()));
  };

  const s = ar.settings;
  return (
    <>
      <ListGroup label={s.data}>
        <RowButton
          icon={Download}
          onClick={() => {
            exportBackup();
            announce(s.exportDone);
          }}
        >
          {s.export}
        </RowButton>
        <RowButton icon={Upload} onClick={() => input.current?.click()}>
          {s.import}
        </RowButton>
        <RowButton icon={Trash2} danger onClick={() => setErasing(true)}>
          {s.erase}
        </RowButton>
      </ListGroup>
      <input
        ref={input}
        type="file"
        accept="application/json,.json"
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(e) => {
          void onFile(e.target.files?.[0]);
          e.target.value = '';
        }}
      />
      {parsed && (
        <Dialog
          open
          onClose={() => setParsed(null)}
          title={parsed.ok ? s.importTitle : s.importErrorTitle}
          footer={
            parsed.ok ? (
              <>
                <Button
                  variant="primary"
                  block
                  onClick={() => {
                    applyBackup(parsed.backup);
                    setParsed(null);
                    announce(s.importDone);
                  }}
                >
                  {s.importConfirm}
                </Button>
                <Button variant="secondary" block onClick={() => setParsed(null)}>
                  {ar.common.cancel}
                </Button>
              </>
            ) : (
              <Button variant="secondary" block onClick={() => setParsed(null)}>
                {ar.common.close}
              </Button>
            )
          }
        >
          {parsed.ok ? (
            <>
              <p className="m-0 text-t-body text-text">{s.importSummary}</p>
              <ul className="m-0 flex list-disc flex-col gap-1 ps-6 text-t-body text-text-body">
                <li>{s.summaryDays(parsed.summary.days)}</li>
                <li>{s.summaryEntries(parsed.summary.entries)}</li>
                <li>{s.summaryNeeds(parsed.summary.needs)}</li>
                <li>{s.summaryFavorites(parsed.summary.favorites)}</li>
              </ul>
              <p className="m-0 text-t-caption text-text-muted">{s.summaryExportedAt(hijriDayLabel(toLocalDateString(new Date(parsed.summary.exportedAt)), false))}</p>
              <p role="alert" className="m-0 text-t-body-sm text-danger">
                {s.importReplaceWarning}
              </p>
            </>
          ) : (
            <p role="alert" className="m-0 text-t-body text-danger">
              {parsed.reason === 'too_large' ? s.importTooLarge : s.importErrorBody}
            </p>
          )}
        </Dialog>
      )}
      <ConfirmDialog
        open={erasing}
        title={s.eraseTitle}
        body={s.eraseBody}
        confirmLabel={s.eraseConfirm}
        onConfirm={() => {
          eraseAll();
          setErasing(false);
          location.hash = '#/today';
        }}
        onCancel={() => setErasing(false)}
      />
    </>
  );
}
