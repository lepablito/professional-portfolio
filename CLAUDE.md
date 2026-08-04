# professional-portfolio

Portfolio of Pablo Marcos Parra (Applied AI Engineer), served at
https://lepablito.github.io/professional-portfolio/. The site is **bilingual**
(English default at the root, Spanish under `/es/` — see below).
Built with **Astro 7** (migrated from Next.js 15 in July 2026, then bumped
5→7 — zero client framework; JS is two tiny inline vanilla scripts plus
Astro's hover-prefetch helper).

## Commands

- `npm run dev` — dev server at http://localhost:4321/professional-portfolio/
  (Astro honors `base` locally, no env var needed)
- `npm run build` — static build to `dist/`, then `scripts/harden-csp.mjs`
  replaces `'unsafe-inline'` in the meta CSP's script-src with sha256 hashes
- `npm run lint` / `npm test` / `npm run typecheck` (`astro check`) /
  `npm run check-links` / `npm run test:e2e` (Playwright smoke + axe a11y
  over the built `dist/`; needs `npm run build` first) — all run in CI
  before deploy, and on every PR via `.github/workflows/ci.yml`

## Architecture

- Astro 7 static output → GitHub Pages. `site`/`base`/`trailingSlash` live in
  `astro.config.mjs` — the single source of truth for the base path.
  Markdown runs on the legacy `unified` processor (`@astrojs/markdown-remark`
  is installed explicitly) because the custom rehype plugins need it.
- Content = Markdown in `content/<collection>/<lang>/` via **content
  collections** (`src/content.config.ts`, glob loader). Frontmatter is
  validated by zod schemas in `src/lib/schema.ts` (also exercised by Vitest,
  including a gate over the real content files); the cross-collection links
  (`blogPost`/`relatedProject`) are upgraded to typed `reference()`s in
  `src/content.config.ts`, so a typo'd slug fails the build. Files prefixed
  `_` are templates. Entry id = `<lang>/<slug>`; the same `<slug>` under two
  languages is what makes them translations of each other.
- `src/lib/content.ts` — thin wrappers over `getCollection`; the ordering/
  featured-selection rules live in `src/lib/sort.ts` (pure, unit-tested).
  `src/lib/format.ts` — pure `readingTime`/`formatDate` (testable, no Astro
  imports). `src/lib/about-data.ts` — About page + home "Currently" data,
  one entry per language.
- **Every internal href/src must go through `withBase()`** (`src/lib/site.ts`)
  or `localeHref()` (`src/lib/i18n.ts`, which wraps it) — Astro does not
  rewrite links. `scripts/check-base-links.mjs` fails CI if one slips
  through. Markdown `src`/`href` get the base via the rehype plugin in
  `src/lib/rehype-plugins.mjs`.
- Interactivity is two tiny vanilla scripts (theme toggle in
  `ThemeToggle.astro`, scroll reveal in `Base.astro`) that Astro inlines.
  Nav `aria-current` is computed at build time in `Header.astro`.
- Code blocks: Shiki with the `css-variables` theme mapped to design tokens
  in `global.css` (`--astro-code-*`) — colors flip with light/dark.

## Bilingual model

- English at the root (`/about/`), Spanish prefixed (`/es/about/`). The URL is
  the only source of truth: **no auto-detection, no localStorage, no new
  client JS** — the switcher is two `<a>` chips (`LangSwitch.astro`).
- All UI and page copy in `src/lib/strings.ts` (`t(lang)`); the Spanish object
  is typed against the English one so a missing key fails `astro check`, and
  Vitest rejects empty or accidentally-untranslated values.
- Page bodies live in `src/components/pages/*.astro` with a `lang` prop; the
  files in `src/pages/` and `src/pages/es/` are three-line route shims. One
  copy of the markup, two languages.
- Untranslated articles get **no** `/es/` URL. The Spanish listing shows them
  with an `EN` chip linking to the English page (`Listed.fallback` in
  `src/lib/content.ts`), so there is no duplicate content and no `hreflang`
  pointing at a page that doesn't exist. `Base.astro` takes `altHref` (null =
  no counterpart) and `switchHref` (where the chip goes).
- `404.astro` is the one bilingual page — GitHub Pages serves a single
  `404.html` whatever the URL's language.

## Design identity: "engineering drawing"

The site reads as a technical document — this is deliberate, keep it coherent:
graph-paper background, title-block cells (`.titleblock`: the hero spec
table — the footer is deliberately a plain contact row, Pablo found the
drawing-style footer confusing), numbered spec sections (`§ 01`, `fig.`),
projects as an indexed figure list (`WorkRow`), zero border radius, square
uppercase mono chips. Fraunces Variable with the opsz axis (the display cut
is the core of the identity — accepted size trade-off) / IBM Plex Sans /
IBM Plex Mono, all via Fontsource. One accent: pine green (#0F7A5E light /
#4FD6A6 dark), AA-verified. Avoid: purple/blue AI gradients, rounded card
grids, dark-OLED dev-portfolio clichés.

## Constraints

- Static output only: no SSR adapter, no server endpoints beyond build-time
  ones (`src/pages/sitemap.xml.ts`).
- The dark-token block appears twice in `global.css` (`[data-theme="dark"]`
  and the no-JS `prefers-color-scheme` fallback) — keep them identical.
- `example: true` frontmatter marks placeholder content with a visible badge;
  real case studies replace those files and drop the flag.
- Own content only — if third-party Markdown ever flows in, add
  rehype-sanitize first.
