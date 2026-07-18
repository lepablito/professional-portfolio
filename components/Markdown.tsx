import type { ComponentPropsWithoutRef } from "react";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { basePath } from "@/lib/site";

// Content files are plain Markdown (format: "md"), which keeps HTML comments
// like <!-- TODO --> legal in source; rehype-raw parses raw HTML and drops
// the comments from the rendered output.
//
// Sanitization note (deliberate): rehype-sanitize is NOT in the pipeline.
// The only source of this Markdown is content/ files authored by the site
// owner and versioned in this repo. If third-party or user-generated content
// ever flows through here, add rehype-sanitize with an allowlist first.

interface HastNode {
  type: string;
  tagName?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
}

// GitHub Pages serves this site under a basePath in production. next/link
// prefixes routes automatically, but raw `src`/`href` attributes inside
// Markdown do not get that treatment — without this plugin, every
// architecture diagram referenced as /images/... would 404 when deployed.
function rehypeBasePath() {
  return (tree: HastNode) => {
    if (!basePath) return;
    const visit = (node: HastNode) => {
      if (node.type === "element" && node.properties) {
        for (const attr of ["src", "href"]) {
          const value = node.properties[attr];
          if (typeof value === "string" && value.startsWith("/") && !value.startsWith("//")) {
            node.properties[attr] = `${basePath}${value}`;
          }
        }
      }
      node.children?.forEach(visit);
    };
    visit(tree);
  };
}

const components = {
  // Wide code blocks scroll horizontally; tabIndex makes that scroll
  // reachable by keyboard (WCAG 2.1.1).
  pre: (props: ComponentPropsWithoutRef<"pre">) => <pre tabIndex={0} {...props} />,
};

export function Markdown({ source }: { source: string }) {
  return (
    <MDXRemote
      source={source}
      components={components}
      options={{
        mdxOptions: {
          format: "md",
          remarkPlugins: [remarkGfm],
          rehypePlugins: [rehypeRaw, rehypeBasePath],
        },
      }}
    />
  );
}
