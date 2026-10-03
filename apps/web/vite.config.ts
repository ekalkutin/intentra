import { readFileSync } from 'node:fs';
import path from 'node:path';

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'intentra-startup',
      transformIndexHtml(html) {
        const read = (file: string) =>
          readFileSync(path.resolve(import.meta.dirname, file), 'utf8');
        const copy = JSON.parse(read('src/shared/i18n/locales/startup.json'));
        return html
          .replace(
            '<!-- startup:css -->',
            () => `<style>${read('src/app/entrypoint/startup.css')}</style>`,
          )
          .replace('<!-- startup:logo -->', () =>
            read('public/intentra-wordmark-inverse.svg'),
          )
          .replace(
            '<!-- startup:noscript -->',
            () =>
              `<p>${copy.ru.noScript}</p><p lang="en">${copy.en.noScript}</p>`,
          )
          .replace(
            '<!-- startup:script -->',
            () =>
              `<script id="startup-copy" type="application/json">${JSON.stringify(copy).replaceAll('<', '\\u003c')}</script><script>${read('src/app/entrypoint/startup.js')}</script>`,
          );
      },
    },
  ],
  resolve: {
    alias: { '@': path.resolve(import.meta.dirname, './src') },
  },
  build: {
    outDir: 'build',
  },
  server: {
    port: 5173,
    // The UI calls a relative `/api`: the same origin in development, no CORS.
    proxy: {
      '/api': {
        target: process.env.INTENTRA_API_URL ?? 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
