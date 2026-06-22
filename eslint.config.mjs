import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import unusedImports from "eslint-plugin-unused-imports";
import importPlugin from "eslint-plugin-import";
import boundaries from "eslint-plugin-boundaries";
import tseslint from "@typescript-eslint/eslint-plugin";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    plugins: {
      "unused-imports": unusedImports,
      import: importPlugin,
      boundaries,
      "@typescript-eslint": tseslint,
    },
    settings: {
      "boundaries/elements": [
        { type: "app", pattern: "app/**" },
        { type: "components", pattern: "components/**" },
        { type: "hooks", pattern: "hooks/**" },
        { type: "lib", pattern: "lib/**" },
        { type: "server", pattern: "server/**" },
      ],
      "boundaries/dependency-nodes": ["import"],
      "import/resolver": {
        typescript: true,
        node: true,
      },
    },
    rules: {
      "jsx-a11y/alt-text": "error",
      "jsx-a11y/anchor-is-valid": "error",
      "jsx-a11y/aria-props": "error",
      "jsx-a11y/aria-role": "error",
      "jsx-a11y/heading-has-content": "error",
      "jsx-a11y/label-has-associated-control": "error",
      "jsx-a11y/no-autofocus": "error",
      "jsx-a11y/interactive-supports-focus": "error",
      "jsx-a11y/click-events-have-key-events": "error",

      "unused-imports/no-unused-imports": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "import/no-cycle": "error",
      "import/no-duplicates": "error",
      "import/first": "error",
      "import/newline-after-import": "error",
      "import/order": [
        "error",
        {
          groups: [
            ["builtin", "external"],
            ["internal"],
            ["parent", "sibling", "index"],
            ["type"],
          ],
          "newlines-between": "always",
          alphabetize: { order: "asc", caseInsensitive: true },
        },
      ],
      "no-console": ["error", { allow: ["warn", "error"] }],
      "no-nested-ternary": "error",
      "max-depth": ["error", 3],
      "max-params": ["error", 4],
      complexity: ["error", 10],
      "max-lines": [
        "error",
        {
          max: 200,
          skipBlankLines: true,
          skipComments: true,
        },
      ],
      "max-lines-per-function": [
        "error",
        {
          max: 25,
          skipBlankLines: true,
          skipComments: true,
          IIFEs: true,
        },
      ],
      "boundaries/dependencies": [
        "error",
        {
          default: "allow",
          rules: [
            {
              from: { type: "components" },
              disallow: [{ to: { type: "server" } }],
              message: "Components must not import server-only code.",
            },
            {
              from: { type: "hooks" },
              disallow: [{ to: { type: "server" } }],
              message: "Hooks must not import server-only code.",
            },
            {
              from: { type: "server" },
              allow: [{ to: { type: "server" } }, { to: { type: "lib" } }],
            },
          ],
        },
      ],
    },
  },
  {
    files: ["app/**/page.tsx"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector:
            'Program > ExpressionStatement > Literal[value="use client"]',
          message:
            "page.tsx must remain a Server Component. Move interactivity into smaller client components.",
        },
      ],
    },
  },
  {
    files: ["components/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/server/*"],
              message: "Components must not import server-only modules.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["hooks/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/server/*"],
              message: "Hooks must not import server-only modules.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["script/**/*.mjs", "scripts/**/*.mjs"],
    rules: {
      "no-console": "off",
      "max-lines": "off",
    },
  },

  /*

* Tests: allow console, larger files/functions, and more branching where useful.
* These exceptions apply only to test code.
  */

  {
    files: [
      "tests/**/*.{ts,tsx}",
      "**/**tests**/**/*.{ts,tsx}",
      "**/*.{test,spec}.{ts,tsx}",
      "e2e/**/*.{ts,tsx}",
    ],
    rules: {
      "no-console": "off",
      "max-lines": "off",
      "max-lines-per-function": "off",
      "no-nested-ternary": "off",
      complexity: "off",
      "max-params": "off",
    },
  },

  /*

* Prisma seed script: allow console and a longer file for setup/bootstrap work.
* Keep this override narrow so it does not relax standards elsewhere.
  */
  {
    files: ["prisma/seed.ts", "lib/db/seed.ts", "lib/db/migrate.ts", "lib/db/verify-migration-target.ts"],
    rules: {
      "no-console": "off",
      "max-lines": "off",
      complexity: "off",
    },
  },

  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "dist/**",
    "coverage/**",
    "next-env.d.ts",
  ]),
]);
