module.exports = {
  root: true,
  ignorePatterns: [
    'dist/**',
    '.next/**',
    'coverage/**',
    'node_modules/**',
  ],
  env: { es2022: true, node: true, browser: true },
  parser: '@typescript-eslint/parser',
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module', project: false },
  plugins: ['@typescript-eslint', 'unused-imports', 'import'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'prettier',
  ],
  rules: {
    'import/no-unresolved': 'off',
    'unused-imports/no-unused-imports': 'warn',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
  },
  overrides: [
    {
      files: ['apps/web/**/*.tsx', 'apps/web/**/*.ts'],
      env: { browser: true, node: false },
    },
    {
      files: ['apps/api/**/*.ts'],
      env: { node: true, browser: false },
    },
  ],
};
