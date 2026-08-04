import { describe, expect, it } from "vitest";
import {
  alternateHref,
  defaultLocale,
  hrefInLang,
  isLang,
  localeHref,
  localePrefix,
  locales,
  otherLang,
  splitLocale,
  stripBase,
} from "./i18n";
import { basePath } from "./site";

describe("locales", () => {
  it("puts the default language first and has no prefix for it", () => {
    expect(locales[0]).toBe(defaultLocale);
    expect(localePrefix("en")).toBe("");
    expect(localePrefix("es")).toBe("/es");
  });

  it("pairs the two languages", () => {
    expect(otherLang("en")).toBe("es");
    expect(otherLang("es")).toBe("en");
  });

  it("recognizes only the configured languages", () => {
    expect(isLang("es")).toBe(true);
    expect(isLang("fr")).toBe(false);
    expect(isLang("")).toBe(false);
  });
});

describe("splitLocale", () => {
  it("pulls the language out of a prefixed path", () => {
    expect(splitLocale("/es/about/")).toEqual({ lang: "es", path: "/about/" });
    expect(splitLocale("/es/blog/some-post/")).toEqual({ lang: "es", path: "/blog/some-post/" });
  });

  it("treats the bare prefix as the Spanish home page", () => {
    expect(splitLocale("/es/")).toEqual({ lang: "es", path: "/" });
    expect(splitLocale("/es")).toEqual({ lang: "es", path: "/" });
  });

  it("defaults to English for unprefixed paths", () => {
    expect(splitLocale("/about/")).toEqual({ lang: "en", path: "/about/" });
    expect(splitLocale("/")).toEqual({ lang: "en", path: "/" });
  });

  it("does not mistake a path that merely starts with the letters for a prefix", () => {
    expect(splitLocale("/espanol/")).toEqual({ lang: "en", path: "/espanol/" });
    expect(splitLocale("/estimates/")).toEqual({ lang: "en", path: "/estimates/" });
  });
});

describe("stripBase", () => {
  it("removes the configured base and never returns an empty path", () => {
    expect(stripBase(`${basePath}/about/`)).toBe("/about/");
    expect(stripBase(`${basePath}/`)).toBe("/");
    expect(stripBase(basePath || "/")).toBe("/");
  });
});

describe("localeHref", () => {
  it("carries the base path for both languages", () => {
    expect(localeHref("en", "/about/")).toBe(`${basePath}/about/`);
    expect(localeHref("es", "/about/")).toBe(`${basePath}/es/about/`);
  });
});

describe("alternateHref", () => {
  it("swaps the language of the current page", () => {
    expect(alternateHref(`${basePath}/about/`)).toBe(`${basePath}/es/about/`);
    expect(alternateHref(`${basePath}/es/about/`)).toBe(`${basePath}/about/`);
  });

  it("round-trips back to where it started", () => {
    for (const path of ["/", "/about/", "/blog/", "/blog/a-post/", "/projects/a-project/"]) {
      for (const lang of locales) {
        const here = localeHref(lang, path);
        expect(alternateHref(alternateHref(here))).toBe(here);
      }
    }
  });
});

describe("hrefInLang", () => {
  it("rewrites a page's URL into a given language", () => {
    expect(hrefInLang("es", `${basePath}/projects/`)).toBe(`${basePath}/es/projects/`);
    expect(hrefInLang("es", `${basePath}/es/projects/`)).toBe(`${basePath}/es/projects/`);
    expect(hrefInLang("en", `${basePath}/es/projects/`)).toBe(`${basePath}/projects/`);
  });
});
