import path from 'node:path';

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    outDir: 'build',
  },
  server: {
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
  resolve: {
    alias: [
      { find: '@', replacement: path.resolve(import.meta.dirname, 'src') },
      // Generated shadcn components import the bare `cn`; see shared/lib/cn.ts.
      {
        find: /^cn$/,
        replacement: path.resolve(import.meta.dirname, 'src/shared/lib/cn.ts'),
      },
    ],
  },
});
