import wordmarkSvg from '../../design/brand/wordmark.svg?raw';
import { ar } from '../copy/ar';

/** The wordmark inline, in currentColor (text). Generated file from design/brand; never redrawn. */
export function Wordmark({ className = 'h-[30px]' }: { className?: string }) {
  return (
    <span
      role="img"
      aria-label={ar.app.name}
      className={`inline-block text-text [&>svg]:block [&>svg]:h-full [&>svg]:w-auto ${className}`}
      dangerouslySetInnerHTML={{ __html: wordmarkSvg.replace(/<title>.*?<\/title>/, '').replace('role="img"', 'aria-hidden="true"') }}
    />
  );
}
