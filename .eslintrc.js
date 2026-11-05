module.exports = {
  root: true,
  env: { browser: true, es2022: true },
  extends: [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended",
    "plugin:testing-library/react",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    ecmaFeatures: { jsx: true },
  },
  plugins: ["@typescript-eslint", "testing-library"],
  rules: {
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    "react/no-unescaped-entities": "off",
    "react-hooks/exhaustive-deps": "warn",
  },
  ignorePatterns: [".next/", "node_modules/", "dist/", "build/", "*.config.*", "*.md", "sw.js", "workbox-*.js"],
};