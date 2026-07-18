import type { Metadata } from "next";
import { Reveal } from "@/components/Reveal";
import { WorkRow } from "@/components/WorkRow";
import { getProjects } from "@/lib/content";

const description =
  "Case studies of AI systems taken to production: the problem, the architecture, the trade-offs, the metrics and the lessons.";

export const metadata: Metadata = {
  title: "Projects",
  description,
  openGraph: {
    title: "Projects",
    description,
    url: "/projects/",
  },
};

export default function ProjectsPage() {
  const projects = getProjects();

  return (
    <>
      <header className="article-header wrap">
        <p className="eyebrow rise">
          <span className="eyebrow-mark" aria-hidden="true">
            §
          </span>
          Projects
        </p>
        <h1 className="display rise rise-2">Case studies, not screenshots.</h1>
        <p className="lede hero-tagline rise rise-3">
          Every project here follows the same structure: problem → architecture → decisions &
          trade-offs → metrics → lessons learned. The parts that matter when a system has to
          survive production.
        </p>
      </header>

      <section className="section wrap" aria-label="All projects">
        <Reveal>
          {projects.length > 0 ? (
            <ol className="work-index">
              {projects.map((project, i) => (
                <WorkRow key={project.slug} project={project} index={i} headingLevel="h2" />
              ))}
            </ol>
          ) : (
            <p className="lede">New case studies are on the way — check back soon.</p>
          )}
        </Reveal>
      </section>
    </>
  );
}
