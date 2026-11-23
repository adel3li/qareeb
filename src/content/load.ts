import { create } from 'zustand';
import type { AppDua, ContentFile } from './types';

/**
 * The cards, loaded as their own chunk (dynamic import), not in the main
 * bundle. The file is written by scripts/build-content.ts at build time and
 * cached by the service worker, so it works offline.
 */

interface ContentState {
  status: 'loading' | 'ready' | 'error';
  file: ContentFile | null;
  byId: Map<string, AppDua>;
}

export const useContent = create<ContentState>()(() => ({ status: 'loading', file: null, byId: new Map() }));

let started = false;
export function loadContent(): void {
  if (started) return;
  started = true;
  import('./generated/duas.json')
    .then((mod) => {
      const file = (mod as { default: ContentFile }).default;
      useContent.setState({ status: 'ready', file, byId: new Map(file.duas.map((d) => [d.id, d])) });
    })
    .catch(() => useContent.setState({ status: 'error' }));
}

export function isPreview(): boolean {
  return useContent.getState().file?.meta.preview ?? false;
}

export function useDuas(): AppDua[] {
  return useContent((s) => s.file?.duas ?? EMPTY);
}
const EMPTY: AppDua[] = [];

export function useDua(id: string | undefined): AppDua | undefined {
  return useContent((s) => (id ? s.byId.get(id) : undefined));
}
