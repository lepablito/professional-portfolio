import { describe, expect, it } from "vitest";
import { compareProjects, comparePosts, FEATURED_LIMIT, pickFeatured } from "./sort";

const proj = (order: number | undefined, date: string) => ({ order, date });

describe("compareProjects", () => {
  it("sorts ascending by order when both have one", () => {
    const sorted = [proj(2, "2026-01-01"), proj(1, "2025-01-01")].sort(compareProjects);
    expect(sorted.map((p) => p.order)).toEqual([1, 2]);
  });

  it("sinks entries without order below ordered ones", () => {
    const sorted = [proj(undefined, "2026-06-01"), proj(3, "2024-01-01")].sort(compareProjects);
    expect(sorted.map((p) => p.order)).toEqual([3, undefined]);
  });

  it("breaks order ties (and missing orders) by newest date", () => {
    const sorted = [proj(1, "2025-01-01"), proj(1, "2026-01-01")].sort(compareProjects);
    expect(sorted.map((p) => p.date)).toEqual(["2026-01-01", "2025-01-01"]);

    const unordered = [proj(undefined, "2025-01-01"), proj(undefined, "2026-01-01")].sort(compareProjects);
    expect(unordered.map((p) => p.date)).toEqual(["2026-01-01", "2025-01-01"]);
  });
});

describe("comparePosts", () => {
  it("sorts newest first", () => {
    const sorted = [{ date: "2025-03-01" }, { date: "2026-02-01" }].sort(comparePosts);
    expect(sorted.map((p) => p.date)).toEqual(["2026-02-01", "2025-03-01"]);
  });
});

describe("pickFeatured", () => {
  const entry = (id: number, featured: boolean) => ({ id, featured });
  const isFeatured = (e: { featured: boolean }) => e.featured;

  it("returns only featured entries when any exist", () => {
    const all = [entry(1, false), entry(2, true), entry(3, true)];
    expect(pickFeatured(all, isFeatured).map((e) => e.id)).toEqual([2, 3]);
  });

  it("falls back to the first entries when nothing is featured", () => {
    const all = [entry(1, false), entry(2, false)];
    expect(pickFeatured(all, isFeatured).map((e) => e.id)).toEqual([1, 2]);
  });

  it("caps the result at FEATURED_LIMIT", () => {
    const all = Array.from({ length: FEATURED_LIMIT + 3 }, (_, i) => entry(i, true));
    expect(pickFeatured(all, isFeatured)).toHaveLength(FEATURED_LIMIT);
  });

  it("returns an empty list for an empty collection", () => {
    expect(pickFeatured([], isFeatured)).toEqual([]);
  });

  it("does not mutate the input", () => {
    const all = [entry(1, false), entry(2, false)];
    const before = [...all];
    pickFeatured(all, isFeatured);
    expect(all).toEqual(before);
  });
});
