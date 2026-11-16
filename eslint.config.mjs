import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import prettier from 'eslint-config-prettier/flat';

/**
 * Architecture rules from docs/CONTRACT.md, enforced by the linter:
 *  - UI never touches storage directly (only src/lib/demo and the repositories may).
 *  - UI never imports raw seed data (it goes through repositories).
 */
const uiFiles = [
  'src/app/**/*.{ts,tsx}',
  'src/features/**/*.{ts,tsx}',
  'src/components/**/*.{ts,tsx}',
];

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  prettier,
  globalIgnores(['.next/**', 'out/**', 'node_modules/**', 'next-env.d.ts']),
  {
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
      'no-console': ['error', { allow: ['warn', 'error'] }],
      'no-warning-comments': [
        'error',
        { terms: ['todo', 'fixme', 'xxx', 'hack'], location: 'anywhere' },
      ],
      eqeqeq: ['error', 'always'],
    },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/lib/demo/**', 'src/data/repository/**'],
    rules: {
      'no-restricted-globals': [
        'error',
        { name: 'localStorage', message: 'Use a repository (src/data/repository).' },
        { name: 'sessionStorage', message: 'Use a repository (src/data/repository).' },
      ],
      'no-restricted-properties': [
        'error',
        { object: 'window', property: 'localStorage', message: 'Use a repository.' },
        { object: 'window', property: 'sessionStorage', message: 'Use a repository.' },
      ],
    },
  },
  {
    files: uiFiles,
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/lib/demo/storage', '@/lib/demo/storage/*'],
              message: 'UI must not touch storage. Use a repository from @/data/repository.',
            },
            {
              group: ['@/data/seed', '@/data/seed/*'],
              message: 'UI must not import seed data. Use a repository from @/data/repository.',
            },
          ],
        },
      ],
    },
  },
  {
    // Tests inspect the seed and the browser store on purpose; the architecture rules are for UI code.
    files: ['src/**/*.test.{ts,tsx}'],
    rules: {
      'no-restricted-globals': 'off',
      'no-restricted-properties': 'off',
      'no-restricted-imports': 'off',
    },
  },
  {
    // Command-line tooling prints progress to the terminal.
    files: ['scripts/**/*.ts'],
    rules: { 'no-console': 'off' },
  },
]);
