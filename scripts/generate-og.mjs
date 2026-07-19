// Generates public/og.png (1200×630 social preview) by rendering an HTML
// template with the site's "engineering drawing" identity — graph paper,
// title-block cells, Fraunces display type, pine-green accent — and
// screenshotting it with Playwright's Chromium (a devDependency).
//
// Run manually after changing name/role/URL: node scripts/generate-og.mjs
// The output is committed, so builds don't depend on this script.
import fs from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";

const root = process.cwd();
const out = path.join(root, "public", "og.png");

const font = (rel) =>
  `data:font/woff2;base64,${fs.readFileSync(path.join(root, "node_modules", rel)).toString("base64")}`;

const fraunces = font("@fontsource-variable/fraunces/files/fraunces-latin-opsz-normal.woff2");
const mono400 = font("@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-400-normal.woff2");
const mono500 = font("@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-500-normal.woff2");

// Tokens mirror the light theme in src/styles/global.css.
const html = `<!doctype html>
<html>
<head>
<style>
  @font-face {
    font-family: "Fraunces Variable";
    font-weight: 100 900;
    src: url("${fraunces}") format("woff2-variations");
  }
  @font-face { font-family: "IBM Plex Mono"; font-weight: 400; src: url("${mono400}") format("woff2"); }
  @font-face { font-family: "IBM Plex Mono"; font-weight: 500; src: url("${mono500}") format("woff2"); }
  * { margin: 0; box-sizing: border-box; }
  body {
    width: 1200px;
    height: 630px;
    background-color: #fbfaf7;
    background-image: linear-gradient(rgba(25, 24, 23, 0.045) 1px, transparent 1px),
      linear-gradient(90deg, rgba(25, 24, 23, 0.045) 1px, transparent 1px);
    background-size: 44px 44px;
    color: #191817;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 72px 80px 0;
    border-top: 6px solid #0f7a5e;
  }
  .eyebrow {
    font-family: "IBM Plex Mono", monospace;
    font-size: 20px;
    font-weight: 500;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: #5c5a55;
  }
  .eyebrow .mark { color: #0f7a5e; margin-right: 12px; }
  .display {
    font-family: "Fraunces Variable", Georgia, serif;
    font-weight: 560;
    font-size: 76px;
    line-height: 1.08;
    letter-spacing: -0.015em;
    max-width: 18ch;
    margin-top: 36px;
  }
  .display u {
    text-decoration-color: #0f7a5e;
    text-decoration-thickness: 5px;
    text-underline-offset: 8px;
  }
  .titleblock {
    display: grid;
    grid-template-columns: 1fr 0.62fr 1.55fr;
    gap: 1px;
    background: #e4e2dc;
    border: 1px solid #e4e2dc;
    border-bottom: none;
    margin: 0 -80px 0;
  }
  .titleblock > div { background: #fbfaf7; padding: 22px 32px 26px; }
  .titleblock dt {
    font-family: "IBM Plex Mono", monospace;
    font-size: 15px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: #5c5a55;
  }
  .titleblock dd {
    margin: 6px 0 0;
    font-family: "IBM Plex Mono", monospace;
    font-size: 18px;
    color: #191817;
    white-space: nowrap;
  }
</style>
</head>
<body>
  <div>
    <p class="eyebrow"><span class="mark">§</span>Pablo Marcos Parra · Applied AI Engineer</p>
    <p class="display">Building <u>production-grade</u> LLM systems.</p>
  </div>
  <dl class="titleblock">
    <div><dt>Focus</dt><dd>agents · RAG · microservices</dd></div>
    <div><dt>Location</dt><dd>Valladolid, ES</dd></div>
    <div><dt>Web</dt><dd>lepablito.github.io/professional-portfolio</dd></div>
  </dl>
</body>
</html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.setContent(html);
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: out });
await browser.close();

const kb = Math.round(fs.statSync(out).size / 1024);
console.log(`og image written — ${out} (${kb} KB)`);
