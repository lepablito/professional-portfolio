# professional-portfolio

Portfolio of **Pablo Marcos Parra** — Applied AI Engineer, served at
[lepablito.github.io/professional-portfolio](https://lepablito.github.io/professional-portfolio/).
Built with Next.js (App Router, TypeScript, static export) and deployed to
GitHub Pages with GitHub Actions.

## Run locally

```bash
npm install
npm run dev        # http://localhost:3000
```

Other scripts:

```bash
npm run build      # static export → out/
npm run preview    # serve out/ locally (run build first)
npm run typecheck  # tsc --noEmit
```

## Deploy

Every push to `main` builds the site and publishes `out/` to GitHub Pages
(`.github/workflows/deploy.yml`). One-time setup:

1. Create the repo `lepablito/professional-portfolio` and push this project to `main`.
2. In the repo: **Settings → Pages → Build and deployment → Source: GitHub Actions**.

That's it — the first push triggers the first deploy.

## Content

Adding a project or a blog post = adding one Markdown file. Frontmatter is
typed in `lib/content.ts`.

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
  each case study's Markdown.
- **Social preview image** (optional): add `public/og.png` (1200×630) and
  uncomment the `images` line in `app/layout.tsx` metadata.

## Changing the base path / domain

- **Project repo (current setup)** — served under `/professional-portfolio`:
  `NEXT_PUBLIC_BASE_PATH=/professional-portfolio` is set in
  `.github/workflows/deploy.yml`, and `url` in `lib/site.ts` includes the
  path. Local `npm run dev`/`preview` runs at the root (the env var is only
  set in CI), which is fine for development.
- **User repo** (`lepablito.github.io`): remove the `env` block from the
  workflow and drop the path from `url` in `lib/site.ts`.
- **Custom domain**: change `url` in `lib/site.ts` (no path), remove the
  workflow `env` block, add a `public/CNAME` file containing the domain, and
  configure the domain in repo Settings → Pages.
