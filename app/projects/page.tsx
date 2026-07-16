import type { Metadata } from "next";
import { ProjectCard } from "@/components/ProjectCard";
import { Reveal } from "@/components/Reveal";
import { getProjects } from "@/lib/content";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Case studies of AI systems taken to production: the problem, the architecture, the trade-offs, the metrics and the lessons.",
  openGraph: {
    title: "Projects",
    description:
      "Case studies of AI systems taken to production: the problem, the architecture, the trade-offs, the metrics and the lessons.",
    url: "/projects/",
  },
};

export default function ProjectsPage() {
  const projects = getProjects();

  return (
    <>
      <header className="article-header wrap">
        <p className="eyebrow rise">Projects</p>
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
            <div className="card-grid">
              {projects.map((project) => (
                <ProjectCard key={project.slug} project={project} />
              ))}
            </div>
          ) : (
            <p className="lede">
              No projects published yet. Add a Markdown file to <code>content/projects/</code> to
              create the first one.
            </p>
          )}
        </Reveal>
      </section>
    </>
  );
}
