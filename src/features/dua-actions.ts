import { ar } from '../copy/ar';
import type { Dua } from '../content/types';
import { displayTextOf, referenceOf } from '../lib/reference';
import { useUi } from '../state/ui';

/** Address of a dua's page in the app (#/dua/:id), from the current origin. */
export function duaLink(id: string): string {
  return `${location.origin}${location.pathname}#/dua/${id}`;
}

/**
 * The text version of a dua for copying and sharing (02-ux-and-screens.md §10).
 * Never includes anything the user wrote.
 */
export function shareText(dua: Dua): string {
  const shown = displayTextOf(dua);
  const marked = dua.kind === 'quran' ? `﴿${shown.text}﴾` : `«${shown.text}»`;
  return `«${dua.title}»\n${marked}\n[${referenceOf(dua)}]\n\n${dua.sceneLine}\n— ${ar.appName}  ${duaLink(dua.id)}`;
}

export async function copyDua(dua: Dua): Promise<void> {
  const announce = useUi.getState().announce;
  try {
    await navigator.clipboard.writeText(shareText(dua));
    announce(ar.common.copied);
  } catch {
    announce(ar.common.copyFailed);
  }
}
