import { use } from 'react';
import type { ContentBundle, Dua } from './types';

let promise: Promise<ContentBundle> | null = null;
let loaded: ContentBundle | null = null;

/** The content bundle is its own chunk, loaded once (05 §4). */
export function loadContent(): Promise<ContentBundle> {
  promise ??= import('./generated/duas.json').then((m) => {
    loaded = m.default as unknown as ContentBundle;
    return loaded;
  });
  return promise;
}

/** The bundle once loaded; suspends only the first time. A failure reaches the root error boundary. */
export function useContent(): ContentBundle {
  return loaded ?? use(loadContent());
}

export function findDua(bundle: ContentBundle, id: string | undefined): Dua | undefined {
  return id ? bundle.duas.find((d) => d.id === id) : undefined;
}
