import { useEffect } from 'react';
import { useStored } from '../state/store';

/**
 * Applies the appearance settings on <html> only (never on another element):
 * data-theme when the user chose light or dark, and the root font size, which
 * every rem type style follows.
 */
export function useAppearance(): void {
  const { theme, fontScale } = useStored('settings');
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'system') delete root.dataset.theme;
    else root.dataset.theme = theme;
    root.style.fontSize = fontScale === 16 ? '' : `${fontScale}px`;
    const page = getComputedStyle(root).getPropertyValue('--page').trim();
    document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]').forEach((m) => {
      if (theme === 'system') {
        if (m.dataset.media) m.media = m.dataset.media;
        if (m.dataset.color) m.content = m.dataset.color;
      } else {
        if (m.media) m.dataset.media = m.media;
        if (!m.dataset.color) m.dataset.color = m.content;
        m.media = '';
        m.content = page;
      }
    });
  }, [theme, fontScale]);
}
