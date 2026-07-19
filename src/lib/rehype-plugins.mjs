// Rehype plugins shared by the Markdown pipeline (astro.config.mjs).
// Plain JS module so the Astro config can import it without a TS loader.

/**
 * GitHub Pages serves this site under a base path. Astro does not rewrite
 * raw `src`/`href` attributes inside Markdown, so without this plugin every
 * architecture diagram referenced as /images/... would 404 in production.
 * Ported unchanged from the Next.js version (framework-agnostic hast walker).
 */
export function rehypeBasePath(options = {}) {
  const base = (options.base ?? "").replace(/\/$/, "");
  return (tree) => {
    if (!base) return;
    const visit = (node) => {
      if (node.type === "element" && node.properties) {
        for (const attr of ["src", "href"]) {
          const value = node.properties[attr];
          if (typeof value === "string" && value.startsWith("/") && !value.startsWith("//")) {
            node.properties[attr] = `${base}${value}`;
          }
        }
      }
      if (node.children) node.children.forEach(visit);
    };
    visit(tree);
  };
}

/**
 * Wide code blocks scroll horizontally; tabindex makes that scroll reachable
 * by keyboard (WCAG 2.1.1). Replaces the custom `pre` component the Next.js
 * version passed to MDXRemote.
 */
export function rehypePreTabIndex() {
  return (tree) => {
    const visit = (node) => {
      if (node.type === "element" && node.tagName === "pre") {
        node.properties = { ...node.properties, tabIndex: 0 };
      }
      if (node.children) node.children.forEach(visit);
    };
    visit(tree);
  };
}
