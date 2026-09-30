import path from 'node:path';

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
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
