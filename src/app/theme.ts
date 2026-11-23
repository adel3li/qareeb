import { useEffect } from 'react';
import { useSettings } from '../state/stores';

/**
 * Applies the appearance settings to <html>, and only to <html>: `data-theme` when the user
 * chose light or dark (none for «تلقائي», which follows the system), and the root font size,
 * which every rem-based type style follows. public/theme-boot.js does the same before first paint.
 */
export function useApplyAppearance(): void {
  const theme = useSettings((s) => s.theme);
  const fontScale = useSettings((s) => s.fontScale);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'system') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', theme);
    const page = getComputedStyle(root).getPropertyValue('--page').trim();
    document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]').forEach((meta) => {
      if (theme === 'system') {
        meta.content = meta.dataset.default ?? meta.content;
      } else {
        meta.dataset.default ??= meta.content;
        meta.content = page;
      }
    });
  }, [theme]);

  useEffect(() => {
    document.documentElement.style.fontSize = `${fontScale}px`;
  }, [fontScale]);
}
