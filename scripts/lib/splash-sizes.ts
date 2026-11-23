/** iOS startup image sizes (portrait): CSS width × height at a device pixel ratio. */
export const SPLASH_SIZES: [number, number, number][] = [
  [430, 932, 3], [393, 852, 3], [428, 926, 3], [390, 844, 3], [375, 812, 3], [414, 896, 3], [414, 896, 2],
  [414, 736, 3], [375, 667, 2], [320, 568, 2],
  [1024, 1366, 2], [834, 1194, 2], [820, 1180, 2], [834, 1112, 2], [810, 1080, 2], [768, 1024, 2], [744, 1133, 2],
];

export const splashFile = (theme: 'light' | 'dark', w: number, h: number, r: number) => `/splash/${theme}-${w * r}x${h * r}.png`;

/** The <link rel="apple-touch-startup-image"> tags, light and dark per size. */
export function splashLinks(): string {
  return SPLASH_SIZES.flatMap(([w, h, r]) =>
    (['light', 'dark'] as const).map((theme) => {
      const media = `(device-width: ${w}px) and (device-height: ${h}px) and (-webkit-device-pixel-ratio: ${r}) and (orientation: portrait) and (prefers-color-scheme: ${theme})`;
      return `<link rel="apple-touch-startup-image" media="${media}" href="${splashFile(theme, w, h, r)}" />`;
    }),
  ).join('\n    ');
}
