import globals from "globals";
import pluginJs from "@eslint/js";
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
      'jsdoc/require-description': 'warn'
    }
  },

  { languageOptions: { globals: globals.browser } },
];

export default config;