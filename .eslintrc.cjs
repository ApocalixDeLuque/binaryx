/* eslint-env node */
module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "react", "react-hooks"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "prettier",
  ],
  settings: {
    react: {
      version: "detect",
    },
  },
  parserOptions: {
    ecmaVersion: 2023,
    sourceType: "module",
    ecmaFeatures: { jsx: true },
    project: false,
  },
  env: {
    browser: true,
    node: true,
    es2023: true,
  },
  rules: {
    "react/react-in-jsx-scope": "off",
  },
  ignorePatterns: ["**/dist/**", "**/.next/**", "**/node_modules/**"],
};
