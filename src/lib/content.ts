import { getCollection, type CollectionEntry } from "astro:content";
import { defaultLocale, isLang, localeHref, otherLang, type Lang } from "./i18n";
import { compareProjects, comparePosts, pickFeatured } from "./sort";

export type Project = CollectionEntry<"projects">;
export type Post = CollectionEntry<"blog">;

// Thin wrappers over getCollection: drafts filtered here, frontmatter
// validation in the collection schema (src/lib/schema.ts), ordering rules
// in src/lib/sort.ts (pure, unit-tested).
//
// Entry ids are "<lang>/<slug>" (see src/content.config.ts). Two flavors of
// accessor, on purpose:
//   get*(lang)   — strictly the entries written in that language. This is
//                  what getStaticPaths uses, so an untranslated article
//                  never gets a Spanish URL (no duplicate content).
//   list*(lang)  — what a listing page shows: the translated entries plus,
//                  for anything not translated yet, the English original
//                  marked `fallback` and linking to its English URL.

const SECTION = { projects: "/projects", blog: "/blog" } as const;

/** Language directory an entry lives in ("en/some-post" → "en"). */
export function entryLang(id: string): Lang {
  const dir = id.split("/", 1)[0];
  return isLang(dir) ? dir : defaultLocale;
}

/** Slug within the language directory ("en/some-post" → "some-post"). The
 * same slug in two languages is what marks them as translations. */
export function entrySlug(id: string): string {
  const slash = id.indexOf("/");
  return slash === -1 ? id : id.slice(slash + 1);
}

/** A listing row. `fallback` is true when the entry is the English original
 * standing in for a missing translation — the UI marks those with an "EN"
 * chip and `href` already points at the English page. */
export interface Listed<T> {
  entry: T;
  slug: string;
  href: string;
  fallback: boolean;
}

function inLang<T extends { id: string }>(entries: T[], lang: Lang): T[] {
  return entries.filter((entry) => entryLang(entry.id) === lang);
}

/**
 * Merge the entries of `lang` with English fallbacks for whatever has not
 * been translated, then sort the whole thing with the collection's own
 * comparator so fallbacks are interleaved by date rather than appended.
 */
function listWithFallback<T extends { id: string; data: unknown }>(
  entries: T[],
  lang: Lang,
  section: keyof typeof SECTION,
  compare: (a: T["data"], b: T["data"]) => number
): Listed<T>[] {
  const translated = inLang(entries, lang);
  const rows: T[] = [...translated];

  if (lang !== defaultLocale) {
    const have = new Set(translated.map((entry) => entrySlug(entry.id)));
    rows.push(...inLang(entries, defaultLocale).filter((entry) => !have.has(entrySlug(entry.id))));
  }

  return rows
    .sort((a, b) => compare(a.data, b.data))
    .map((entry) => {
      const entryLanguage = entryLang(entry.id);
      const slug = entrySlug(entry.id);
      return {
        entry,
        slug,
        href: localeHref(entryLanguage, `${SECTION[section]}/${slug}/`),
        fallback: entryLanguage !== lang,
      };
    });
}

async function publishedProjects(): Promise<Project[]> {
  return getCollection("projects", ({ data }) => !data.draft);
}

async function publishedPosts(): Promise<Post[]> {
  return getCollection("blog", ({ data }) => !data.draft);
}

/** Projects written in `lang`, sorted. Backs getStaticPaths. */
export async function getProjects(lang: Lang): Promise<Project[]> {
  const projects = inLang(await publishedProjects(), lang);
  return projects.sort((a, b) => compareProjects(a.data, b.data));
}

/** Posts written in `lang`, sorted. Backs getStaticPaths. */
export async function getPosts(lang: Lang): Promise<Post[]> {
  const posts = inLang(await publishedPosts(), lang);
  return posts.sort((a, b) => comparePosts(a.data, b.data));
}

/** Every project a `lang` visitor should see, English fallbacks included. */
export async function listProjects(lang: Lang): Promise<Listed<Project>[]> {
  return listWithFallback(await publishedProjects(), lang, "projects", compareProjects);
}

/** Every post a `lang` visitor should see, English fallbacks included. */
export async function listPosts(lang: Lang): Promise<Listed<Post>[]> {
  return listWithFallback(await publishedPosts(), lang, "blog", comparePosts);
}

export async function listFeaturedProjects(lang: Lang): Promise<Listed<Project>[]> {
  return pickFeatured(await listProjects(lang), (row) => row.entry.data.featured);
}

/**
 * href of this entry in the other language, or null when it has not been
 * translated. Null is what makes an article page skip its hreflang pair and
 * send the language chip to the section index instead of a 404.
 */
export async function counterpartHref(
  section: keyof typeof SECTION,
  slug: string,
  lang: Lang
): Promise<string | null> {
  const other = otherLang(lang);
  const entries = section === "blog" ? await publishedPosts() : await publishedProjects();
  const exists = entries.some(
    (entry) => entryLang(entry.id) === other && entrySlug(entry.id) === slug
  );
  return exists ? localeHref(other, `${SECTION[section]}/${slug}/`) : null;
}
