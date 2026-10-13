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
    // Carpeta temporal del validador de contenido.
    ".validate-tmp/**",
    // Datos locales y resultados de Playwright.
    ".data/**",
    "test-results/**",
    "playwright-report/**",
  ]),
]);

export default eslintConfig;
