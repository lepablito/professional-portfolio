import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

// Not a full e2e suite — a static site doesn't need one. This covers the
// few things unit tests can't see: the built pages actually render, the two
// inline vanilla scripts run, nav state is correct, and no page ships a
// serious/critical axe violation.

test("home renders the hero and the inline scripts ran", async ({ page }) => {
  await page.goto("");
  await expect(page.locator("h1")).toContainText("Applied AI Engineer");
  // The head theme script adds .js and resolves a theme before paint.
  await expect(page.locator("html")).toHaveClass(/js/);
  await expect(page.locator("html")).toHaveAttribute("data-theme", /light|dark/);
});

test("nav marks the active page with aria-current", async ({ page }) => {
  await page.goto("projects/");
  await expect(page.locator('.site-nav-links a[aria-current="page"]')).toHaveText("Projects");
});

test("the Spanish home page renders in Spanish", async ({ page }) => {
  await page.goto("es/");
  await expect(page.locator("html")).toHaveAttribute("lang", "es");
  await expect(page.locator("h1")).toContainText("Ingeniero de IA");
  await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveAttribute(
    "href",
    /professional-portfolio\/$/
  );
});

test("nav state survives the language prefix", async ({ page }) => {
  await page.goto("es/projects/");
  await expect(page.locator('.site-nav-links a[aria-current="page"]')).toHaveText("Proyectos");
});

test("the language chip keeps the visitor on the same page", async ({ page }) => {
  await page.goto("about/");
  await page.locator('.lang-chip[hreflang="es"]').click();
  await expect(page).toHaveURL(/\/es\/about\/$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "es");

  await page.locator('.lang-chip[hreflang="en"]').click();
  await expect(page).toHaveURL(/professional-portfolio\/about\/$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
});

// Every article is currently translated, so the Spanish listings should carry
// no "EN" fallback chips and every row should stay inside /es/. The fallback
// path itself (chip + link to the English URL) kicks in automatically for any
// article added to content/<collection>/en/ without a Spanish sibling.
for (const [path, row] of [
  ["es/blog/", ".post-row"],
  ["es/projects/", ".work-row"],
]) {
  test(`Spanish listing at /${path} is fully translated`, async ({ page }) => {
    await page.goto(path);
    await expect(page.locator(`${row} .lang-badge`)).toHaveCount(0);
    for (const href of await page.locator(`${row} a[href*="/professional-portfolio/"]`).evaluateAll(
      (links) => links.map((a) => a.getAttribute("href") ?? "")
    )) {
      expect(href, `${href} escapes /es/`).toContain("/professional-portfolio/es/");
    }
  });
}

test("an article and its translation point at each other", async ({ page }) => {
  await page.goto("projects/llm-energy-benchmark/");
  await expect(page.locator('link[rel="alternate"][hreflang="es"]')).toHaveAttribute(
    "href",
    /\/es\/projects\/llm-energy-benchmark\/$/
  );
  await page.locator('.lang-chip[hreflang="es"]').click();
  await expect(page).toHaveURL(/\/es\/projects\/llm-energy-benchmark\/$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "es");
  await expect(page.locator("h1")).toContainText("Arquitectura multiagente");
});

test("theme toggle flips the theme and its aria-pressed state", async ({ page }) => {
  await page.goto("");
  const html = page.locator("html");
  const button = page.locator(".theme-toggle");
  const initial = await html.getAttribute("data-theme");
  const flipped = initial === "dark" ? "light" : "dark";

  await button.click();
  await expect(html).toHaveAttribute("data-theme", flipped);
  await expect(button).toHaveAttribute("aria-pressed", String(flipped === "dark"));
});

test("sitemap is served and carries the base path", async ({ request, baseURL }) => {
  const res = await request.get(new URL("sitemap.xml", baseURL).href);
  expect(res.ok()).toBe(true);
  const body = await res.text();
  expect(body).toContain("<urlset");
  expect(body).toContain("/professional-portfolio/");
  expect(body).toContain("/professional-portfolio/es/");
});

// The two case-study pages are in the list because they carry hand-drawn
// inline SVG diagrams — the one place on the site where markup is authored
// in Markdown rather than by a component.
for (const path of [
  "",
  "projects/",
  "blog/",
  "about/",
  "projects/llm-energy-benchmark/",
  "projects/certification-exam-simulator/",
  "es/",
  "es/projects/",
  "es/blog/",
  "es/about/",
  "es/projects/llm-energy-benchmark/",
  "es/projects/certification-exam-simulator/",
  "es/blog/claude-code-on-other-models/",
]) {
  test(`no serious/critical axe violations on /${path}`, async ({ page }) => {
    // The site honors prefers-reduced-motion (entrance animations off).
    // Without this, axe can sample colors mid-fade and report phantom
    // contrast failures from the blended in-between frames.
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(path);
    const results = await new AxeBuilder({ page }).analyze();
    const serious = results.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical"
    );
    expect(serious, JSON.stringify(serious, null, 2)).toEqual([]);
  });
}
