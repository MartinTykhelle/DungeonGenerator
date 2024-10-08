import globals from 'globals';
import pluginJs from '@eslint/js';
import jsdoc from 'eslint-plugin-jsdoc';

const config = [
  pluginJs.configs.recommended,
  // configuration included in plugin
  jsdoc.configs['flat/recommended'],
  // other configuration objects...
  {
    files: ['**/*.js'],
    plugins: {
      jsdoc,
    },
    rules: {
      'jsdoc/require-description': 'warn',
      'jsdoc/check-types': 1,
      'jsdoc/require-jsdoc': 1,
      'jsdoc/require-param': 1,
    },
  },

  { languageOptions: { globals: globals.browser } },
];

export default config;
