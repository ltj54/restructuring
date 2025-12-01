import js from '@eslint/js';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-plugin-prettier';

export default tseslint.config(js.configs.recommended, ...tseslint.configs.recommended, {
  files: ['**/*.{ts,tsx}'],
  ignores: ['dist/**', 'node_modules/**', 'vite.config.ts'],
  plugins: { react, 'react-hooks': reactHooks, prettier },
  languageOptions: {
    parserOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      ecmaFeatures: { jsx: true },
    },
  },
  settings: { react: { version: 'detect' } },
  rules: {
    // --- React / JSX ---
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',

    // --- TypeScript ---
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/explicit-function-return-type': 'off',

    // --- React Hooks ---
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',

    // --- Prettier ---
    'prettier/prettier': [
      'warn',
      {
        singleQuote: true,
        semi: true,
        trailingComma: 'es5',
        printWidth: 100,
        tabWidth: 2,
        endOfLine: 'lf',
      },
    ],
  },
});
