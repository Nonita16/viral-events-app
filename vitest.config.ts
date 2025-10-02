import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./__tests__/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: [
        'app/api/**/*.ts',
        'lib/utils.ts',
      ],
      exclude: [
        'node_modules/**',
        '.next/**',
        'coverage/**',
        '**/*.config.*',
        '**/*.types.ts',
        '**/types/**',
        '__tests__/**',
        '**/*.test.ts',
        '**/*.test.tsx',
        'app/**/page.tsx',
        'app/**/layout.tsx',
        'app/api/**/generate-test-data/**',
        'app/api/auth/**',
        'components/**',
        'lib/supabase/**',
        'lib/providers/**',
        'middleware.ts',
      ],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
})
