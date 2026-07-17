import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Markdown } from "@/components/Markdown";
import { formatDate, getProject, getProjects } from "@/lib/content";

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
  return {
    title: project.data.title,
    description: project.data.summary,
    openGraph: {
      type: "article",
      title: project.data.title,
      description: project.data.summary,
      url: `/projects/${slug}/`,
    },
    twitter: {
      card: "summary",
      title: project.data.title,
      description: project.data.summary,
    },
  };
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const { data, content } = project;

  return (
    <article>
      <header className="article-header wrap">
        <p className="eyebrow">
          <span className="eyebrow-mark">fig.</span>Case study
        </p>
        <h1 className="display article-title">{data.title}</h1>
        <p className="lede hero-tagline">{data.summary}</p>
        <div className="article-meta">
          <span className="mono">{formatDate(data.date)}</span>
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
              <a className="link-ext" href={data.demo} target="_blank" rel="noopener noreferrer">
                Live demo
              </a>
            )}
            {data.repo && (
              <a className="link-ext" href={data.repo} target="_blank" rel="noopener noreferrer">
                Source code
              </a>
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
