import { describe, expect, it } from "vitest";
import { locales } from "./i18n";
import { strings, t } from "./strings";

// The TypeScript annotation on `es` already fails `astro check` when a key is
// missing. These cover what types can't: a key that exists but was left as the
// English text, or an empty string that would render a blank label.

function flatten(value: unknown, prefix = ""): Record<string, string> {
  if (typeof value === "string") return { [prefix]: value };
  return Object.entries(value as Record<string, unknown>).reduce<Record<string, string>>(
    (acc, [key, child]) => Object.assign(acc, flatten(child, prefix ? `${prefix}.${key}` : key)),
    {}
  );
}

const flat = Object.fromEntries(locales.map((lang) => [lang, flatten(t(lang))]));

/** The Spanish hero underlines the last words, so nothing follows the marker. */
const ALLOWED_EMPTY = new Set(["home.heroAfter"]);

/** Identical in both languages on purpose: proper nouns, brand names, units. */
const SHARED = new Set([
  "nav.blog",
  "blog.title",
  "blog.eyebrow",
  "blog.back",
  "common.email",
  "common.cvShort",
  "common.demo",
  "skills.nlp",
  "skills.cloud",
]);

describe("strings", () => {
  it("defines exactly the same keys in every language", () => {
    const reference = Object.keys(flat.en).sort();
    for (const lang of locales) {
      expect(Object.keys(flat[lang]).sort(), `keys for "${lang}"`).toEqual(reference);
    }
  });

  it("has no accidentally empty values", () => {
    for (const lang of locales) {
      for (const [key, value] of Object.entries(flat[lang])) {
        if (ALLOWED_EMPTY.has(key)) continue;
        expect(value.trim(), `${lang}.${key} is empty`).not.toBe("");
      }
    }
  });

  it("actually translates everything that is not a proper noun", () => {
    const untranslated = Object.keys(flat.en).filter(
      (key) => !SHARED.has(key) && flat.en[key] === flat.es[key] && flat.en[key] !== ""
    );
    expect(untranslated, "keys left in English (add to SHARED if intentional)").toEqual([]);
  });

  it("exposes one entry per configured locale", () => {
    expect(Object.keys(strings).sort()).toEqual([...locales].sort());
  });
});
