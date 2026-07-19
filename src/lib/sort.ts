// Pure ordering/selection logic for the content collections. No
// astro:content imports, so Vitest can exercise it directly — this is the
// logic that decides which projects show up on the home page and in what
// order, which used to live inline (untested) in content.ts.

interface ProjectOrdering {
  order?: number;
  date: string;
}

/** Ascending `order` first (entries without one sink last); newest date breaks ties. */
export function compareProjects(a: ProjectOrdering, b: ProjectOrdering): number {
  const orderA = a.order ?? Number.MAX_SAFE_INTEGER;
  const orderB = b.order ?? Number.MAX_SAFE_INTEGER;
  if (orderA !== orderB) return orderA - orderB;
  return b.date.localeCompare(a.date);
}

/** Newest first. */
export function comparePosts(a: { date: string }, b: { date: string }): number {
  return b.date.localeCompare(a.date);
}

/** The home page shows at most this many project rows. */
export const FEATURED_LIMIT = 6;

/**
 * Featured entries, capped at FEATURED_LIMIT. If nothing is marked featured,
 * fall back to the first entries so the section is never empty.
 */
export function pickFeatured<T>(sorted: readonly T[], isFeatured: (item: T) => boolean): T[] {
  const featured = sorted.filter(isFeatured);
  return (featured.length > 0 ? featured : [...sorted]).slice(0, FEATURED_LIMIT);
}
