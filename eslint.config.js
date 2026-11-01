import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript';
import { flatConfigs as importXConfigs } from 'eslint-plugin-import-x';
import { configs as typescriptConfigs } from 'typescript-eslint';

export default defineConfig(
  { ignores: ['dist/**', 'src/generated/**'] },
  js.configs.recommended,
  typescriptConfigs.recommended,
  importXConfigs.recommended,
  importXConfigs.typescript,
  {
    rules: {
      '@typescript-eslint/consistent-type-imports': 'error',
      'import-x/no-extraneous-dependencies': [
        'error',
        {
          devDependencies: [
            '**/*.config.*',
            '**/*.test.ts',
            'src/test-helpers.ts',
          ],
        },
      ],
      'import-x/order': ['error', { alphabetize: { order: 'asc' } }],
      'complexity': ['error', 10],
      'max-lines-per-function': [
        'error',
        { IIFEs: true, max: 40, skipBlankLines: true, skipComments: true },
      ],
      'max-params': ['error', 2],
    },
    settings: {
      'import-x/resolver-next': [createTypeScriptImportResolver()],
    },
  },
  {
    files: ['**/*.test.ts', 'test/**', 'e2e/**'],
    rules: { 'max-lines-per-function': 'off' },
  },
);
