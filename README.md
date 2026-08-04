# professional-portfolio

Portfolio of **Pablo Marcos Parra** — Applied AI Engineer, served at
[lepablito.github.io/professional-portfolio](https://lepablito.github.io/professional-portfolio/).
Built with Astro 7 (static, zero client framework) and deployed to GitHub
Pages with GitHub Actions.

## Run locally

```bash
npm install
npm run dev        # http://localhost:4321/professional-portfolio/
```

Other scripts:

```bash
npm run build        # static build → dist/ (+ CSP hardening pass)
npm run preview      # serve dist/ locally (run build first)
npm run typecheck    # astro check
npm run lint         # eslint (typescript + astro plugins)
npm test             # vitest — schemas, helpers, and the real content/ files
npm run check-links  # fails if an internal link misses the base path
npm run test:e2e     # playwright smoke + axe accessibility scan over dist/
```

Use `npm ci` (not `npm install`) when you just want to install — it respects
the lockfile exactly, like CI does. Node ≥22 required (`.nvmrc` pins 22).

## Deploy

Every push to `main` builds the site and publishes `dist/` to GitHub Pages
(`.github/workflows/deploy.yml`). One-time setup:

1. Create the repo `lepablito/professional-portfolio` and push this project to `main`.
2. In the repo: **Settings → Pages → Build and deployment → Source: GitHub Actions**.

That's it — the first push triggers the first deploy.

## Content

Adding a project or a blog post = adding one Markdown file. Frontmatter is
validated by the zod schemas in `src/lib/schema.ts` — a malformed file fails
the build (and `npm test`) naming the file and field.

| What | Where | Template |
| ---- | ----- | -------- |
| Project case study | `content/projects/<lang>/<slug>.md` | `content/projects/_TEMPLATE.md` |
| Blog post | `content/blog/<lang>/<slug>.md` | `content/blog/_TEMPLATE.md` |

`<lang>` is `en` or `es`. Using the **same `<slug>` in both** is what marks two
files as translations of each other.

Notes:

- Files starting with `_` are ignored by the site.
- Cross-links between collections carry the language directory:
  `blogPost: "en/some-post"`.
- `draft: true` hides an entry; `featured: true` puts a project on the home page (max 6).
- `example: true` shows a visible "example content" notice — the two shipped
  projects and one post use it. Replace them with real case studies and delete the flag.
- Case studies follow a fixed structure: Problem → Architecture → Decisions &
  trade-offs → Metrics → Lessons learned → Links.

## Languages

The site is bilingual: **English is the default and lives at the root**
(`/about/`), Spanish lives under a prefix (`/es/about/`). The URL is the only
source of truth — there is no auto-detection and no client JS, so a shared link
always opens in the language it was written in.

- **UI and page copy**: `src/lib/strings.ts`, one object per language. The
  Spanish object is typed against the English one, so a missing key fails
  `npm run typecheck`, and `npm test` catches empty or untranslated values.
- **Bio data** (experience, education, …): `src/lib/about-data.ts`, one entry
  per language. Skill *items* are shared — only the group label is translated.
- **Internal links**: use `localeHref(lang, "/about/")` from `src/lib/i18n.ts`
  (it wraps `withBase`). `npm run check-links` fails the build if one slips.
- **Page bodies** live in `src/components/pages/`; the files under
  `src/pages/` and `src/pages/es/` are three-line route shims.

Translating an article is just adding the file — no code changes. Until then,
the English original is listed on the Spanish pages with an `EN` chip that
links to its English URL, and no Spanish URL is generated for it (no duplicate
content, no `hreflang` pointing at a page that does not exist).

## Assets to replace

- **CV**: `public/cv.pdf` (English) and `public/cv-es.pdf` (Spanish), linked
  from the home CTA, About and the footer in the matching language.
  `node scripts/generate-cv.mjs` rewrites the Spanish one (`… en` the English
  one, `… all` both) from the template and content in that script — edit the
  content there, not the PDF. Overwriting the PDFs by hand also works.
  The template reconstructs the original Word layout (A4, Calibri, `#1F3864`
  headings); it needs Calibri installed to break lines identically, and the
  PDFs are committed so builds never run it.
- **Portrait**: `public/images/portrait.jpg` — overwrite that file to update
  it. Shown in a 4:5 frame at 260px wide
  (`src/components/pages/AboutPage.astro`); any aspect
  ratio works (`object-fit: cover` crops it), ≥520px wide renders sharp on
  retina screens. If the source dimensions change, update the `width`/`height`
  attributes on the `<img>`.
- **Architecture diagrams**: `public/images/projects/<slug>/…`, referenced from
  each case study's Markdown. Absolute paths (`/images/...`) get the basePath
  automatically. Prefer preoptimized files (SVG or WebP) and, for raster
  images, HTML `<img>` with explicit `width`/`height` to avoid layout shift.
- **Social preview image**: `public/og.png` (1200×630) is generated from the
  site's design tokens — regenerate with `node scripts/generate-og.mjs` after
  changing name, role or URL (the meta tags live in `src/layouts/Base.astro`).

## Changing the base path / domain

The base path has a single source of truth: `astro.config.mjs` (`site` +
`base`). Dev, build and CI all honor it — no env vars.

- **Project repo (current setup)** — served under `/professional-portfolio`.
- **User repo** (`lepablito.github.io`): remove `base` from
  `astro.config.mjs` and drop the path from `url` in `src/lib/site.ts` and
  `scripts/check-base-links.mjs`.
- **Custom domain**: same as user repo, plus change `site`, add a
  `public/CNAME` file with the domain, and configure it in repo Settings →
  Pages.

## License

Code is MIT-licensed (see `LICENSE`). Written content (case studies, posts,
bio) and the CV are © Pablo Marcos Parra, all rights reserved.
