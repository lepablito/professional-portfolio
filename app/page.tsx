import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { WorkRow } from "@/components/WorkRow";
import { getFeaturedProjects } from "@/lib/content";
import { asset, site } from "@/lib/site";

export default function HomePage() {
  const featured = getFeaturedProjects();

  return (
    <>
      <section className="hero wrap">
        <p className="eyebrow hero-eyebrow rise">
          {site.name} · {site.location}
        </p>
        <h1 className="display hero-title rise rise-2">
          Applied AI Engineer building{" "}
          <span className="marker">
            production-grade
            <svg
              className="marker-stroke"
              viewBox="0 0 220 12"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path
                d="M3 9 C 60 3, 140 2.5, 217 7"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </svg>
          </span>{" "}
          LLM systems
        </h1>
        <p className="lede hero-tagline rise rise-3">{site.tagline}</p>
        <dl className="titleblock hero-titleblock rise rise-4">
          <div>
            <dt>Focus</dt>
            <dd>autonomous agents · RAG · microservices</dd>
          </div>
          <div>
            <dt>Currently</dt>
            <dd>AI Team @ Grupo Santander</dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd>open to Applied AI roles</dd>
          </div>
          <div>
            <dt>Location</dt>
            <dd>Valladolid, ES · 41.65° N, 4.72° W</dd>
          </div>
        </dl>
      </section>

      <section className="section" aria-labelledby="profile-heading">
        <div className="wrap">
          <Reveal>
            <div className="section-head">
              <h2 id="profile-heading" className="eyebrow">
                <span className="eyebrow-mark">§ 01</span>Profile
              </h2>
              <Link href="/about" className="link-more">
                More about me →
              </Link>
            </div>
            <p className="lede">
              Pablo is an AI Engineer specialized in LLMs, autonomous agents and RAG systems, with
              experience building AI solutions end to end — from data pipelines to microservices
              deployed in production. He has spent most of his career in the financial sector
              (Grupo Santander), where he learned to build robust, scalable and secure systems.
              Outside of work he is an active tech community organizer and speaker (Google
              Developer Group Valladolid).
            </p>
          </Reveal>
        </div>
      </section>

      <section className="section" aria-labelledby="projects-heading">
        <div className="wrap">
          <Reveal>
            <div className="section-head">
              <h2 id="projects-heading" className="eyebrow">
                <span className="eyebrow-mark">§ 02</span>Selected work
              </h2>
              <Link href="/projects" className="link-more">
                All projects →
              </Link>
            </div>
            <ol className="work-index">
              {featured.map((project, i) => (
                <WorkRow key={project.slug} project={project} index={i} />
              ))}
            </ol>
          </Reveal>
        </div>
      </section>

      <section className="section" aria-labelledby="contact-heading">
        <div className="wrap">
          <Reveal>
            <h2 id="contact-heading" className="eyebrow">
              <span className="eyebrow-mark">§ 03</span>Contact
            </h2>
            <p className="display cta-title">Let&apos;s build something that ships.</p>
            <p className="lede cta-lede">
              The fastest way to reach me is email or LinkedIn. For the full picture, the CV has
              the details.
            </p>
            <div className="cta-actions">
              <a className="btn btn-primary" href={asset(site.cvPath)} download>
                Download CV (PDF)
              </a>
              <a className="btn" href={`mailto:${site.email}`}>
                Email me
              </a>
              <a className="btn" href={site.linkedin} target="_blank" rel="noopener noreferrer">
                LinkedIn ↗
              </a>
              <a className="btn" href={site.github} target="_blank" rel="noopener noreferrer">
                GitHub ↗
              </a>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
