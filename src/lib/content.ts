import { getCollection, type CollectionEntry } from "astro:content";

export type Project = CollectionEntry<"projects">;
export type Post = CollectionEntry<"blog">;

// Sorting/filtering mirrors the Next.js version exactly; validation now
// happens in the collection schema (src/lib/schema.ts).

export async function getProjects(): Promise<Project[]> {
  const projects = await getCollection("projects", ({ data }) => !data.draft);
  return projects.sort((a, b) => {
    const orderA = a.data.order ?? Number.MAX_SAFE_INTEGER;
    const orderB = b.data.order ?? Number.MAX_SAFE_INTEGER;
    if (orderA !== orderB) return orderA - orderB;
    return b.data.date.localeCompare(a.data.date);
  });
}

export async function getFeaturedProjects(): Promise<Project[]> {
  const all = await getProjects();
  const featured = all.filter((p) => p.data.featured);
  // The home page shows up to 6 rows; if nothing is marked featured,
  // fall back to the first projects so the section is never empty.
  return (featured.length > 0 ? featured : all).slice(0, 6);
}

export async function getPosts(): Promise<Post[]> {
  const posts = await getCollection("blog", ({ data }) => !data.draft);
  return posts.sort((a, b) => b.data.date.localeCompare(a.data.date));
}
