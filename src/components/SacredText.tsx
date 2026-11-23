import { ar } from '../copy/ar';
import type { SacredKind } from '../lib/reference';

/**
 * The only way a verse or a hadith appears: the copied text exactly as stored, in its face,
 * marks and colour, inside the arch, with its reference under it. Never truncated, clamped,
 * faded or scrolled; long text grows the frame.
 */
export function SacredText({
  kind,
  text,
  reference,
  size = 'card',
  placeholder = false,
  note,
}: {
  kind: SacredKind;
  /** Exactly as stored in the card. Never a string typed in code. */
  text: string;
  reference: string;
  size?: 'card' | 'live';
  /** Preview only: the text is a draft placeholder, not sacred text. */
  placeholder?: boolean;
  /** Preview only: a note about a draft. */
  note?: string;
}) {
  const quran = kind === 'quran';
  return (
    <figure className="arch m-0 border border-sacred-frame bg-sacred-bg px-[14px] pt-16 pb-[18px] text-center">
      {placeholder ? (
        <p className="m-0 text-t-body font-medium text-danger" lang="ar">
          {text}
        </p>
      ) : quran ? (
        <p lang="ar" className={`m-0 font-q-quran text-sacred-quran ${size === 'live' ? 'text-t-quran-live' : 'text-t-quran'}`}>
          ﴿{text}﴾
        </p>
      ) : (
        <p lang="ar" className="m-0 font-q-ui text-t-hadith text-sacred-hadith">
          «{text}»
        </p>
      )}
      <figcaption className="mt-2 text-t-label font-normal text-text-muted">{reference}</figcaption>
      {note && (
        <p className="mx-auto mt-2 mb-0 max-w-[36ch] text-t-caption text-danger">
          <span className="font-semibold">{ar.draft.label}: </span>
          {note}
        </p>
      )}
    </figure>
  );
}
