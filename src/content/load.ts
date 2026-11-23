import { use } from 'react';
import type { ContentBundle, Dua } from './types';

let promise: Promise<ContentBundle> | null = null;

/** The content bundle is its own chunk, loaded once (05 §4). */
export function loadContent(): Promise<ContentBundle> {
  promise ??= import('./generated/duas.json').then((m) => m.default as unknown as ContentBundle);
  return promise;
}

/** Suspends until the content is loaded; a failure reaches the root error boundary. */
export function useContent(): ContentBundle {
  return use(loadContent());
}

export function findDua(bundle: ContentBundle, id: string | undefined): Dua | undefined {
  return id ? bundle.duas.find((d) => d.id === id) : undefined;
}
