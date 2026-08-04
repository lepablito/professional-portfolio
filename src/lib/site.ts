// Global site data. To move to a custom domain: change `url` here, adjust
// site/base in astro.config.mjs, and add a public/CNAME file.
//
// Only language-independent identity lives here — every user-visible string
// (tagline, location, button labels) is in src/lib/strings.ts, keyed by
// language. `cvPath` is per-language because the CV itself is translated.
// No import of Lang: keeping this module dependency-free avoids a cycle with
// i18n.ts, which imports withBase from here.
export const site = {
  name: "Pablo Marcos Parra",
  url: "https://lepablito.github.io/professional-portfolio",
  email: "pablo.marcos.parra@gmail.com",
  github: "https://github.com/lepablito",
  linkedin: "https://www.linkedin.com/in/pablomarcosparra/",
  cvPath: { en: "/cv.pdf", es: "/cv-es.pdf" },
} as const;

/**
 * Pure core of withBase: strip trailing slashes from the base and prefix
 * the path. Exported separately so tests can exercise bases other than the
 * build-time BASE_URL.
 */
export function joinBase(base: string, path: string): string {
  return `${base.replace(/\/+$/, "")}${path}`;
}

/** The configured base with no trailing slash ("" when served at the root). */
export const basePath = joinBase(import.meta.env.BASE_URL, "");

/**
 * Prefix an internal path with the configured base. Astro does NOT rewrite
 * plain hrefs (there is no next/link here) — every internal link and asset
 * reference in .astro files must go through this helper. A CI check
 * (scripts/check-base-links.mjs) fails the build if one slips through.
 */
export function withBase(path: string): string {
  return `${basePath}${path}`;
}

/** Alias kept for readability when referencing public/ assets. */
export const asset = withBase;
