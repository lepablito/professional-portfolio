# professional-portfolio

Portfolio of **Pablo Marcos Parra** — Applied AI Engineer, served at
[lepablito.github.io/professional-portfolio](https://lepablito.github.io/professional-portfolio/).
Built with Astro 5 (static, zero client framework) and deployed to GitHub
Pages with GitHub Actions.

## Run locally

```bash
npm install
npm run dev        # http://localhost:4321/professional-portfolio/
```

Other scripts:

```bash
npm run build        # static build → dist/
npm run preview      # serve dist/ locally (run build first)
npm run typecheck    # astro check
npm run lint         # eslint (typescript + astro plugins)
npm test             # vitest — schemas, helpers, and the real content/ files
npm run check-links  # fails if an internal link misses the base path
```

Use `npm ci` (not `npm install`) when you just want to install — it respects
the lockfile exactly, like CI does. Node ≥20 required (`.nvmrc` pins 22).

## Deploy

Every push to `main` builds the site and publishes `out/` to GitHub Pages
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
| Project case study | `content/projects/<slug>.md` | `content/projects/_TEMPLATE.md` |
| Blog post | `content/blog/<slug>.md` | `content/blog/_TEMPLATE.md` |

Notes:

- Files starting with `_` are ignored by the site.
- `draft: true` hides an entry; `featured: true` puts a project on the home page (max 6).
- `example: true` shows a visible "example content" notice — the two shipped
  projects and one post use it. Replace them with real case studies and delete the flag.
- Case studies follow a fixed structure: Problem → Architecture → Decisions &
  trade-offs → Metrics → Lessons learned → Links.

## Assets to replace

- **CV**: `public/cv.pdf` (linked from the home CTA, About and the footer).
  Overwrite that file to update it.
- **Portrait**: add `public/images/portrait.jpg` and swap the placeholder frame
  in `app/about/page.tsx` (marked with a TODO comment).
- **Architecture diagrams**: `public/images/projects/<slug>/…`, referenced from
  each case study's Markdown. Absolute paths (`/images/...`) get the basePath
  automatically. Prefer preoptimized files (SVG or WebP) and, for raster
  images, HTML `<img>` with explicit `width`/`height` to avoid layout shift.
- **Social preview image** (optional): add `public/og.png` (1200×630) and
  uncomment the `images` line in `app/layout.tsx` metadata.

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
