import { defineCollection, reference } from "astro:content";
import { glob } from "astro/loaders";
import { postSchema, projectSchema } from "./lib/schema";

// Collections load from content/. Files prefixed "_" are templates and stay
// excluded. The entry id (= URL slug) is the filename.
//
// The cross-collection links (blogPost/relatedProject) are plain optional
// strings in the pure schemas (src/lib/schema.ts, shared with Vitest) and
// upgraded to typed `reference()`s here, so a typo'd slug fails `astro build`
// with a named error instead of shipping a broken link.
export const collections = {
  projects: defineCollection({
    loader: glob({ pattern: ["**/*.md", "!_*"], base: "./content/projects" }),
    schema: projectSchema.extend({ blogPost: reference("blog").optional() }),
  }),
  blog: defineCollection({
    loader: glob({ pattern: ["**/*.md", "!_*"], base: "./content/blog" }),
    schema: postSchema.extend({ relatedProject: reference("projects").optional() }),
  }),
};
