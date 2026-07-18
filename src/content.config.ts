import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { postSchema, projectSchema } from "./lib/schema";

// Collections point at the same content/ directories the Next.js version
// used — zero changes to the .md files. Files prefixed "_" are templates
// and stay excluded. The entry id (= URL slug) is the filename.
export const collections = {
  projects: defineCollection({
    loader: glob({ pattern: ["**/*.md", "!_*"], base: "./content/projects" }),
    schema: projectSchema,
  }),
  blog: defineCollection({
    loader: glob({ pattern: ["**/*.md", "!_*"], base: "./content/blog" }),
    schema: postSchema,
  }),
};
