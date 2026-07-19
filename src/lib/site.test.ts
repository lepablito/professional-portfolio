import { describe, expect, it } from "vitest";
import { joinBase, withBase } from "./site";

describe("joinBase", () => {
  it("strips the trailing slash from the base before prefixing", () => {
    expect(joinBase("/professional-portfolio/", "/about/")).toBe("/professional-portfolio/about/");
  });

  it("keeps a bare base untouched", () => {
    expect(joinBase("/professional-portfolio", "/about/")).toBe("/professional-portfolio/about/");
  });

  it("returns the path unchanged when serving from the root", () => {
    expect(joinBase("/", "/about/")).toBe("/about/");
    expect(joinBase("", "/about/")).toBe("/about/");
  });

  it("collapses multiple trailing slashes", () => {
    expect(joinBase("/repo///", "/x")).toBe("/repo/x");
  });
});

describe("withBase", () => {
  it("prefixes with the build-time BASE_URL", () => {
    expect(withBase("/about/")).toBe(joinBase(import.meta.env.BASE_URL, "/about/"));
  });
});
