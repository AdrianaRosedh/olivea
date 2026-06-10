import { defineConfig, devices } from "@playwright/test";

// Smoke suite. Runs against a production build (`next start`) on port 3100
// so it never collides with the dev server on olivea-localhost:3000.
// Locally: pnpm build && pnpm test:e2e
// CI runs the same two steps (see .github/workflows/ci.yml).
export default defineConfig({
  testDir: "./e2e",
  timeout: 45_000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",

  use: {
    baseURL: "http://localhost:3100",
    trace: "on-first-retry",
  },

  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    {
      // Pixel 7 is Chromium-based — one browser download covers both
      // projects (iPhone devices would require WebKit).
      name: "mobile",
      use: { ...devices["Pixel 7"] },
      testMatch: /smoke\.spec\.ts/,
    },
  ],

  webServer: {
    command: "pnpm exec next start --port 3100",
    url: "http://localhost:3100/es",
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
