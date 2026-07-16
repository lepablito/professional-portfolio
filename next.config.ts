import type { NextConfig } from "next";

// User repo (lepablito.github.io) → the site is served at the root, so
// basePath stays empty. If this ever moves to a project repo (e.g.
// "portfolio"), set NEXT_PUBLIC_BASE_PATH="/portfolio" in the deploy
// workflow (or change the value here). A custom domain needs no change
// here: just update `url` in lib/site.ts and add a public/CNAME file.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

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
