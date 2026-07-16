# lepablito.github.io

Portfolio of **Pablo Marcos Parra** — Applied AI Engineer. Built with Next.js
(App Router, TypeScript, static export) and deployed to GitHub Pages with
GitHub Actions.

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

1. Create the repo `lepablito/lepablito.github.io` and push this project to `main`.
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

- **User repo (current setup)** — served at the root, no basePath needed.
- **Project repo** (e.g. `lepablito/portfolio`): set
  `NEXT_PUBLIC_BASE_PATH=/portfolio` in `.github/workflows/deploy.yml`
  (commented example inside) — `next.config.ts` and asset helpers pick it up.
- **Custom domain**: change `url` in `lib/site.ts`, add a `public/CNAME` file
  containing the domain, and configure the domain in repo Settings → Pages.
