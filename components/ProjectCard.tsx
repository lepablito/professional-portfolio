import Link from "next/link";
import type { Project } from "@/lib/content";

export function ProjectCard({ project }: { project: Project }) {
  const { slug, data } = project;

  return (
    <article className="project-card">
      {data.example && <span className="example-badge">Example content</span>}
      <h3 className="project-card-title">
        <Link href={`/projects/${slug}/`}>{data.title}</Link>
      </h3>
      <p className="project-card-summary">{data.summary}</p>
      <ul className="tag-row" aria-label="Tech stack">
        {data.stack.map((tech) => (
          <li key={tech} className="tag">
            {tech}
          </li>
        ))}
      </ul>
      {(data.demo || data.repo) && (
        <div className="card-links">
          {data.demo && (
            <a className="link-ext" href={data.demo} target="_blank" rel="noopener noreferrer">
              Demo
            </a>
          )}
          {data.repo && (
            <a className="link-ext" href={data.repo} target="_blank" rel="noopener noreferrer">
              Code
            </a>
          )}
        </div>
      )}
    </article>
  );
}
