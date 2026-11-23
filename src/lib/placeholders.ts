/** Temporary markers left in drafts: <<…>> for text to be copied or written, [[…]] for notes. */
const PLACEHOLDER = /<<[^<>]*>>|\[\[[^[\]]*\]\]/;

export function hasPlaceholder(text: string): boolean {
  return PLACEHOLDER.test(text);
}

/** Splits text into plain parts and placeholder parts, for showing drafts in preview builds. */
export function splitPlaceholders(text: string): { text: string; placeholder: boolean }[] {
  const parts: { text: string; placeholder: boolean }[] = [];
  const re = new RegExp(PLACEHOLDER.source, 'g');
  let last = 0;
  for (let m = re.exec(text); m; m = re.exec(text)) {
    if (m.index > last) parts.push({ text: text.slice(last, m.index), placeholder: false });
    parts.push({ text: m[0], placeholder: true });
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push({ text: text.slice(last), placeholder: false });
  return parts;
}
