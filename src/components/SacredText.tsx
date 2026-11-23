import type { DuaKind } from '../content/types';

interface Props {
  kind: DuaKind;
  /** The text exactly as stored in the card. Never a string typed in code. */
  text: string;
  /** «سورة الأنبياء: ٨٧» or «صحيح مسلم (٢٧٠٥)». */
  reference?: string;
  size?: 'card' | 'live';
  children?: React.ReactNode;
}

/**
 * The only way a verse or a hadith is shown: its marks, its face, its colour,
 * inside the arch, with the reference under it. Never truncated, clamped,
 * scrolled or animated; long text grows the frame.
 */
export function SacredText({ kind, text, reference, size = 'card', children }: Props) {
  const quran = kind === 'quran';
  return (
    <figure className="arch m-0 border border-solid border-sacred-frame bg-sacred-bg px-3.5 pt-16 pb-[18px] text-center">
      <blockquote
        lang="ar"
        dir="rtl"
        className={
          quran
            ? `m-0 font-mushaf text-sacred-quran ${size === 'live' ? 'text-t-quran-live' : 'text-t-quran'}`
            : 'm-0 font-sans text-t-hadith font-medium text-sacred-hadith'
        }
      >
        {quran ? `﴿${text}﴾` : `«${text}»`}
      </blockquote>
      {reference ? <figcaption className="mt-2 text-t-label font-medium text-text-muted">{reference}</figcaption> : null}
      {children}
    </figure>
  );
}

/** A word or phrase copied from the dua, in the meaning glossary: its own face and colour, no arch, no marks. */
export function SacredTerm({ kind, text }: { kind: DuaKind; text: string }) {
  return (
    <dt lang="ar" className={kind === 'quran' ? 'font-mushaf text-[1.375rem] leading-[2] text-sacred-quran' : 'font-sans text-t-body font-semibold text-sacred-hadith'}>
      {text}
    </dt>
  );
}

/** The full narration of a hadith, exactly as copied, without « » (the source has its own marks), set to the start. */
export function FullNarration({ text }: { text: string }) {
  return (
    <p lang="ar" className="m-0 text-start font-sans text-t-hadith-full text-sacred-hadith">
      {text}
    </p>
  );
}
