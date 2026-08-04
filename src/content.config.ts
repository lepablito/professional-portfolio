import { defineCollection, reference } from "astro:content";
import { glob } from "astro/loaders";
import { postSchema, projectSchema } from "./lib/schema";

// Collections load from content/, one directory per language:
// content/blog/en/<slug>.md, content/blog/es/<slug>.md. The entry id is
// therefore "<lang>/<slug>" — src/lib/content.ts splits it back apart, and
// the same <slug> under both languages is what links the two versions.
// Files prefixed "_" are templates (at any depth) and stay excluded.
//
// The cross-collection links (blogPost/relatedProject) are plain optional
// strings in the pure schemas (src/lib/schema.ts, shared with Vitest) and
// upgraded to typed `reference()`s here, so a typo'd slug fails `astro build`
// with a named error instead of shipping a broken link. References carry the
// language directory too: `blogPost: "en/some-post"`.
export const collections = {
  projects: defineCollection({
    loader: glob({ pattern: ["**/*.md", "!**/_*"], base: "./content/projects" }),
    schema: projectSchema.extend({ blogPost: reference("blog").optional() }),
  }),
  blog: defineCollection({
    loader: glob({ pattern: ["**/*.md", "!**/_*"], base: "./content/blog" }),
    schema: postSchema.extend({ relatedProject: reference("projects").optional() }),
  }),
};
