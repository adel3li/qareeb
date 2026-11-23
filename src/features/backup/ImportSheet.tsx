import { ar } from '../../copy/ar';
import { Button } from '../../components/Button';
import { Dialog } from '../../components/Dialog';
import { useToast } from '../../components/Toast';
import type { ParseResult } from '../../lib/backup';
import { hijriDate } from '../../lib/dayLabel';
import { restore } from '../../state/data';

/** The checked summary of an imported file, then the confirmation. A damaged file changes nothing. */
export function ImportSheet({ result, onClose, onPickAnother }: { result: ParseResult; onClose: () => void; onPickAnother: () => void }) {
  const toast = useToast((s) => s.show);
  const t = ar.settings.importSheet;
  if (!result.ok) {
    return (
      <Dialog open title={t.errorTitle} onClose={onClose}>
        <p role="alert" className="m-0 text-t-body text-danger">
          {t.errors[result.error]}
        </p>
        <Button
          variant="secondary"
          block
          onClick={() => {
            onClose();
            onPickAnother();
          }}
        >
          {t.pick}
        </Button>
      </Dialog>
    );
  }
  const s = result.summary;
  return (
    <Dialog open title={t.title} onClose={onClose}>
      <p className="m-0 text-t-body text-text">{t.inThis}</p>
      <ul className="m-0 flex flex-col gap-1 ps-6 text-t-body text-text-body">
        <li>{t.days(s.days)}</li>
        <li>{t.entries(s.entries)}</li>
        <li>{t.needs(s.needs)}</li>
        <li>{t.favorites(s.favorites)}</li>
      </ul>
      <p className="m-0 text-t-body-sm text-text-muted">{t.exportedOn(hijriDate(s.exportedAt))}</p>
      <p className="m-0 text-t-body-sm text-danger">{t.warning}</p>
      <Button
        variant="primary"
        block
        onClick={() => {
          restore(result.file.data);
          onClose();
          toast(t.done);
        }}
      >
        {t.replace}
      </Button>
      <Button variant="secondary" block onClick={onClose}>
        {ar.common.cancel}
      </Button>
    </Dialog>
  );
}
