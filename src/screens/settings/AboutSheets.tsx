import { Dialog } from '../../components/Dialog';
import { PRIVACY_POLICY_DATE } from '../../config';
import { ar } from '../../copy/ar';
import { useContent } from '../../content/load';
import { REVIEW_STATUSES } from '../../content/types';
import { hijriDayLabel } from '../../lib/hijriLabel';

export function PrivacySheet({ onClose }: { onClose: () => void }) {
  return (
    <Dialog open onClose={onClose} title={ar.settings.privacyPolicy}>
      <p className="m-0 text-t-caption text-text-muted">{ar.privacyPolicy.updated(hijriDayLabel(PRIVACY_POLICY_DATE, false))}</p>
      {ar.privacyPolicy.paragraphs.map((p, i) => (
        <p key={i} className={`m-0 text-t-body ${i === 0 ? 'text-text' : 'text-text-body'}`}>
          {p}
        </p>
      ))}
    </Dialog>
  );
}

/**
 * «عن المحتوى»: every number is read from the data. The status sentence is the exact
 * honest wording; it never says the content was reviewed by scholars unless every card
 * shown is approved.
 */
export function AboutContentSheet({ onClose }: { onClose: () => void }) {
  const content = useContent();
  const shown = content?.duas ?? [];
  const allApproved = shown.length > 0 && shown.every((d) => d.review.status === 'approved');
  const t = ar.aboutContent;
  return (
    <Dialog open onClose={onClose} title={ar.settings.aboutContent}>
      <p className="m-0 text-t-body font-medium text-text">{content?.preview ? t.previewStatus : allApproved ? t.approvedStatus : t.status}</p>
      {content && (
        <section className="flex flex-col gap-1">
          <h3 className="m-0 text-t-caption font-semibold text-accent">{t.counts}</h3>
          <p className="m-0 text-t-body-sm text-text-body">{t.shownCount(shown.length)}</p>
          {REVIEW_STATUSES.filter((s) => (content.counts[s] ?? 0) > 0).map((s) => (
            <p key={s} className="m-0 text-t-body-sm text-text-body">
              {t.countLine(t.levels[s], content.counts[s] ?? 0)}
            </p>
          ))}
        </section>
      )}
      <Block title={t.sourcesTitle} body={[t.quranSource, t.hadithSource]} />
      <Block title={t.gradePolicyTitle} body={[t.gradePolicy]} />
      <Block title={t.reviewTitle} body={[t.review]} />
      <Block title={t.layersTitle} body={[t.layers]} />
    </Dialog>
  );
}

function Block({ title, body }: { title: string; body: string[] }) {
  return (
    <section className="flex flex-col gap-1">
      <h3 className="m-0 text-t-caption font-semibold text-accent">{title}</h3>
      {body.map((b, i) => (
        <p key={i} className="m-0 text-t-body-sm text-text-body">
          {b}
        </p>
      ))}
    </section>
  );
}
