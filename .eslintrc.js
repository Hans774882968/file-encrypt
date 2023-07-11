module.exports = {
  root: true,
  env: {
    node: true,
  },
  // plugins: [
  //   '@hans774882968/use-i18n',
  // ],
  extends: [
    'plugin:vue/vue3-recommended',
    'plugin:vue/vue3-essential',
    '@vue/airbnb',
    // 'plugin:@hans774882968/use-i18n/all',
  ],
  parserOptions: {
    parser: '@babel/eslint-parser',
  },
  rules: {
    // '@hans774882968/use-i18n/no-console': ['error', {
    //   excludedFiles: [
    //     'add-copyright-plugin.js',
    //     'copyright-print.js',
    //     'webpack-plugin-utils.js',
    //     'src/utils/my-eslint-plugin-tests/no-warn-folder/**/*.js',
    //     'tests/**/*.js',
    //     'src/utils/my-eslint-plugin-tests/i18n-tests/*.js',
    //   ],
    // }],
    // '@hans774882968/use-i18n/i18n-usage': ['error', {
    //   i18nFunctionNames: ['$i18n', '$t'],
    // }],
    // '@hans774882968/use-i18n/i18n-usage-vue': ['error', {
    //   i18nFunctionNames: ['$i18n', '$t'],
    // }],
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
    'no-plusplus': ['off'],
    'import/no-cycle': 'off',
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
