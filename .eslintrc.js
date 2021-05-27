module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
  },
  settings: {},
  extends: [
    'plugin:@typescript-eslint/recommended',
    "prettier",
    "plugin:prettier/recommended"
  ],
  rules: {}
};
