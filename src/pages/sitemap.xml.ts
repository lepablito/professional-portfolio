import type { APIRoute } from "astro";
import { entrySlug, getPosts, getProjects } from "@/lib/content";
import { locales, localePrefix, type Lang } from "@/lib/i18n";
import { site } from "@/lib/site";

// Static endpoint generated at build time — same URL (/sitemap.xml) and
// same shape as the previous Next.js sitemap, now covering both languages.
// Only pages that actually exist are listed: an untranslated article has no
// Spanish URL, so it appears once, under its English one.

function entry(loc: string, lastmod: string): string {
  return `<url>\n<loc>${loc}</loc>\n<lastmod>${lastmod}</lastmod>\n</url>`;
}

/** site.url already carries the base path; localePrefix adds /es for Spanish. */
function url(lang: Lang, path: string): string {
  return `${site.url}${localePrefix(lang)}${path}`;
}

export const GET: APIRoute = async () => {
  const now = new Date().toISOString();
  const entries: string[] = [];

  for (const lang of locales) {
    for (const route of ["/", "/projects/", "/blog/", "/about/"]) {
      entries.push(entry(url(lang, route), now));
    }
    for (const project of await getProjects(lang)) {
      const date = new Date(`${project.data.date}T00:00:00`).toISOString();
      entries.push(entry(url(lang, `/projects/${entrySlug(project.id)}/`), date));
    }
    for (const post of await getPosts(lang)) {
      const date = new Date(`${post.data.date}T00:00:00`).toISOString();
      entries.push(entry(url(lang, `/blog/${entrySlug(post.id)}/`), date));
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join("\n")}\n</urlset>`;

  return new Response(xml, { headers: { "Content-Type": "application/xml" } });
};
