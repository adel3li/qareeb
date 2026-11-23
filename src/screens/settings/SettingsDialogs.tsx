import { useMemo } from 'react';
import { navigate } from '../../app/router';
import { Button } from '../../components/Button';
import { Dialog } from '../../components/Dialog';
import { toast } from '../../components/Toast';
import { useContent } from '../../content/load';
import { ar } from '../../copy/ar';
import { parseBackup } from '../../features/backup/backup';
import { hijriOfDay, hijriOfTimestamp } from '../../lib/format';
import { eraseAll, replaceAll } from '../../state/store';

/** The day this policy was last changed. Change it with every change to the policy text. */
export const PRIVACY_UPDATED = '2026-11-23';

const para = 'm-0 text-t-body text-body';
const label = 'm-0 mt-2 text-t-caption font-semibold text-accent';

export function PrivacySheet({ onClose }: { onClose: () => void }) {
  return (
    <Dialog title={ar.privacy.title} onClose={onClose}>
      <p className="m-0 text-t-caption font-normal text-muted">{ar.privacy.updated(hijriOfDay(PRIVACY_UPDATED, false))}</p>
      {ar.privacy.paragraphs.map((p, i) => (
        <p key={i} className={para}>
          {p}
        </p>
      ))}
    </Dialog>
  );
}

/** «عن المحتوى»: every number is read from the content bundle; no claim of scholarly review before it happens. */
export function AboutContentSheet({ onClose }: { onClose: () => void }) {
  const bundle = useContent();
  const shown = bundle.duas.length;
  const c = bundle.levelCounts;
  const allApproved = shown > 0 && c.approved === shown;
  const drafts = bundle.duas.filter((d) => d.isDraft).length;
  return (
    <Dialog title={ar.aboutContent.title} onClose={onClose}>
      <p className="m-0 font-heading text-t-subtitle text-ink">{allApproved ? ar.aboutContent.honestApproved : ar.aboutContent.honest}</p>
      <h3 className={label}>{ar.aboutContent.inRelease}</h3>
      <ul className="m-0 flex list-none flex-col gap-1 p-0 text-t-body text-body">
        <li>{ar.aboutContent.shown(shown)}</li>
        <li>{ar.aboutContent.verified(c.verified + c.approved)}</li>
        {c.approved > 0 && <li>{ar.aboutContent.approved(c.approved)}</li>}
        {bundle.preview && <li>{ar.aboutContent.drafts(drafts)}</li>}
      </ul>
      <h3 className={label}>{ar.aboutContent.sources}</h3>
      <p className={para}>{ar.aboutContent.quranSource}</p>
      <p className={para}>{ar.aboutContent.hadithSource}</p>
      <h3 className={label}>{ar.aboutContent.gradePolicy}</h3>
      <p className={para}>{ar.aboutContent.gradeBody}</p>
      <h3 className={label}>{ar.aboutContent.review}</h3>
      <p className={para}>{ar.aboutContent.reviewBody}</p>
      {c.approved === 0 && <p className={para}>{ar.aboutContent.noReviewer}</p>}
    </Dialog>
  );
}

export function EraseDialog({ onClose }: { onClose: () => void }) {
  return (
    <Dialog
      tone="alert"
      title={ar.erase.title}
      onClose={onClose}
      actions={
        <>
          <Button variant="danger" block onClick={() => { eraseAll(); onClose(); navigate({ name: 'today' }, { replace: true }); }}>
            {ar.erase.confirm}
          </Button>
          <Button variant="secondary" block onClick={onClose}>
            {ar.erase.cancel}
          </Button>
        </>
      }
    >
      <p className={para}>{ar.erase.body}</p>
    </Dialog>
  );
}

/** Import: checked with Zod, summarised, and applied only after «استبدل بياناتي». A failure changes nothing. */
export function ImportDialog({ text, onClose, onPickAnother }: { text: string; onClose: () => void; onPickAnother: () => void }) {
  const result = useMemo(() => parseBackup(text), [text]);
  if (!result.ok) {
    return (
      <Dialog tone="alert" title={ar.importFlow.errorTitle} onClose={onClose} actions={<Button variant="secondary" block onClick={onPickAnother}>{ar.importFlow.pickAnother}</Button>}>
        <p className="m-0 text-t-body text-danger">{result.reason === 'too_large' ? ar.importFlow.tooLarge : ar.importFlow.errorBody}</p>
      </Dialog>
    );
  }
  const s = result.summary;
  return (
    <Dialog
      title={ar.importFlow.title}
      onClose={onClose}
      actions={
        <>
          <Button block onClick={() => { replaceAll(result.data); toast(ar.importFlow.done); onClose(); }}>
            {ar.importFlow.replace}
          </Button>
          <Button variant="secondary" block onClick={onClose}>
            {ar.importFlow.cancel}
          </Button>
        </>
      }
    >
      <p className={para}>{ar.importFlow.contains}</p>
      <ul className="m-0 flex list-none flex-col gap-1 ps-2 text-t-body text-body">
        <li>{ar.importFlow.days(s.days)}</li>
        <li>{ar.importFlow.entries(s.entries)}</li>
        <li>{ar.importFlow.needs(s.needs)}</li>
        <li>{ar.importFlow.favorites(s.favorites)}</li>
      </ul>
      <p className="m-0 text-t-caption font-normal text-muted">{ar.importFlow.exportedOn(hijriOfTimestamp(s.exportedAt))}</p>
      <p className="m-0 text-t-body-sm text-danger">{ar.importFlow.warning}</p>
    </Dialog>
  );
}
