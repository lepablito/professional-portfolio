import { defineConfig } from "astro/config";
import { rehypeBasePath, rehypePreTabIndex } from "./src/lib/rehype-plugins.mjs";

// ACTIVE SETUP: project repo (lepablito/professional-portfolio) served at
// https://lepablito.github.io/professional-portfolio/. Unlike the previous
// Next.js setup, the base path needs no env var: Astro's dev server and
// build both honor `base`, so local and CI behave identically.
//
// To move to a user repo (lepablito.github.io) or a custom domain: change
// `site`, remove `base`, and update `url` in src/lib/site.ts (custom domain
// also needs a public/CNAME file).
const base = "/professional-portfolio";

export default defineConfig({
  site: "https://lepablito.github.io",
  base,
  // /route/index.html + trailing slashes, matching the previous Next.js
  // export so every published URL keeps working.
  trailingSlash: "always",
  build: { format: "directory" },
  markdown: {
    // GFM is on by default. Raw HTML in .md passes through and HTML
    // comments (<!-- TODO -->) are dropped, matching the old pipeline.
    rehypePlugins: [[rehypeBasePath, { base }], rehypePreTabIndex],
    // css-variables theme: code colors come from our design tokens and
    // flip automatically with light/dark (see global.css).
    shikiConfig: { theme: "css-variables" },
  },
});
