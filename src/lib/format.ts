// Pure text helpers — no Astro runtime imports, so Vitest can test them
// directly (src/lib/portfolio.test.ts). Only the `Lang` *type* is imported,
// which erases at build time, so this file still pulls in nothing at runtime.
import type { Lang } from "./i18n";

export function readingTime(text: string): number {
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

const dateLocale: Record<Lang, string> = { en: "en-US", es: "es-ES" };

export function formatDate(iso: string, lang: Lang = "en"): string {
  // Dates are validated by the collection schema; this guard keeps the
  // function safe for direct calls (and tests) with arbitrary input.
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
    throw new Error(`formatDate expects YYYY-MM-DD, got "${iso}"`);
  }
  return new Date(`${iso}T00:00:00`).toLocaleDateString(dateLocale[lang], {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
