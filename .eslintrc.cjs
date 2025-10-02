/**
 * ESLint configuration for Next.js + TypeScript
 * - Extends Next.js recommended rules
 * - Adds TypeScript support via @typescript-eslint
 * - Integrates with Prettier (prettier rules are applied last)
 */
module.exports = {
  root: true,
  extends: [
    'next/core-web-vitals',
    'plugin:@typescript-eslint/recommended',
    'prettier'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2024,
    sourceType: 'module',
    tsconfigRootDir: __dirname,
    project: ['./tsconfig.json']
  },
  plugins: ['@typescript-eslint'],
  rules: {
    // Project-specific overrides can go here.
    // Example: allow non-null assertions in short-lived code
    '@typescript-eslint/no-non-null-assertion': 'off'
  },
  settings: {
    react: {
      version: 'detect'
    }
  }
};
