import { useState } from 'react';
import type { AppDua } from '../content/types';
import { ar } from '../copy/ar';
import { sourceReference } from '../lib/reference';
import { Authored } from './Authored';
import { Chip } from './Chip';
import { Disclosure, DisclosureGroup } from './Disclosure';
import { FullNarration, SacredTerm } from './SacredText';

type Citation = AppDua['context']['basis'][number];

function Sources({ basis }: { basis: Citation[] }) {
  return (
    <p className="m-0 text-t-caption text-text-muted">
      {basis.map((c, i) => (
        <span key={i}>
          {i > 0 ? '؛ ' : ''}
          {c.url ? (
            <a href={c.url} target="_blank" rel="noopener noreferrer" className="text-text-muted underline underline-offset-4">
              {c.work}
            </a>
          ) : (
            c.work
          )}
          {c.location ? `، ${c.location}` : ''}
        </span>
      ))}
    </p>
  );
}

const para = 'm-0 text-t-body leading-[1.85] text-text-body';

/**
 * The collapsible sections under the card: الموقف, نص الحديث كاملًا (Sunnah),
 * المعنى, وقفات, and متى يُدعى به only when the source states it.
 */
export function DuaSections({ dua }: { dua: AppDua }) {
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const toggle = (key: string) => setOpen((o) => ({ ...o, [key]: !o[key] }));

  return (
    <DisclosureGroup>
      <Disclosure title={ar.sections.context} expanded={!!open.context} onToggle={() => toggle('context')}>
        <p className={para}>
          <Authored text={dua.context.retelling} />
        </p>
        <div className="flex flex-col items-start gap-2">
          <Chip variant="plain">{ar.sections.adapted}</Chip>
          <Sources basis={dua.context.basis} />
        </div>
      </Disclosure>

      {dua.hadith ? (
        <Disclosure title={ar.sections.fullHadith} expanded={!!open.hadith} onToggle={() => toggle('hadith')}>
          <FullNarration text={dua.hadith.fullNarration} />
          <p className="m-0 text-t-caption text-text-muted">
            {sourceReference(dua)} · {dua.hadith.numbering}
          </p>
          <p className="m-0 text-t-caption text-text-muted">{dua.hadith.gradeNote}</p>
          <p className="m-0 text-t-caption text-text-muted">
            <a href={dua.hadith.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-text-muted underline underline-offset-4">
              {ar.sections.copiedFrom('sunnah.com')}
            </a>
          </p>
        </Disclosure>
      ) : null}

      <Disclosure title={ar.sections.meaning} expanded={!!open.meaning} onToggle={() => toggle('meaning')}>
        {dua.meaning.glossary.length ? (
          <dl className="m-0 flex flex-col gap-3">
            {dua.meaning.glossary.map((g, i) => (
              <div key={i}>
                <SacredTerm kind={dua.kind} text={g.term} />
                <dd className={`m-0 ${para}`}>
                  <Authored text={g.meaning} />
                </dd>
              </div>
            ))}
          </dl>
        ) : null}
        <p className={para}>
          <Authored text={dua.meaning.summary} />
        </p>
        <Sources basis={dua.meaning.basis} />
      </Disclosure>

      <Disclosure title={ar.sections.reflections} expanded={!!open.reflections} onToggle={() => toggle('reflections')}>
        {dua.reflections.map((r, i) => (
          <p key={i} className={`${para} border-s-2 border-solid border-accent ps-3.5`}>
            <Authored text={r} />
          </p>
        ))}
      </Disclosure>

      {dua.whenToSay ? (
        <Disclosure title={ar.sections.whenToSay} expanded={!!open.when} onToggle={() => toggle('when')}>
          <p className={para}>
            <Authored text={dua.whenToSay.text} />
          </p>
          {dua.whenToSay.note ? (
            <p className="m-0 text-t-body-sm text-text-muted">
              <Authored text={dua.whenToSay.note} />
            </p>
          ) : null}
        </Disclosure>
      ) : null}
    </DisclosureGroup>
  );
}
