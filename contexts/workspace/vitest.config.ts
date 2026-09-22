import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      reportsDirectory: './coverage',
      // Модульными тестами покрыт домен; адаптеры и связывание Nest проверяются
      // интеграционно, поэтому в отношение не входят.
      include: ['src/domain/**/*.ts'],
      exclude: ['**/index.ts'],
    },
  },
});
