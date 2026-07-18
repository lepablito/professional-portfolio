import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Markdown } from "@/components/Markdown";
import { formatDate, getPost, getPosts } from "@/lib/content";
import { buildArticleMetadata } from "@/lib/metadata";

interface Props {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return getPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return buildArticleMetadata({
    title: post.data.title,
    description: post.data.description,
    url: `/blog/${slug}/`,
    publishedTime: post.data.date,
  });
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const { data, content, readingMinutes } = post;

  return (
    <article>
      <header className="article-header wrap">
        <Link className="link-more" href="/blog/">
          ← Blog
        </Link>
        <p className="eyebrow article-eyebrow">
          <span className="eyebrow-mark" aria-hidden="true">
            §
          </span>
          Blog
        </p>
        <h1 className="display article-title">{data.title}</h1>
        <div className="article-meta">
          <time className="mono" dateTime={data.date}>
            {formatDate(data.date)}
          </time>
          <span className="mono">{readingMinutes} min read</span>
          <ul className="tag-row" aria-label="Tags">
            {data.tags.map((tag) => (
              <li key={tag} className="tag">
                {tag}
              </li>
            ))}
          </ul>
        </div>
        {data.relatedProject && (
          <div className="article-links">
            <Link className="link-more" href={`/projects/${data.relatedProject}/`}>
              Related case study →
            </Link>
          </div>
        )}
      </header>

      <div className="wrap">
        {data.example && (
          <p className="example-note">
            <strong>Example content.</strong> This post is placeholder material that shows the
            layout — it will be replaced by a real write-up.
          </p>
        )}
        <div className="prose">
          <Markdown source={content} />
        </div>
      </div>
    </article>
  );
}
