import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { formatDate, getPosts } from "@/lib/content";

const description =
  "Technical notes on building LLM systems: agents, RAG, evaluation and the road from prototype to production.";

export const metadata: Metadata = {
  title: "Blog",
  description,
  openGraph: {
    title: "Blog",
    description,
    url: "/blog/",
  },
};

export default function BlogPage() {
  const posts = getPosts();

  return (
    <>
      <header className="article-header wrap">
        <p className="eyebrow rise">
          <span className="eyebrow-mark" aria-hidden="true">
            §
          </span>
          Blog
        </p>
        <h1 className="display rise rise-2">Notes from production.</h1>
        <p className="lede hero-tagline rise rise-3">
          Write-ups on LLM systems, agents and the unglamorous work that makes them reliable.
        </p>
      </header>

      <section className="section wrap" aria-label="All posts">
        <Reveal>
          {posts.length > 0 ? (
            <ol className="post-list">
              {posts.map((post) => (
                <li key={post.slug} className="post-row">
                  <time className="mono" dateTime={post.data.date}>
                    {formatDate(post.data.date)}
                  </time>
                  <div>
                    <h2 className="post-row-title">
                      <Link href={`/blog/${post.slug}/`}>{post.data.title}</Link>
                    </h2>
                    <p className="post-row-desc">{post.data.description}</p>
                  </div>
                  <div className="post-row-meta">
                    <span className="mono">{post.readingMinutes} min read</span>
                    <ul className="tag-row" aria-label="Tags">
                      {post.data.tags.map((tag) => (
                        <li key={tag} className="tag">
                          {tag}
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <p className="lede">The first post is in the works — check back soon.</p>
          )}
        </Reveal>
      </section>
    </>
  );
}
