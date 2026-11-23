import svg from '../../public/brand/wordmark.svg?raw';

/** The wordmark inline, in currentColor (`text`), so it follows the theme. */
export function Wordmark({ className = '' }: { className?: string }) {
  return <span role="img" aria-label="قريب" className={`inline-block [&>svg]:h-full [&>svg]:w-auto ${className}`} dangerouslySetInnerHTML={{ __html: svg.replace(/<title>.*?<\/title>/, '').replace('role="img"', 'aria-hidden="true"') }} />;
}
