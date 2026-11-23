import type { Dua } from '../../content/types';
import { APP_NAME, APP_URL } from '../../config';
import { hrefOf } from '../../app/router';
import { referenceOf } from '../dua/reference';

/**
 * The text version of a shared dua (02 §10). It carries the dua and its source,
 * never anything the user wrote.
 */
export function shareText(dua: Pick<Dua, 'id' | 'title' | 'kind' | 'text' | 'sceneLine' | 'quran' | 'hadith'>, baseUrl = APP_URL): string {
  const [open, close] = dua.kind === 'quran' ? ['﴿', '﴾'] : ['«', '»'];
  return [`«${dua.title}»`, `${open}${dua.text}${close}`, `[${referenceOf(dua)}]`, '', dua.sceneLine, `— ${APP_NAME}  ${duaUrl(dua.id, baseUrl)}`].join('\n');
}

export function duaUrl(id: string, baseUrl = APP_URL): string {
  return `${baseUrl}/${hrefOf({ name: 'dua', id })}`;
}
