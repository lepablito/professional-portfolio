import Link from "next/link";
import type { Project } from "@/lib/content";

// Projects rendered as an indexed list of figures, like a document's
// table of contents — not a card grid.
export function WorkRow({ project, index }: { project: Project; index: number }) {
  const { slug, data } = project;

  return (
    <li className="work-row">
      <span className="work-num" aria-hidden="true">
        {String(index + 1).padStart(2, "0")}
      </span>
      <div>
        <h3 className="work-title">
          <Link href={`/projects/${slug}/`}>{data.title}</Link>
        </h3>
        <p className="work-summary">{data.summary}</p>
        <p className="work-stack">{data.stack.join(" / ")}</p>
      </div>
      <div className="work-side">
        {data.example && <span className="example-badge">Example content</span>}
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
    </li>
  );
}
