import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";
import { formatDate, readingTime } from "./format";
import { locales } from "./i18n";
import { postSchema, projectSchema } from "./schema";

const validProject = {
  title: "Test project",
  summary: "A summary.",
  date: "2026-01-15",
  stack: ["Python", "Docker"],
};

const validPost = {
  title: "Test post",
  description: "A description.",
  date: "2026-01-15",
  tags: ["llm"],
};

describe("projectSchema", () => {
  it("accepts valid frontmatter", () => {
    const parsed = projectSchema.parse(validProject);
    expect(parsed.title).toBe("Test project");
    expect(parsed.stack).toEqual(["Python", "Docker"]);
    expect(parsed.draft).toBe(false);
  });

  it("rejects missing required fields, naming the field", () => {
    const { date: _date, ...withoutDate } = validProject;
    const result = projectSchema.safeParse(withoutDate);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("date");
    }
  });

  it("rejects malformed dates", () => {
    expect(projectSchema.safeParse({ ...validProject, date: "2026-13-45" }).success).toBe(false);
    expect(projectSchema.safeParse({ ...validProject, date: "January 2026" }).success).toBe(false);
  });

  it("normalizes a scalar stack to an array (YAML allows `stack: Python`)", () => {
    const parsed = projectSchema.parse({ ...validProject, stack: "Python" });
    expect(parsed.stack).toEqual(["Python"]);
  });

  it('treats draft: "false" (string) as not-draft instead of silently hiding', () => {
    const parsed = projectSchema.parse({ ...validProject, draft: "false" });
    expect(parsed.draft).toBe(false);
  });
});

describe("postSchema", () => {
  it("accepts valid frontmatter and normalizes tags", () => {
    const parsed = postSchema.parse({ ...validPost, tags: "llm" });
    expect(parsed.tags).toEqual(["llm"]);
  });

  it("requires a description", () => {
    const { description: _d, ...withoutDescription } = validPost;
    expect(postSchema.safeParse(withoutDescription).success).toBe(false);
  });
});

describe("readingTime", () => {
  it("returns at least 1 minute for empty or short text", () => {
    expect(readingTime("")).toBe(1);
    expect(readingTime("a few words")).toBe(1);
  });

  it("rounds up at the 200 words/minute boundary", () => {
    expect(readingTime(Array(200).fill("word").join(" "))).toBe(1);
    expect(readingTime(Array(201).fill("word").join(" "))).toBe(2);
  });
});

describe("formatDate", () => {
  it("formats a valid ISO date", () => {
    expect(formatDate("2026-07-01")).toBe("Jul 1, 2026");
  });

  it("defaults to English and follows the requested language otherwise", () => {
    expect(formatDate("2026-07-01")).toBe(formatDate("2026-07-01", "en"));
    // Not asserting the exact Spanish string: ICU spells the month
    // differently across Node versions ("jul" vs "jul."). What matters is
    // that it is localized and still carries day and year.
    const es = formatDate("2026-07-01", "es");
    expect(es).not.toBe(formatDate("2026-07-01", "en"));
    expect(es).toMatch(/1/);
    expect(es).toMatch(/2026/);
  });

  it("throws on non-ISO input instead of rendering 'Invalid Date'", () => {
    expect(() => formatDate("not-a-date")).toThrow(/YYYY-MM-DD/);
  });
});

// Content gate: validates the real .md files in content/ with the same
// schemas the Astro build uses. A malformed file fails here with a clear
// message instead of failing `astro build`.
describe("real content in content/", () => {
  const contentDir = path.join(process.cwd(), "content");

  /** Entries live one language directory deep: content/blog/en/<slug>.md.
   * `slug` here is the collection entry id, language prefix included. */
  function readCollection(dir: string) {
    const abs = path.join(contentDir, dir);
    return fs
      .readdirSync(abs, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && !entry.name.startsWith("_"))
      .flatMap((langDir) =>
        fs
          .readdirSync(path.join(abs, langDir.name))
          .filter((f) => /\.mdx?$/.test(f) && !f.startsWith("_"))
          .map((f) => ({
            lang: langDir.name,
            slug: `${langDir.name}/${f.replace(/\.mdx?$/, "")}`,
            ...matter(fs.readFileSync(path.join(abs, langDir.name, f), "utf8")),
          }))
      );
  }

  it("every project file passes the schema", () => {
    for (const file of readCollection("projects")) {
      const result = projectSchema.safeParse(file.data);
      expect(result.success, `content/projects/${file.slug}.md: ${JSON.stringify(result.success ? "" : result.error.issues)}`).toBe(true);
    }
  });

  it("every post file passes the schema", () => {
    for (const file of readCollection("blog")) {
      const result = postSchema.safeParse(file.data);
      expect(result.success, `content/blog/${file.slug}.md: ${JSON.stringify(result.success ? "" : result.error.issues)}`).toBe(true);
    }
  });

  it("every entry lives under a configured language directory", () => {
    const known = new Set<string>(locales);
    for (const file of [...readCollection("projects"), ...readCollection("blog")]) {
      expect(known.has(file.lang), `"${file.slug}" is not under ${[...known].join("/")}`).toBe(true);
    }
  });

  it("cross-references between projects and posts resolve", () => {
    const projects = readCollection("projects");
    const posts = readCollection("blog");
    const postSlugs = new Set(posts.map((p) => p.slug));
    const projectSlugs = new Set(projects.map((p) => p.slug));
    for (const project of projects) {
      const ref = projectSchema.parse(project.data).blogPost;
      if (ref) expect(postSlugs.has(ref), `blogPost "${ref}" not found`).toBe(true);
    }
    for (const post of posts) {
      const ref = postSchema.parse(post.data).relatedProject;
      if (ref) expect(projectSlugs.has(ref), `relatedProject "${ref}" not found`).toBe(true);
    }
  });
});
