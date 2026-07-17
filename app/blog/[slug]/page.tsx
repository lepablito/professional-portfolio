import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Markdown } from "@/components/Markdown";
import { formatDate, getPost, getPosts } from "@/lib/content";

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
  return {
    title: post.data.title,
    description: post.data.description,
    openGraph: {
      type: "article",
      title: post.data.title,
      description: post.data.description,
      publishedTime: post.data.date,
      url: `/blog/${slug}/`,
    },
    twitter: {
      card: "summary",
      title: post.data.title,
      description: post.data.description,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const { data, content, readingMinutes } = post;

  return (
    <article>
      <header className="article-header wrap">
        <p className="eyebrow">
          <span className="eyebrow-mark">§</span>Blog
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
