import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

// Content files are plain Markdown (format: "md"), which keeps HTML comments
// like <!-- TODO --> legal in source; rehype-raw parses raw HTML and drops
// the comments from the rendered output.
export function Markdown({ source }: { source: string }) {
  return (
    <MDXRemote
      source={source}
      options={{
        mdxOptions: {
          format: "md",
          remarkPlugins: [remarkGfm],
          rehypePlugins: [rehypeRaw],
        },
      }}
    />
  );
}
