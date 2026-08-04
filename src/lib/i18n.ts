// Locale plumbing. English is the default and lives at the root of the site
// (/about/); Spanish lives under a prefix (/es/about/). That keeps every URL
// published so far working and makes the English page the canonical one.
//
// Everything here is pure except `stripBase`/`alternateHref`, which read the
// build-time base — the same split `site.ts` uses, so Vitest can exercise the
// interesting logic directly.
import { basePath, withBase } from "./site";

export const locales = ["en", "es"] as const;
export type Lang = (typeof locales)[number];

export const defaultLocale: Lang = "en";

/** The other language of the pair. Bilingual by design — see CLAUDE.md. */
export function otherLang(lang: Lang): Lang {
  return lang === "en" ? "es" : "en";
}

export function isLang(value: string): value is Lang {
  return (locales as readonly string[]).includes(value);
}

/** URL segment a locale adds: "" for the default, "/es" otherwise. */
export function localePrefix(lang: Lang): string {
  return lang === defaultLocale ? "" : `/${lang}`;
}

/**
 * Locale-aware `withBase()`. Every internal href in a page component goes
 * through this one (or through withBase directly for assets), so
 * scripts/check-base-links.mjs still catches anything that slips.
 */
export function localeHref(lang: Lang, path: string): string {
  return withBase(`${localePrefix(lang)}${path}`);
}

/**
 * Split a base-less pathname into its locale and the path within it.
 * "/es/about/" → { lang: "es", path: "/about/" }; "/about/" → en.
 * Guards against false positives like "/espanol/" matching the "es" prefix.
 */
export function splitLocale(pathname: string): { lang: Lang; path: string } {
  for (const lang of locales) {
    if (lang === defaultLocale) continue;
    const prefix = `/${lang}`;
    if (pathname === prefix || pathname === `${prefix}/`) return { lang, path: "/" };
    if (pathname.startsWith(`${prefix}/`)) return { lang, path: pathname.slice(prefix.length) };
  }
  return { lang: defaultLocale, path: pathname || "/" };
}

/** Drop the configured base from a full pathname ("/professional-portfolio/about/" → "/about/"). */
export function stripBase(pathname: string): string {
  if (!basePath) return pathname;
  return pathname.startsWith(basePath) ? pathname.slice(basePath.length) || "/" : pathname;
}

/** The current page's locale, derived from the URL Astro is rendering. */
export function langFromPathname(pathname: string): Lang {
  return splitLocale(stripBase(pathname)).lang;
}

/**
 * href of the same page in the other language. Pages whose counterpart does
 * not exist (an untranslated article) pass their own value instead of using
 * this — see the `altHref` prop on Base.astro.
 */
export function alternateHref(pathname: string): string {
  const { lang, path } = splitLocale(stripBase(pathname));
  return localeHref(otherLang(lang), path);
}

/** href of a given page in a given language, from the current pathname. */
export function hrefInLang(lang: Lang, pathname: string): string {
  return localeHref(lang, splitLocale(stripBase(pathname)).path);
}

/** BCP-47 tags for `<html lang>`; Open Graph wants the underscored form. */
export const ogLocale: Record<Lang, string> = { en: "en_US", es: "es_ES" };
