/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true, // Use global test functions like describe, it, expect
    include: ['src/tests/**/*.js'], // Include our test files
  },
});