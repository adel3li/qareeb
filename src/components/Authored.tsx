import { Fragment } from 'react';
import { isPreview } from '../content/load';
import { ar } from '../copy/ar';

const PLACEHOLDER = /(<<[^>]*>>|\[\[[^\]]*\]\])/g;

/**
 * Authored or transmitted text from a card. In a preview build, placeholders
 * left for text still to be written (<<…>>) are shown in the warning colour;
 * production builds never contain them (validate-content fails).
 */
export function Authored({ text }: { text: string }) {
  if (!isPreview() || !PLACEHOLDER.test(text)) return <>{text}</>;
  PLACEHOLDER.lastIndex = 0;
  return (
    <>
      {text.split(PLACEHOLDER).map((part, i) =>
        i % 2 === 1 ? (
          <mark key={i} title={ar.preview.placeholder} className="bg-transparent text-danger">
            {part}
          </mark>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}
