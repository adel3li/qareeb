import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import { readFileSync } from 'node:fs';
import { splashLinks } from './scripts/lib/splash';

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')) as { version: string };

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  plugins: [
    {
      name: 'qareeb-splash-links',
      transformIndexHtml: (html) => html.replace('<!--splash-->', splashLinks()),
    },
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: null,
      includeAssets: ['brand/*.svg', 'brand/*.png', 'splash/*.png', 'fonts/*.woff2', 'theme-boot.js'],
      manifest: {
        name: 'قريب',
        short_name: 'قريب',
        description: 'دعاءٌ واحد كلَّ يوم من القرآن والسنة، مع موقفه ومعناه.',
        lang: 'ar',
        dir: 'rtl',
        start_url: '/#/today',
        scope: '/',
        display: 'standalone',
        background_color: '#e7e4de',
        theme_color: '#e7e4de',
        icons: [
          { src: '/brand/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/brand/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/brand/icon-maskable-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
          { src: '/brand/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,json,woff2,svg,png,ico}'],
        globIgnores: ['splash/**', 'brand/icon-1024.png', 'brand/og-image-1200x630.png'],
        navigateFallback: '/index.html',
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
      },
    }),
  ],
  build: {
    target: 'es2022',
  },
  test: {
    include: ['src/**/*.test.ts', 'scripts/**/*.test.ts'],
    environment: 'node',
  },
});
