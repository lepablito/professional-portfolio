// Global site data. To move to a custom domain: change `url` and add a
// public/CNAME file with the domain (GitHub Pages picks it up automatically).
export const site = {
  name: "Pablo Marcos Parra",
  headline: "Applied AI Engineer building production-grade LLM systems",
  tagline:
    "AI Engineer with 4+ years taking Generative AI and LLM systems from prototype to production, focused on autonomous agents, RAG and cloud microservice architectures.",
  url: "https://lepablito.github.io",
  location: "Valladolid, Spain",
  email: "pablo.marcos.parra@gmail.com",
  github: "https://github.com/lepablito",
  linkedin: "https://www.linkedin.com/in/pablomarcosparra/",
  cvPath: "/cv.pdf",
} as const;

export const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/**
 * Prefix a public/ asset path with the basePath. next/link handles this
 * automatically for internal routes, but plain <a href>/<img src>
 * references to static files do not.
 */
export function asset(path: string): string {
  return `${basePath}${path}`;
}
