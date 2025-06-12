import { defineConfig } from 'vitest/config'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  resolve: {
    alias: {
      '~': path.resolve(__dirname, './')
    }
  },
  test: {
    mockReset: true,
    testTimeout: 40000,
    hookTimeout: 40000,
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/cypress/**',
      '**/.{idea,git,cache,output,temp}/**',
      '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build,eslint,prettier,stylelint,postcss}.config.*',
      '**/test/**'
    ],
    globals: true,
    environment: 'jsdom',
    coverage: {
      enabled: true,
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/cypress/**',
        '**/.{idea,git,cache,output,temp}/**',
        '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build,eslint,prettier,stylelint,postcss}.config.*',
        '**/test/**',
        '**/coverage/**',
        '**/types/**',
        '**/*.d.ts',
        '**/*.test.ts',
        '**/*.spec.ts',
        '**/.server/**',
        '**/.eslintrc.cjs',
        '**/.prettierrc.js'
      ],
      excludeNodeModules: true,
      all: true,
      skipFull: false,
      extension: ['.js', '.ts'], // Failed to load coverage without ts extension
      include: ['src/**/*.{js,ts}'], // Failed to load coverage without ts extension
      thresholds: {
        statements: 40,
        branches: 40,
        functions: 40,
        lines: 40
      },
      reportOnFailure: true,
      ignoreEmptyLines: false,
      perFile: true
    }
  }
})
