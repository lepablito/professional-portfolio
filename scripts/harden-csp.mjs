// Post-build CSP hardening. GitHub Pages can't send HTTP headers, so the
// CSP lives in a <meta> tag (src/layouts/Base.astro) and the source allows
// 'unsafe-inline' — which also keeps `astro dev` working. This script runs
// after `astro build` and replaces 'unsafe-inline' in script-src with
// sha256 hashes of the inline scripts each page actually carries, so only
// those exact scripts can execute.
//
// style-src deliberately keeps 'unsafe-inline': Shiki (css-variables theme)
// emits style="" attributes on code tokens, which hashes cannot cover.
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const DIST = path.join(process.cwd(), "dist");

if (!fs.existsSync(DIST)) {
  console.error("dist/ not found — run `astro build` first");
  process.exit(1);
}

const htmlFiles = [];
(function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name.endsWith(".html")) htmlFiles.push(full);
  }
})(DIST);

// Inline scripts only (no src= attribute). The CSP hash covers the exact
// bytes between the tags, which is what the browser hashes too.
const INLINE_SCRIPT = /<script(?![^>]*\ssrc=)[^>]*>([\s\S]*?)<\/script>/gi;
const PLACEHOLDER = "script-src 'self' 'unsafe-inline'";

let patched = 0;
let missing = 0;

for (const file of htmlFiles) {
  const html = fs.readFileSync(file, "utf8");
  if (!html.includes(PLACEHOLDER)) {
    missing += 1;
    continue;
  }
  const hashes = new Set();
  for (const match of html.matchAll(INLINE_SCRIPT)) {
    if (!match[1]) continue;
    const digest = crypto.createHash("sha256").update(match[1], "utf8").digest("base64");
    hashes.add(`'sha256-${digest}'`);
  }
  const scriptSrc = ["script-src 'self'", ...hashes].join(" ");
  fs.writeFileSync(file, html.replace(PLACEHOLDER, scriptSrc));
  patched += 1;
}

if (missing > 0) {
  console.error(
    `CSP hardening: ${missing} HTML file(s) had no "${PLACEHOLDER}" meta to replace — ` +
      "did the CSP in src/layouts/Base.astro change without updating this script?"
  );
  process.exit(1);
}

console.log(`CSP hardened — inline script hashes emitted for ${patched}/${htmlFiles.length} HTML files.`);
