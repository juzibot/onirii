module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
  },
  settings: {
    compilerOptions: {
      "target": "es2018",
      "module": "commonjs",
      "outDir": "./dist",
      "sourceMap": true
    }
  },
  include: ["src/**/*.ts"],
  exclude: ["node_modules"],
  extends: [
    'plugin:@typescript-eslint/recommended',
    "prettier",
    "plugin:prettier/recommended"
  ],
  rules: {}
};
