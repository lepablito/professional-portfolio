import { getCollection, type CollectionEntry } from "astro:content";
import { compareProjects, comparePosts, pickFeatured } from "./sort";

export type Project = CollectionEntry<"projects">;
export type Post = CollectionEntry<"blog">;

// Thin wrappers over getCollection: drafts filtered here, frontmatter
// validation in the collection schema (src/lib/schema.ts), ordering rules
// in src/lib/sort.ts (pure, unit-tested).

export async function getProjects(): Promise<Project[]> {
  const projects = await getCollection("projects", ({ data }) => !data.draft);
  return projects.sort((a, b) => compareProjects(a.data, b.data));
}

export async function getFeaturedProjects(): Promise<Project[]> {
  const all = await getProjects();
  return pickFeatured(all, (p) => p.data.featured);
}

export async function getPosts(): Promise<Post[]> {
  const posts = await getCollection("blog", ({ data }) => !data.draft);
  return posts.sort((a, b) => comparePosts(a.data, b.data));
}
