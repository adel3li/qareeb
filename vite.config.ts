import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import { readFileSync } from 'node:fs';
import pkg from './package.json' with { type: 'json' };
import { splashLinks } from './scripts/lib/splash-sizes';

process.env.VITE_APP_VERSION = pkg.version;

// The browser colours come from the design tokens, the single source (design/system/tokens.json).
const tokens = JSON.parse(readFileSync('design/system/tokens.json', 'utf8'));
const page = tokens.color.tokens.find((t: { name: string }) => t.name === 'page').value as { light: string; dark: string };

/** Fills the theme colours and the iOS startup images into index.html. */
function headTags(): Plugin {
  return {
    name: 'qareeb-head',
    transformIndexHtml: (html) =>
      html
        .replace('%THEME_LIGHT%', page.light)
        .replace('%THEME_DARK%', page.dark)
        .replace('<!-- splash -->', splashLinks()),
  };
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    headTags(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'script',
      includeAssets: ['favicon.svg', 'icons/*.png', 'icons/*.svg', 'fonts/*.woff2'],
      manifest: {
        name: 'قريب',
        short_name: 'قريب',
        description: 'دعاءٌ واحد كلَّ يوم من القرآن والسنة، مع موقفه ومعناه.',
        lang: 'ar',
        dir: 'rtl',
        start_url: '/#/today',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: page.light,
        theme_color: page.light,
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-maskable-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
          { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Everything the app needs offline: the shell, every lazy screen, the content chunk, the fonts.
        globPatterns: ['**/*.{js,css,html,woff2,svg}', 'icons/*.png'],
        navigateFallback: '/index.html',
        cleanupOutdatedCaches: true,
      },
    }),
  ],
});
