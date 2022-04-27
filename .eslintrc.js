module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: ['airbnb-base', 'prettier', 'plugin:import/recommended', 'plugin:import/typescript'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'import'],
  rules: {
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        js: 'never',
        jsx: 'never',
        ts: 'never',
        tsx: 'never',
      },
    ],
    'import/prefer-default-export': 0,
    '@typescript-eslint/no-unused-vars': [2, { args: 'none' }],
    'no-unused-vars': 0,
  },
  settings: {
    'import/extensions': ['.js', '.jsx', '.ts', '.tsx'],
    'import/resolver': {
      typescript: {
        project: 'tsconfig.json',
      },
    },
  },
  overrides: [
    {
      files: ['**/*.{spec,test}.{ts,tsx,js,jsx}', '**/__tests__/**'],
      env: { 'jest/globals': true },
      plugins: ['jest'],
      extends: ['plugin:jest/recommended'],
    },
  ],
}
