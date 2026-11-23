import { PLACEHOLDER_SPLIT } from './placeholders';

/** Authored or transmitted text; in a preview build, <<…>> placeholders show in danger. */
export function Authored({ text }: { text: string }) {
  const parts = text.split(PLACEHOLDER_SPLIT);
  if (parts.length === 1) return <>{text}</>;
  return (
    <>
      {parts.map((p, i) => (PLACEHOLDER_SPLIT.test(p) ? <mark key={i} className="bg-transparent text-danger">{p}</mark> : <span key={i}>{p}</span>))}
    </>
  );
}
