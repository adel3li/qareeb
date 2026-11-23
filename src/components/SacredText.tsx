import type { DuaKind } from '../content/types';

/**
 * The only way a verse or a hadith is shown. The text is passed exactly as
 * stored in the card, never a string typed in code. Never truncated: long text
 * grows the arch. Marks: ﴿ ﴾ for the Qur'an, « » for hadith.
 */
export function SacredText({ kind, text, reference, size = 'card', frame = true }: {
  kind: DuaKind;
  text: string;
  reference?: string;
  /** 'term': a word or phrase copied from the text, in the meaning section (no frame, no marks). */
  size?: 'card' | 'live' | 'term';
  frame?: boolean;
}) {
  const quran = kind === 'quran';
  if (size === 'term') {
    return (
      <p className={`m-0 ${quran ? 'font-quran text-[1.375rem] leading-[2] text-sacred-quran' : 'font-ui text-t-body-lg font-medium text-sacred-hadith'}`} lang="ar">
        {text}
      </p>
    );
  }
  const style = quran
    ? `font-quran text-sacred-quran ${size === 'live' ? 'text-t-quran-live' : 'text-t-quran'}`
    : 'font-ui text-sacred-hadith text-t-hadith';
  return (
    <figure className={`m-0 text-center ${frame ? 'arch border border-solid border-sacred-frame bg-sacred-bg px-3.5 pt-16 pb-[18px]' : ''}`}>
      <blockquote className={`m-0 whitespace-pre-line break-words ${style}`} lang="ar" dir="rtl">
        {quran ? '﴿' : '«'}
        {text}
        {quran ? '﴾' : '»'}
      </blockquote>
      {reference && <figcaption className="mt-2 text-t-label font-normal text-muted">{reference}</figcaption>}
    </figure>
  );
}
