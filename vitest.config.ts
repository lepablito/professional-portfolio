import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // tests/e2e/ belongs to Playwright (npm run test:e2e), not Vitest.
    exclude: ["**/node_modules/**", "tests/e2e/**"],
  },
});
