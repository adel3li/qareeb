import { Authored } from '../../components/Authored';
import { Chip } from '../../components/Chip';
import { Disclosure, DisclosureGroup, Prose, Reflection, SourceLine } from '../../components/Disclosure';
import { ar } from '../../copy/ar';
import type { Citation, Dua } from '../../content/types';
import { toArabicNumerals } from '../../lib/arabic';
import { hasPlaceholder } from '../../lib/placeholders';
import { referenceOf } from '../../lib/reference';

function cite(c: Citation): string {
  const loc = c.location ? `، ${toArabicNumerals(c.location)}` : '';
  return `${c.work}${loc}`;
}

function Basis({ basis }: { basis: Citation[] }) {
  if (basis.length === 0) return null;
  return (
    <span>
      <Authored text={basis.map(cite).join('؛ ')} />
    </span>
  );
}

/** The sections under the card: الموقف, نص الحديث كاملًا, المعنى, وقفات, and متى يُدعى به only when sourced. */
export function DuaSections({ dua }: { dua: Dua }) {
  const hasMeaning = dua.meaning.glossary.length > 0 || dua.meaning.summary.trim() !== '';
  return (
    <DisclosureGroup label={ar.today.sections.sectionsLabel}>
      <Disclosure title={ar.today.sections.scene}>
        <Prose>
          <Authored text={dua.context.retelling} />
        </Prose>
        <SourceLine>
          <Chip variant="plain">{ar.common.adapted}</Chip>
          <Basis basis={dua.context.basis} />
        </SourceLine>
      </Disclosure>
      {dua.hadith && dua.hadith.fullNarration && (
        <Disclosure title={ar.today.sections.fullHadith}>
          <p lang="ar" className="m-0 text-start text-t-hadith-full text-sacred-hadith">
            {dua.hadith.fullNarration}
          </p>
          <SourceLine>
            <span>
              {referenceOf(dua)} · {dua.hadith.numbering}
            </span>
            <span>
              <Authored text={dua.hadith.gradeNote} />
            </span>
            <a href={dua.hadith.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-text-muted underline">
              {ar.today.copiedFrom(dua.hadith.sourceUrl.includes('sunnah.com') ? 'sunnah.com' : 'المصدر')}
            </a>
          </SourceLine>
        </Disclosure>
      )}
      {hasMeaning && (
        <Disclosure title={ar.today.sections.meaning}>
          {dua.meaning.glossary.length > 0 && (
            <dl className="m-0 flex flex-col gap-2">
              {dua.meaning.glossary.map((g, i) => (
                <div key={i}>
                  <dt className="text-t-body font-semibold text-text">
                    <Authored text={g.term} />
                  </dt>
                  <dd className="m-0 text-t-body text-text-body">
                    <Authored text={g.meaning} />
                  </dd>
                </div>
              ))}
            </dl>
          )}
          {dua.meaning.summary && (
            <Prose>
              <Authored text={dua.meaning.summary} />
            </Prose>
          )}
          <SourceLine>
            <Basis basis={dua.meaning.basis} />
          </SourceLine>
        </Disclosure>
      )}
      {dua.reflections.length > 0 && (
        <Disclosure title={ar.today.sections.reflections}>
          {dua.reflections.map((r, i) => (
            <Reflection key={i}>
              <Authored text={r} />
            </Reflection>
          ))}
        </Disclosure>
      )}
      {dua.whenToSay && (__CONTENT_PREVIEW__ || !hasPlaceholder(dua.whenToSay.text)) && (
        <Disclosure title={ar.today.sections.whenToSay}>
          <Prose>
            <Authored text={dua.whenToSay.text} />
          </Prose>
          {dua.whenToSay.note && (
            <SourceLine>
              <Authored text={dua.whenToSay.note} />
            </SourceLine>
          )}
        </Disclosure>
      )}
    </DisclosureGroup>
  );
}
