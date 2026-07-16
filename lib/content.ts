import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

// ---------------------------------------------------------------------------
// Typed frontmatter. Adding a project or post = dropping a .md file into
// content/ (files prefixed with "_" are ignored; they serve as templates).
// ---------------------------------------------------------------------------

export interface ProjectFrontmatter {
  title: string;
  /** One sentence: the problem it solves. Shown on cards. */
  summary: string;
  stack: string[];
  /** ISO date (YYYY-MM-DD). Sorts the listing when `order` is absent. */
  date: string;
  demo?: string;
  repo?: string;
  /** Slug of a related blog post (content/blog/<slug>.md). */
  blogPost?: string;
  /** Shows up in the home featured section (max 6). */
  featured?: boolean;
  /** Manual ascending order across featured/listing. */
  order?: number;
  /** Not published and hidden from listings. */
  draft?: boolean;
  /** Marks content as example material pending replacement (visible notice). */
  example?: boolean;
}

export interface PostFrontmatter {
  title: string;
  description: string;
  date: string;
  tags: string[];
  draft?: boolean;
  example?: boolean;
}

export interface Project {
  slug: string;
  data: ProjectFrontmatter;
  content: string;
}

export interface Post {
  slug: string;
  data: PostFrontmatter;
  content: string;
  readingMinutes: number;
}

// ---------------------------------------------------------------------------

const CONTENT_DIR = path.join(process.cwd(), "content");

function readCollection(dir: string): { slug: string; raw: string }[] {
  const abs = path.join(CONTENT_DIR, dir);
  if (!fs.existsSync(abs)) return [];
  return fs
    .readdirSync(abs)
    .filter((f) => /\.mdx?$/.test(f) && !f.startsWith("_"))
    .map((f) => ({
      slug: f.replace(/\.mdx?$/, ""),
      raw: fs.readFileSync(path.join(abs, f), "utf8"),
    }));
}

export function readingTime(text: string): number {
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

export function getProjects(): Project[] {
  return readCollection("projects")
    .map(({ slug, raw }) => {
      const { data, content } = matter(raw);
      return { slug, data: data as ProjectFrontmatter, content };
    })
    .filter((p) => !p.data.draft)
    .sort((a, b) => {
      const orderA = a.data.order ?? Number.MAX_SAFE_INTEGER;
      const orderB = b.data.order ?? Number.MAX_SAFE_INTEGER;
      if (orderA !== orderB) return orderA - orderB;
      return b.data.date.localeCompare(a.data.date);
    });
}

export function getFeaturedProjects(): Project[] {
  const all = getProjects();
  const featured = all.filter((p) => p.data.featured);
  // The home page shows up to 6 cards; if nothing is marked featured,
  // fall back to the first projects so the section is never empty.
  return (featured.length > 0 ? featured : all).slice(0, 6);
}

export function getProject(slug: string): Project | undefined {
  return getProjects().find((p) => p.slug === slug);
}

export function getPosts(): Post[] {
  return readCollection("blog")
    .map(({ slug, raw }) => {
      const { data, content } = matter(raw);
      return {
        slug,
        data: data as PostFrontmatter,
        content,
        readingMinutes: readingTime(content),
      };
    })
    .filter((p) => !p.data.draft)
    .sort((a, b) => b.data.date.localeCompare(a.data.date));
}

export function getPost(slug: string): Post | undefined {
  return getPosts().find((p) => p.slug === slug);
}

export function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
