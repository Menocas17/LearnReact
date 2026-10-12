import { defineConfig, devices } from "@playwright/test";

// Los E2E arrancan la app en modo local con una base de datos PGlite propia,
// para no tocar tu progreso real (./.data).
export default defineConfig({
  testDir: "e2e",
  timeout: 120_000,
  fullyParallel: false,
  workers: 1,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://localhost:3100",
    trace: "retain-on-failure",
    // Permite usar un Chromium ya instalado (PW_CHROMIUM_PATH) en vez del que descarga Playwright.
    launchOptions: process.env.PW_CHROMIUM_PATH ? { executablePath: process.env.PW_CHROMIUM_PATH } : {},
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "rm -rf .data/e2e && pnpm next dev --port 3100",
    url: "http://localhost:3100",
    reuseExistingServer: false,
    timeout: 180_000,
    env: { AUTH_MODE: "local", PGLITE_DIR: ".data/e2e" },
  },
});
