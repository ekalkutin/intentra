import path from 'node:path';

import { defineConfig } from 'vitest/config';

/** Unit tests on logic with no React and no network (docs/adr/0003-web-ui-is-an-fsd-spa-on-rtk-query.md). */
export default defineConfig({
  resolve: {
    alias: { '@': path.resolve(import.meta.dirname, './src') },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.spec.ts'],
  },
});
