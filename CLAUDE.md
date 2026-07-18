# professional-portfolio

Portfolio of Pablo Marcos Parra (Applied AI Engineer), served at
https://lepablito.github.io/professional-portfolio/. Site copy is **English**.

## Commands

- `npm run dev` — local dev at the root (no basePath locally)
- `npm run build` — static export to `out/`
- `npm run lint` / `npm test` / `npm run typecheck` — all three run in CI before build

## Architecture

- Next.js 15 App Router, TypeScript strict, `output: "export"` → GitHub Pages.
- Content = Markdown in `content/projects/` and `content/blog/`. Frontmatter is
  **validated and normalized in `lib/content.ts`** (single entry point — never
  access raw frontmatter fields elsewhere). Files prefixed `_` are templates.
- Biographical data lives in `lib/about-data.ts` (About page + home "Currently").
- `basePath` has a single source of truth: `lib/site.ts` reads
  `NEXT_PUBLIC_BASE_PATH` (set only in `.github/workflows/deploy.yml`);
  `next.config.ts` imports it from there. Use `asset()` for public/ file URLs
  in TSX; Markdown `src`/`href` get the prefix via the rehype plugin in
  `components/Markdown.tsx`.

## Design identity: "engineering drawing"

The site reads as a technical document — this is deliberate, keep it coherent:
graph-paper background, title-block cells (`.titleblock`: the hero spec
table — the footer is deliberately a plain contact row, Pablo found the
drawing-style footer confusing), numbered spec sections
(`§ 01`, `fig.`), projects as an indexed figure list (`WorkRow`), zero border
radius, square uppercase mono chips. Fraunces (display, variable + opsz — the
~67 KB font file is an accepted trade-off, see comment in `app/layout.tsx`) /
IBM Plex Sans / IBM Plex Mono. One accent: pine green (#0F7A5E light /
#4FD6A6 dark), AA-verified. Avoid: purple/blue AI gradients, rounded card
grids, dark-OLED dev-portfolio clichés.

## Constraints

- Static export: no API routes, middleware, or image optimization server.
- The dark-token block appears twice in `globals.css` (`[data-theme="dark"]`
  and the no-JS `prefers-color-scheme` fallback) — keep them identical.
- `example: true` frontmatter marks placeholder content with a visible badge;
  real case studies replace those files and drop the flag.
- No `rehype-sanitize` by design (own content only) — add it before ever
  rendering third-party Markdown.
