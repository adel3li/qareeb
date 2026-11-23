import { ar } from '../../copy/ar';
import { useContent } from '../../content/load';
import { REVIEW_LEVELS } from '../../content/schema';
import { Dialog } from '../../components/Dialog';

const h = 'm-0 mt-2 text-t-label font-semibold text-accent';
const p = 'm-0 text-t-body text-text-body';

export function PrivacyPolicy({ onClose }: { onClose: () => void }) {
  return (
    <Dialog open title={ar.privacy.title} onClose={onClose}>
      <p className="m-0 text-t-caption text-text-muted">{ar.privacy.updated}</p>
      {ar.privacy.paragraphs.map((para, i) => (
        <p key={i} className={p}>
          {para}
        </p>
      ))}
    </Dialog>
  );
}

/**
 * «عن المحتوى»: sources, grade policy, the review state read from the data.
 * It says the content was reviewed by scholars only when every card shown is approved.
 */
export function AboutContent({ onClose }: { onClose: () => void }) {
  const meta = useContent((s) => s.file?.meta);
  const total = useContent((s) => s.file?.duas.length ?? 0);
  const t = ar.aboutContent;
  const levels = meta?.levels ?? {};
  const allApproved = total > 0 && levels.approved === total;
  return (
    <Dialog open title={t.title} onClose={onClose}>
      {meta?.preview ? <p className="m-0 font-kufi text-t-body-lg text-text">{t.previewNote}</p> : null}
      {!allApproved ? <p className="m-0 font-kufi text-t-body-lg text-text">{t.honest}</p> : null}
      <h3 className={h}>{t.cardsTitle}</h3>
      <p className={p}>{t.shown(total)}</p>
      {REVIEW_LEVELS.filter((l) => levels[l]).map((l) => (
        <p key={l} className={p}>
          {t.byLevel(ar.card.level[l], levels[l] ?? 0)}
        </p>
      ))}
      <h3 className={h}>{t.sourcesTitle}</h3>
      <p className={p}>{t.quranSource}</p>
      <p className={p}>{t.hadithSource}</p>
      <h3 className={h}>{t.gradeTitle}</h3>
      <p className={p}>{t.grade}</p>
      <h3 className={h}>{t.reviewTitle}</h3>
      <p className={p}>{t.review}</p>
      <p className={p}>{t.reviewer('')}</p>
      <h3 className={h}>{t.kindsTitle}</h3>
      {t.kinds.map((k, i) => (
        <p key={i} className={p}>
          {k}
        </p>
      ))}
    </Dialog>
  );
}
