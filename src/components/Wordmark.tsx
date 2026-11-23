import wordmark from '../assets/wordmark.svg?raw';

/** The word «قريب» as outlines, in `text` through currentColor (design/system/logo.md). */
export function Wordmark({ className = 'h-[30px]' }: { className?: string }) {
  const svg = wordmark.replace('<svg ', '<svg aria-hidden="true" focusable="false" style="height:100%;width:auto;display:block" ');
  return (
    <span role="img" aria-label="قريب" className={`inline-block text-ink ${className}`} dangerouslySetInnerHTML={{ __html: svg }} />
  );
}
