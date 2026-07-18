import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "@/components/ExternalLink";
import { Markdown } from "@/components/Markdown";
import { formatDate, getProject, getProjects } from "@/lib/content";
import { buildArticleMetadata } from "@/lib/metadata";

interface Props {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return getProjects().map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  return buildArticleMetadata({
    title: project.data.title,
    description: project.data.summary,
    url: `/projects/${slug}/`,
    publishedTime: project.data.date,
  });
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const { data, content } = project;

  return (
    <article>
      <header className="article-header wrap">
        <Link className="link-more" href="/projects/">
          ← All projects
        </Link>
        <p className="eyebrow article-eyebrow">
          <span className="eyebrow-mark" aria-hidden="true">
            fig.
          </span>
          Case study
        </p>
        <h1 className="display article-title">{data.title}</h1>
        <p className="lede hero-tagline">{data.summary}</p>
        <div className="article-meta">
          <time className="mono" dateTime={data.date}>
            {formatDate(data.date)}
          </time>
          <ul className="tag-row" aria-label="Tech stack">
            {data.stack.map((tech) => (
              <li key={tech} className="tag">
                {tech}
              </li>
            ))}
          </ul>
        </div>
        {(data.demo || data.repo || data.blogPost) && (
          <div className="article-links">
            {data.demo && (
              <ExternalLink className="link-ext" href={data.demo}>
                Live demo
              </ExternalLink>
            )}
            {data.repo && (
              <ExternalLink className="link-ext" href={data.repo}>
                Source code
              </ExternalLink>
            )}
            {data.blogPost && (
              <Link className="link-more" href={`/blog/${data.blogPost}/`}>
                Related blog post →
              </Link>
            )}
          </div>
        )}
      </header>

      <div className="wrap">
        {data.example && (
          <p className="example-note">
            <strong>Example content.</strong> This case study is placeholder material that shows
            the layout — it does not describe a real project yet.
          </p>
        )}
        <div className="prose">
          <Markdown source={content} />
        </div>
      </div>
    </article>
  );
}
