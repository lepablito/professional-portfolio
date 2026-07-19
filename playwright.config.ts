import { defineConfig } from "@playwright/test";

// Smoke + accessibility tests over the real static build: `npm run build`
// first, then this serves dist/ via `astro preview` (which honors the base
// path, like production). bypassCSP lets axe-core inject itself despite the
// hardened meta CSP — the site's own scripts are still exercised normally.
export default defineConfig({
  testDir: "tests/e2e",
  use: {
    baseURL: "http://localhost:4321/professional-portfolio/",
    bypassCSP: true,
  },
  webServer: {
    command: "npm run preview",
    url: "http://localhost:4321/professional-portfolio/",
    reuseExistingServer: !process.env.CI,
  },
});
