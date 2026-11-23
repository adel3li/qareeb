import type { Citation, Dua } from '../../content/types';
import { Chip } from '../../components/Chip';
import { Disclosure, DisclosureGroup } from '../../components/Disclosure';
import { SacredText } from '../../components/SacredText';
import { ar, num } from '../../copy/ar';
import { Authored } from './Authored';

function Sources({ basis }: { basis: Citation[] }) {
  if (!basis.length) return null;
  return (
    <p className="m-0 text-t-caption font-normal text-muted">
      {basis.map((c, i) => {
        const label = [c.work, c.location].filter(Boolean).join('، ');
        return (
          <span key={i}>
            {i > 0 && '؛ '}
            {c.url ? (
              <a href={c.url} target="_blank" rel="noopener noreferrer" className="text-muted underline underline-offset-4">
                {label}
              </a>
            ) : (
              label
            )}
          </span>
        );
      })}
    </p>
  );
}

const para = 'm-0 text-t-body leading-[1.85] text-body';

/** The sections under a dua card. «متى يُدعى به» appears only when the card has it from its source. */
export function DuaSections({ dua }: { dua: Dua }) {
  return (
    <DisclosureGroup>
      <Disclosure title={ar.sections.context}>
        <p className={para}>
          <Authored text={dua.context.retelling} />
        </p>
        <div>
          <Chip variant="plain">{ar.sections.retold}</Chip>
        </div>
        <Sources basis={dua.context.basis} />
      </Disclosure>

      {dua.hadith && (
        <Disclosure title={ar.sections.fullHadith}>
          <p className="m-0 text-start font-ui text-t-hadith-full text-sacred-hadith" lang="ar">
            {dua.hadith.fullNarration}
          </p>
          <p className="m-0 text-t-caption font-normal text-muted">
            {ar.card.hadithRef(dua.hadith.collection, dua.hadith.number)} · {num(dua.hadith.numbering)}
          </p>
          <p className="m-0 text-t-caption font-normal text-muted">{num(dua.hadith.gradeNote)}</p>
          <a href={dua.hadith.sourceUrl} target="_blank" rel="noopener noreferrer" className="self-start text-t-caption text-muted underline underline-offset-4">
            {ar.sections.copiedFrom}
          </a>
        </Disclosure>
      )}

      <Disclosure title={ar.sections.meaning}>
        {dua.meaning.glossary.map((g, i) => (
          <div key={i} className="flex flex-col gap-1">
            <SacredText kind={dua.kind} text={g.term} size="term" />
            <p className={para}>
              <Authored text={g.meaning} />
            </p>
          </div>
        ))}
        <p className={`${para} mt-2`}>
          <Authored text={dua.meaning.summary} />
        </p>
        <Sources basis={dua.meaning.basis} />
      </Disclosure>

      {dua.reflections.length > 0 && (
        <Disclosure title={ar.sections.reflections}>
          {dua.reflections.map((r, i) => (
            <p key={i} className={`${para} border-0 border-s-2 border-solid border-accent ps-3.5`}>
              <Authored text={r} />
            </p>
          ))}
        </Disclosure>
      )}

      {dua.whenToSay && (
        <Disclosure title={ar.sections.whenToSay}>
          <p className={para}>
            <Authored text={dua.whenToSay.text} />
          </p>
          {dua.whenToSay.note && (
            <p className="m-0 text-t-body-sm text-muted">
              <Authored text={dua.whenToSay.note} />
            </p>
          )}
        </Disclosure>
      )}
    </DisclosureGroup>
  );
}
