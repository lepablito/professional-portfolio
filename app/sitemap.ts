import type { MetadataRoute } from "next";
import { getPosts, getProjects } from "@/lib/content";
import { site } from "@/lib/site";

// Static export: generated once at build time.
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = ["", "/projects", "/blog", "/about"].map(
    (route) => ({
      url: `${site.url}${route}/`,
      lastModified: now,
    })
  );

  const projectRoutes: MetadataRoute.Sitemap = getProjects().map((project) => ({
    url: `${site.url}/projects/${project.slug}/`,
    lastModified: new Date(`${project.data.date}T00:00:00`),
  }));

  const postRoutes: MetadataRoute.Sitemap = getPosts().map((post) => ({
    url: `${site.url}/blog/${post.slug}/`,
    lastModified: new Date(`${post.data.date}T00:00:00`),
  }));

  return [...staticRoutes, ...projectRoutes, ...postRoutes];
}
