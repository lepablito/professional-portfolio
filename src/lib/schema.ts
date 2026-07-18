// Frontmatter schemas for the content collections. Imported by
// src/content.config.ts (build validation — errors name file and field)
// and by the Vitest suite (pure, no Astro runtime needed).
//
// `astro/zod` is Astro's re-export of zod — no extra dependency.
import { z } from "astro/zod";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

const isoDate = z
  .string({ required_error: 'missing required field "date"' })
  .regex(ISO_DATE, 'field "date" must be YYYY-MM-DD')
  .refine((d) => !Number.isNaN(new Date(`${d}T00:00:00`).getTime()), 'field "date" is not a real date');

/** YAML lets authors write `stack: Python` — normalize to a string array. */
const stringArray = z.preprocess(
  (v) => (v == null ? [] : Array.isArray(v) ? v.map(String) : [String(v)]),
  z.array(z.string())
);

/** `draft: "false"` (a truthy string) must not silently hide an entry. */
const looseBoolean = z.preprocess((v) => v === true || v === "true", z.boolean());

const optionalString = z.string().min(1).optional();

export const projectSchema = z.object({
  title: z.string().min(1),
  /** One sentence: the problem it solves. Shown on cards. */
  summary: z.string().min(1),
  date: isoDate,
  stack: stringArray,
  demo: optionalString,
  repo: optionalString,
  /** Slug of a related blog post (content/blog/<slug>.md). */
  blogPost: optionalString,
  /** Shows up in the home featured section (max 6). */
  featured: looseBoolean,
  /** Manual ascending order across featured/listing. */
  order: z.number().optional(),
  /** Not published and hidden from listings. */
  draft: looseBoolean,
  /** Marks content as example material pending replacement (visible notice). */
  example: looseBoolean,
});

export const postSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  date: isoDate,
  tags: stringArray,
  /** Slug of a related project (content/projects/<slug>.md). */
  relatedProject: optionalString,
  draft: looseBoolean,
  example: looseBoolean,
});

export type ProjectFrontmatter = z.infer<typeof projectSchema>;
export type PostFrontmatter = z.infer<typeof postSchema>;
