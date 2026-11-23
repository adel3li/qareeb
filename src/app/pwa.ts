/** Registers the service worker in production builds, so the app installs and works offline. */
export function registerServiceWorker(): void {
  if (import.meta.env.DEV || !('serviceWorker' in navigator)) return;
  void import('virtual:pwa-register').then(({ registerSW }) => registerSW({ immediate: true }));
}
