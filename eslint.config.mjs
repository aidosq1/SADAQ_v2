import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Prisma scripts and seeds
    "prisma/**/*.ts",
    "prisma/**/*.js",
    // External libraries
    "public/map/**/*.js",
    // Scripts
    "scripts/**/*.ts",
    // Tests
    "tests/**/*.ts",
  ]),
  // Custom rules - downgrade errors to warnings for CI
  {
    rules: {
      "react/no-unescaped-entities": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      "prefer-const": "warn",
    },
  },
]);

export default eslintConfig;
