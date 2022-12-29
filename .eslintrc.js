module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    'plugin:vue/vue3-recommended',
    'plugin:vue/vue3-essential',
    '@vue/airbnb',
  ],
  parserOptions: {
    parser: '@babel/eslint-parser',
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'vue/multi-word-component-names': 'off',
    'no-bitwise': 'off',
    'max-len': [
      'warn',
      {
        code: 150,
        ignoreComments: true,
        ignoreUrls: true,
      },
    ],
    'no-mixed-operators': 'off',
    'import/prefer-default-export': 'warn',
    'no-param-reassign': 'warn',
    'comma-dangle': [2, 'always-multiline'],
    'vue/max-attributes-per-line': ['error', {
      singleline: {
        max: 3,
      },
      multiline: {
        max: 1,
      },
    }],
    'vue/singleline-html-element-content-newline': ['off'],
    'no-plusplus': ['error', { allowForLoopAfterthoughts: true }],
  },
  overrides: [
    {
      files: [
        '**/__tests__/*.{j,t}s?(x)',
        '**/tests/unit/**/*.spec.{j,t}s?(x)',
      ],
      env: {
        jest: true,
      },
    },
  ],
};
