import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL(".", import.meta.url)),
      // Next.js provides `server-only` at build time; tests run plain Node.
      "server-only": fileURLToPath(new URL("./tests/stubs/server-only.ts", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    clearMocks: true,
    // e2e/ holds Playwright specs (pnpm test:e2e); vitest must not collect them.
    exclude: ["**/node_modules/**", "**/.next/**", "e2e/**"],
  },
});
