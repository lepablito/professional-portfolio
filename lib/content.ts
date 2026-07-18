import fs from "node:fs";
import path from "node:path";
import { cache } from "react";
import matter from "gray-matter";

// ---------------------------------------------------------------------------
// Typed frontmatter. Adding a project or post = dropping a .md file into
// content/ (files prefixed with "_" are ignored; they serve as templates).
//
// Frontmatter is validated and normalized here, at the single entry point,
// so a malformed file fails the build with a message naming the file and
// field instead of a cryptic TypeError deep inside a page render.
// ---------------------------------------------------------------------------

interface BaseFrontmatter {
  title: string;
  /** ISO date (YYYY-MM-DD). */
  date: string;
  /** Not published and hidden from listings. */
  draft?: boolean;
  /** Marks content as example material pending replacement (visible notice). */
  example?: boolean;
}

export interface ProjectFrontmatter extends BaseFrontmatter {
  /** One sentence: the problem it solves. Shown on cards. */
  summary: string;
  stack: string[];
  demo?: string;
  repo?: string;
  /** Slug of a related blog post (content/blog/<slug>.md). */
  blogPost?: string;
  /** Shows up in the home featured section (max 6). */
  featured?: boolean;
  /** Manual ascending order across featured/listing. */
  order?: number;
}

export interface PostFrontmatter extends BaseFrontmatter {
  description: string;
  tags: string[];
  /** Slug of a related project (content/projects/<slug>.md). */
  relatedProject?: string;
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
// Validation helpers (exported for tests)
// ---------------------------------------------------------------------------

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

class FrontmatterError extends Error {
  constructor(file: string, message: string) {
    super(`${file}: ${message}`);
    this.name = "FrontmatterError";
  }
}

function requireString(data: Record<string, unknown>, field: string, file: string): string {
  const value = data[field];
  if (typeof value !== "string" || value.trim() === "") {
    throw new FrontmatterError(file, `missing or empty required field "${field}"`);
  }
  return value;
}

function requireIsoDate(data: Record<string, unknown>, file: string): string {
  const value = requireString(data, "date", file);
  if (!ISO_DATE.test(value) || Number.isNaN(new Date(`${value}T00:00:00`).getTime())) {
    throw new FrontmatterError(file, `"date" must be a valid YYYY-MM-DD date, got "${value}"`);
  }
  return value;
}

/** YAML lets authors write `stack: Python` — normalize to a string array. */
function toStringArray(value: unknown): string[] {
  if (value === undefined || value === null) return [];
  const items = Array.isArray(value) ? value : [value];
  return items.map((item) => String(item));
}

/** `draft: "false"` (a truthy string) must not silently hide a post. */
function toBoolean(value: unknown): boolean {
  return value === true || value === "true";
}

function optionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() !== "" ? value : undefined;
}

export function parseProjectFrontmatter(
  data: Record<string, unknown>,
  file: string
): ProjectFrontmatter {
  return {
    title: requireString(data, "title", file),
    summary: requireString(data, "summary", file),
    date: requireIsoDate(data, file),
    stack: toStringArray(data.stack),
    demo: optionalString(data.demo),
    repo: optionalString(data.repo),
    blogPost: optionalString(data.blogPost),
    featured: toBoolean(data.featured),
    order: typeof data.order === "number" ? data.order : undefined,
    draft: toBoolean(data.draft),
    example: toBoolean(data.example),
  };
}

export function parsePostFrontmatter(
  data: Record<string, unknown>,
  file: string
): PostFrontmatter {
  return {
    title: requireString(data, "title", file),
    description: requireString(data, "description", file),
    date: requireIsoDate(data, file),
    tags: toStringArray(data.tags),
    relatedProject: optionalString(data.relatedProject),
    draft: toBoolean(data.draft),
    example: toBoolean(data.example),
  };
}

// ---------------------------------------------------------------------------
// Collection readers (memoized per build via React.cache — detail pages call
// these from generateStaticParams, generateMetadata and the page itself).
// ---------------------------------------------------------------------------

const CONTENT_DIR = path.join(process.cwd(), "content");

function readCollection(dir: "projects" | "blog"): { slug: string; file: string; raw: string }[] {
  const abs = path.join(CONTENT_DIR, dir);
  if (!fs.existsSync(abs)) return [];
  return fs
    .readdirSync(abs)
    .filter((f) => /\.mdx?$/.test(f) && !f.startsWith("_"))
    .map((f) => ({
      slug: f.replace(/\.mdx?$/, ""),
      file: `content/${dir}/${f}`,
      raw: fs.readFileSync(path.join(abs, f), "utf8"),
    }));
}

/** Wraps gray-matter so YAML syntax errors name the offending file. */
function parseMatter(raw: string, file: string) {
  try {
    return matter(raw);
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    throw new FrontmatterError(file, `invalid frontmatter YAML — ${reason}`);
  }
}

export function readingTime(text: string): number {
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

export const getProjects = cache((): Project[] => {
  return readCollection("projects")
    .map(({ slug, file, raw }) => {
      const { data, content } = parseMatter(raw, file);
      return { slug, data: parseProjectFrontmatter(data, file), content };
    })
    .filter((p) => !p.data.draft)
    .sort((a, b) => {
      const orderA = a.data.order ?? Number.MAX_SAFE_INTEGER;
      const orderB = b.data.order ?? Number.MAX_SAFE_INTEGER;
      if (orderA !== orderB) return orderA - orderB;
      return b.data.date.localeCompare(a.data.date);
    });
});

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

export const getPosts = cache((): Post[] => {
  return readCollection("blog")
    .map(({ slug, file, raw }) => {
      const { data, content } = parseMatter(raw, file);
      return {
        slug,
        data: parsePostFrontmatter(data, file),
        content,
        readingMinutes: readingTime(content),
      };
    })
    .filter((p) => !p.data.draft)
    .sort((a, b) => b.data.date.localeCompare(a.data.date));
});

export function getPost(slug: string): Post | undefined {
  return getPosts().find((p) => p.slug === slug);
}

export function formatDate(iso: string): string {
  // Dates are validated at parse time; this guard keeps the function safe
  // for direct calls (and tests) with arbitrary input.
  if (!ISO_DATE.test(iso)) {
    throw new Error(`formatDate expects YYYY-MM-DD, got "${iso}"`);
  }
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
