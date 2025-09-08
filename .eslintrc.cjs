/* eslint-env node */
module.exports = {
  root: true,
  env: { es2022: true, node: true, browser: true },
  parser: '@typescript-eslint/parser',
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  plugins: ['@typescript-eslint', 'react', 'react-hooks', 'import', 'tfe'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended'
  ],
  settings: { react: { version: 'detect' } },
  ignorePatterns: [
    '**/dist/**',
    '**/.next/**',
    '**/node_modules/**',
    'packages/eslint-plugin-tfe/**',
    'scripts/**'
  ],
  rules: {
    // TS + React 17+ defaults
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',

    // Ease migration noise
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unused-vars': [
      'warn',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }
    ],

    'tfe/no-bad-accent-usage': 'error'
  }
};
