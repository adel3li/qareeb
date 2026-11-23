/** iOS startup images: one per device size and colour scheme, rendered from design/brand/splash-*.svg. */
export const SPLASH_DEVICES: [number, number, number][] = [
  [320, 568, 2], [375, 667, 2], [414, 736, 3], [375, 812, 3], [414, 896, 2], [414, 896, 3], [360, 780, 3],
  [390, 844, 3], [428, 926, 3], [393, 852, 3], [430, 932, 3], [402, 874, 3], [440, 956, 3],
  [744, 1133, 2], [768, 1024, 2], [810, 1080, 2], [820, 1180, 2], [834, 1194, 2], [1024, 1366, 2],
];

export function splashFile(scheme: 'light' | 'dark', w: number, h: number, dpr: number): string {
  return `splash/splash-${scheme}-${w * dpr}x${h * dpr}.png`;
}

/** The <link rel="apple-touch-startup-image"> tags for index.html. */
export function splashLinks(): string {
  const out: string[] = [];
  for (const scheme of ['light', 'dark'] as const) {
    for (const [w, h, dpr] of SPLASH_DEVICES) {
      out.push(
        `<link rel="apple-touch-startup-image" media="(device-width: ${w}px) and (device-height: ${h}px) and (-webkit-device-pixel-ratio: ${dpr}) and (orientation: portrait) and (prefers-color-scheme: ${scheme})" href="/${splashFile(scheme, w, h, dpr)}">`,
      );
    }
  }
  return out.join('\n    ');
}
