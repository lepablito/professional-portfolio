// Fails the build if any internal href/src in dist/ skips the base path.
// Astro does not rewrite plain links (there is no next/link), so a missed
// withBase() call would 404 in production — this is the safety net.
import fs from "node:fs";
import path from "node:path";

const BASE = "/professional-portfolio";
const DIST = path.join(process.cwd(), "dist");

if (!fs.existsSync(DIST)) {
  console.error("dist/ not found — run `npm run build` first");
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

const attrPattern = /\b(?:href|src)="(\/[^"]*)"/g;
const violations = [];

for (const file of htmlFiles) {
  const html = fs.readFileSync(file, "utf8");
  for (const match of html.matchAll(attrPattern)) {
    const url = match[1];
    if (url.startsWith("//")) continue; // protocol-relative → external
    if (url === BASE || url.startsWith(`${BASE}/`)) continue;
    violations.push(`${path.relative(DIST, file)}: ${url}`);
  }
}

if (violations.length > 0) {
  console.error(`Found ${violations.length} internal link(s) missing the "${BASE}" base:`);
  for (const v of violations) console.error(`  ${v}`);
  process.exit(1);
}

console.log(`OK — ${htmlFiles.length} HTML files checked, every internal link carries the base path.`);
