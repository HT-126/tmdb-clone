import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Test files share one test database, so run them one after another.
    fileParallelism: false,
    // The auth tests make many register and login calls from one address.
    // The rate limiter itself is tested separately with its own small limit.
    env: {
      AUTH_RATE_LIMIT_MAX: '100000',
    },
  },
});
