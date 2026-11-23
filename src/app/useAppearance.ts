import { useEffect } from 'react';
import { useSettings } from '../state/store';

/**
 * The theme and the text size, applied to <html> and nowhere else:
 * data-theme only when the user chose light or dark (otherwise the system
 * decides through prefers-color-scheme), and the root font size in px, which
 * every rem-based type style follows. public/theme-boot.js applies the same
 * before the first paint.
 */
export function useAppearance(): void {
  const theme = useSettings((s) => s.theme);
  const fontScale = useSettings((s) => s.fontScale);
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'system') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', theme);
    root.style.fontSize = `${fontScale}px`;
  }, [theme, fontScale]);
}
