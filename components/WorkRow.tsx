import Link from "next/link";
import type { Project } from "@/lib/content";
import { ExternalLink } from "./ExternalLink";

// Projects rendered as an indexed list of figures, like a document's
// table of contents — not a card grid. `headingLevel` adapts to context:
// h3 under the home's "Selected work" h2, h2 on /projects where rows sit
// directly under the page h1.
export function WorkRow({
  project,
  index,
  headingLevel = "h3",
}: {
  project: Project;
  index: number;
  headingLevel?: "h2" | "h3";
}) {
  const { slug, data } = project;
  const Heading = headingLevel;

  return (
    <li className="work-row">
      <span className="work-num" aria-hidden="true">
        {String(index + 1).padStart(2, "0")}
      </span>
      <div>
        <Heading className="work-title">
          <Link href={`/projects/${slug}/`}>{data.title}</Link>
        </Heading>
        <p className="work-summary">{data.summary}</p>
        <p className="work-stack">{data.stack.join(" / ")}</p>
      </div>
      <div className="work-side">
        {data.example && <span className="example-badge">Example content</span>}
        {data.demo && (
          <ExternalLink className="link-ext" href={data.demo}>
            Demo
          </ExternalLink>
        )}
        {data.repo && (
          <ExternalLink className="link-ext" href={data.repo}>
            Code
          </ExternalLink>
        )}
      </div>
    </li>
  );
}
