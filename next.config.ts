import type { NextConfig } from "next";
import { basePath } from "./lib/site";

// ACTIVE SETUP: project repo (lepablito/professional-portfolio) served at
// https://lepablito.github.io/professional-portfolio/ — the deploy workflow
// sets NEXT_PUBLIC_BASE_PATH=/professional-portfolio, which lib/site.ts
// (the single source of truth for basePath) picks up here and in asset().
// Local dev runs at the root because the env var is only set in CI.
//
// To move to a user repo (lepablito.github.io) or a custom domain: remove
// the env block from .github/workflows/deploy.yml and drop the path from
// `url` in lib/site.ts (custom domain also needs a public/CNAME file).
const nextConfig: NextConfig = {
  output: "export",
  basePath,
  assetPrefix: basePath || undefined,
  // Emit /route/index.html instead of /route.html: avoids 404s on reload
  // when GitHub Pages serves the static files.
  trailingSlash: true,
  // Static export has no image optimization server.
  images: { unoptimized: true },
};

export default nextConfig;
