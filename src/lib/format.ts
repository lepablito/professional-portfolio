// Pure text helpers — no Astro runtime imports, so Vitest can test them
// directly (src/lib/portfolio.test.ts).

export function readingTime(text: string): number {
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

export function formatDate(iso: string): string {
  // Dates are validated by the collection schema; this guard keeps the
  // function safe for direct calls (and tests) with arbitrary input.
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
    throw new Error(`formatDate expects YYYY-MM-DD, got "${iso}"`);
  }
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
