import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import pkg from './package.json' with { type: 'json' };

process.env.VITE_APP_VERSION = pkg.version;

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
