// Global site data. To move to a custom domain: change `url` here, adjust
// site/base in astro.config.mjs, and add a public/CNAME file.
export const site = {
  name: "Pablo Marcos Parra",
  headline: "Applied AI Engineer building production-grade LLM systems",
  tagline:
    "AI Engineer with 4+ years taking Generative AI and LLM systems from prototype to production, focused on autonomous agents, RAG and cloud microservice architectures.",
  url: "https://lepablito.github.io/professional-portfolio",
  location: "Valladolid, Spain",
  email: "pablo.marcos.parra@gmail.com",
  github: "https://github.com/lepablito",
  linkedin: "https://www.linkedin.com/in/pablomarcosparra/",
  cvPath: "/cv.pdf",
} as const;

/**
 * Prefix an internal path with the configured base. Astro does NOT rewrite
 * plain hrefs (there is no next/link here) — every internal link and asset
 * reference in .astro files must go through this helper. A CI check
 * (scripts/check-base-links.mjs) fails the build if one slips through.
 */
export function withBase(path: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/+$/, "");
  return `${base}${path}`;
}

/** Alias kept for readability when referencing public/ assets. */
export const asset = withBase;
