import type { APIRoute } from "astro";
import { getPosts, getProjects } from "@/lib/content";
import { site } from "@/lib/site";

// Static endpoint generated at build time — same URL (/sitemap.xml) and
// same shape as the previous Next.js sitemap.

function entry(loc: string, lastmod: string): string {
  return `<url>\n<loc>${loc}</loc>\n<lastmod>${lastmod}</lastmod>\n</url>`;
}

export const GET: APIRoute = async () => {
  const now = new Date().toISOString();
  const projects = await getProjects();
  const posts = await getPosts();

  const entries = [
    ...["", "/projects", "/blog", "/about"].map((route) => entry(`${site.url}${route}/`, now)),
    ...projects.map((p) => entry(`${site.url}/projects/${p.id}/`, new Date(`${p.data.date}T00:00:00`).toISOString())),
    ...posts.map((p) => entry(`${site.url}/blog/${p.id}/`, new Date(`${p.data.date}T00:00:00`).toISOString())),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join("\n")}\n</urlset>`;

  return new Response(xml, { headers: { "Content-Type": "application/xml" } });
};
