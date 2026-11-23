import { splitPlaceholders } from '../lib/placeholders';

/**
 * Authored or transmitted text from a card. In preview builds a draft can still hold
 * <<…>> placeholders: they are shown in the warning colour so nobody mistakes them for content.
 */
export function Authored({ text }: { text: string }) {
  const parts = splitPlaceholders(text);
  if (parts.length === 1 && !parts[0].placeholder) return <>{text}</>;
  return (
    <>
      {parts.map((p, i) =>
        p.placeholder ? (
          <mark key={i} className="rounded-sm bg-transparent font-medium text-danger">
            {p.text}
          </mark>
        ) : (
          <span key={i}>{p.text}</span>
        ),
      )}
    </>
  );
}
