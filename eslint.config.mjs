import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import boundaries from "eslint-plugin-boundaries";

/** @type {import("eslint").Linter.Config[]} */
export default [
  {
    ignores: [
      "node_modules/**",
      ".expo/**",
      "dist/**",
      "build/**",
      "babel.config.js",
    ],
  },
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      boundaries,
    },
    settings: {
      "boundaries/elements": [
        { type: "app", pattern: "app/**/*" },
        { type: "widgets", pattern: "src/widgets/**/*" },
        { type: "features", pattern: "src/features/**/*" },
        { type: "entities", pattern: "src/entities/**/*" },
        { type: "shared", pattern: "src/shared/**/*" },
        { type: "types", pattern: "src/types/**/*" },
      ],
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",

      // FSD-lite: import unidirecional app→widgets→features→entities→shared→types
      // Nenhuma camada importa "pra cima" nem lateralmente entre slices da mesma camada.
      "boundaries/dependencies": [
        "error",
        {
          default: "disallow",
          rules: [
            {
              from: { type: "app" },
              allow: { to: { type: ["widgets", "features", "entities", "shared", "types"] } },
            },
            {
              from: { type: "widgets" },
              allow: { to: { type: ["features", "entities", "shared", "types"] } },
            },
            {
              from: { type: "features" },
              allow: { to: { type: ["entities", "shared", "types"] } },
            },
            {
              from: { type: "entities" },
              allow: { to: { type: ["shared", "types"] } },
            },
            {
              from: { type: "shared" },
              allow: { to: { type: ["types"] } },
            },
          ],
        },
      ],
    },
  },
];
