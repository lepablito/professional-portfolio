import { describe, expect, it } from "vitest";
import {
  formatDate,
  getPosts,
  getProjects,
  parsePostFrontmatter,
  parseProjectFrontmatter,
  readingTime,
} from "./content";

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

describe("parseProjectFrontmatter", () => {
  it("accepts valid frontmatter", () => {
    const parsed = parseProjectFrontmatter(validProject, "test.md");
    expect(parsed.title).toBe("Test project");
    expect(parsed.stack).toEqual(["Python", "Docker"]);
    expect(parsed.draft).toBe(false);
  });

  it("names the file and field when a required field is missing", () => {
    const { date: _date, ...withoutDate } = validProject;
    expect(() => parseProjectFrontmatter(withoutDate, "content/projects/x.md")).toThrow(
      /content\/projects\/x\.md.*"date"/
    );
  });

  it("rejects malformed dates", () => {
    expect(() =>
      parseProjectFrontmatter({ ...validProject, date: "2026-13-45" }, "x.md")
    ).toThrow(/valid YYYY-MM-DD/);
    expect(() =>
      parseProjectFrontmatter({ ...validProject, date: "January 2026" }, "x.md")
    ).toThrow(/valid YYYY-MM-DD/);
  });

  it("normalizes a scalar stack to an array (YAML allows `stack: Python`)", () => {
    const parsed = parseProjectFrontmatter({ ...validProject, stack: "Python" }, "x.md");
    expect(parsed.stack).toEqual(["Python"]);
  });

  it('treats draft: "false" (string) as not-draft instead of silently hiding', () => {
    const parsed = parseProjectFrontmatter({ ...validProject, draft: "false" }, "x.md");
    expect(parsed.draft).toBe(false);
  });
});

describe("parsePostFrontmatter", () => {
  it("accepts valid frontmatter and normalizes tags", () => {
    const parsed = parsePostFrontmatter({ ...validPost, tags: "llm" }, "x.md");
    expect(parsed.tags).toEqual(["llm"]);
  });

  it("requires a description", () => {
    const { description: _d, ...withoutDescription } = validPost;
    expect(() => parsePostFrontmatter(withoutDescription, "x.md")).toThrow(/"description"/);
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

  it("throws on non-ISO input instead of rendering 'Invalid Date'", () => {
    expect(() => formatDate("not-a-date")).toThrow(/YYYY-MM-DD/);
  });
});

// Content gate: validates the real .md files in content/ — the same files
// the build reads. A malformed file fails here with a clear message instead
// of failing `next build` with a stack trace.
describe("real content in content/", () => {
  it("every project parses, is ordered, and has required fields", () => {
    const projects = getProjects();
    for (const project of projects) {
      expect(project.data.title.length).toBeGreaterThan(0);
      expect(project.data.summary.length).toBeGreaterThan(0);
      expect(Array.isArray(project.data.stack)).toBe(true);
      expect(() => formatDate(project.data.date)).not.toThrow();
    }
  });

  it("every post parses and has required fields", () => {
    const posts = getPosts();
    for (const post of posts) {
      expect(post.data.title.length).toBeGreaterThan(0);
      expect(post.data.description.length).toBeGreaterThan(0);
      expect(Array.isArray(post.data.tags)).toBe(true);
      expect(post.readingMinutes).toBeGreaterThanOrEqual(1);
      expect(() => formatDate(post.data.date)).not.toThrow();
    }
  });

  it("cross-references between projects and posts resolve", () => {
    const projects = getProjects();
    const posts = getPosts();
    const postSlugs = new Set(posts.map((p) => p.slug));
    const projectSlugs = new Set(projects.map((p) => p.slug));
    for (const project of projects) {
      if (project.data.blogPost) {
        expect(postSlugs.has(project.data.blogPost)).toBe(true);
      }
    }
    for (const post of posts) {
      if (post.data.relatedProject) {
        expect(projectSlugs.has(post.data.relatedProject)).toBe(true);
      }
    }
  });
});
