import type { Metadata } from "next";
import { ExternalLink } from "@/components/ExternalLink";
import { FactList } from "@/components/FactList";
import { Reveal } from "@/components/Reveal";
import { certifications, community, education, experience, languages, skills } from "@/lib/about-data";
import { asset, site } from "@/lib/site";

const description =
  "AI Engineer with 4+ years building production-ready AI systems — GenAI, LLMs and autonomous agents on GCP, Azure and AWS. Community organizer at GDG Valladolid.";

export const metadata: Metadata = {
  title: "About",
  description,
  openGraph: {
    title: "About",
    description,
    url: "/about/",
  },
};

export default function AboutPage() {
  return (
    <>
      <header className="article-header wrap">
        <p className="eyebrow rise">
          <span className="eyebrow-mark" aria-hidden="true">
            §
          </span>
          About
        </p>
        <h1 className="display rise rise-2">Prototype fast, ship for real.</h1>
      </header>

      <section className="section wrap" aria-label="Bio">
        <Reveal>
          <div className="about-grid">
            <div>
              <p className="lede">
                I&apos;m an AI engineer with 4+ years building production-ready AI systems. My
                current focus is Generative AI — LLMs and autonomous agents — taken from prototype
                all the way to production. Most of my recent work runs on Google Cloud (Vertex
                AI), with hands-on experience across Azure and AWS as well.
              </p>
              <p className="lede">
                I&apos;ve built machine-learning systems end to end: from designing the data
                pipelines and ETLs that feed them to the cloud microservice architectures they run
                on. Much of that happened inside Grupo Santander, where &quot;production&quot;
                means robust, scalable and secure by default.
              </p>
              <p className="lede">
                Underneath it all is a foundation in computer science, statistics and data
                science — paired with a genuine passion for developer relations: conference talks,
                community initiatives and live public demos. Teaching something is still my
                favorite way to learn it.
              </p>
              <div className="cta-actions">
                <a className="btn btn-primary" href={asset(site.cvPath)} download>
                  Download CV (PDF)
                </a>
                <ExternalLink className="btn" href={site.linkedin}>
                  LinkedIn ↗
                </ExternalLink>
              </div>
            </div>
            {/* TODO: replace with a real portrait at public/images/portrait.jpg
                and swap this frame for:
                <img src={asset("/images/portrait.jpg")} alt="Pablo Marcos Parra" /> */}
            <div className="portrait-frame" aria-hidden="true">
              <p className="mono">
                portrait goes here
                <br />
                public/images/portrait.jpg
              </p>
            </div>
          </div>
        </Reveal>
      </section>

      <section className="section wrap" aria-labelledby="experience-heading">
        <Reveal>
          <div className="section-head">
            <h2 id="experience-heading" className="eyebrow">
              <span className="eyebrow-mark" aria-hidden="true">
                § 01
              </span>
              Experience
            </h2>
          </div>
          <ol className="timeline">
            {experience.map((job) => (
              <li key={`${job.role}-${job.period}`} className="timeline-item">
                <p className="mono">{job.period}</p>
                <h3 className="timeline-role">{job.role}</h3>
                <p className="timeline-org">{job.org}</p>
                <p className="timeline-desc">{job.description}</p>
              </li>
            ))}
          </ol>
        </Reveal>
      </section>

      <section className="section wrap" aria-labelledby="community-heading">
        <Reveal>
          <div className="community-band">
            <h2 id="community-heading" className="eyebrow">
              <span className="eyebrow-mark" aria-hidden="true">
                § 02
              </span>
              Community
            </h2>
            <p className="display community-title">Half of engineering is explaining it well.</p>
            <ul className="community-list">
              {community.map((entry) => (
                <li key={entry.role}>
                  <p className="mono">{entry.period}</p>
                  <h3 className="community-role">{entry.role}</h3>
                  <p className="mono community-detail">{entry.detail}</p>
                  <p className="community-desc">{entry.description}</p>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </section>

      <section className="section wrap" aria-labelledby="skills-heading">
        <Reveal>
          <div className="section-head">
            <h2 id="skills-heading" className="eyebrow">
              <span className="eyebrow-mark" aria-hidden="true">
                § 03
              </span>
              Skills
            </h2>
          </div>
          <div className="skills-grid">
            {skills.map((group) => (
              <div key={group.group} className="skills-group">
                <h3>{group.group}</h3>
                <ul className="tag-row">
                  {group.items.map((item) => (
                    <li key={item} className="tag">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="section wrap" aria-labelledby="background-heading">
        <Reveal>
          <div className="section-head">
            <h2 id="background-heading" className="eyebrow">
              <span className="eyebrow-mark" aria-hidden="true">
                § 04
              </span>
              Background
            </h2>
          </div>
          <div className="skills-grid">
            <div className="skills-group">
              <h3>Education</h3>
              <FactList facts={education} />
            </div>
            <div className="skills-group">
              <h3>Certifications</h3>
              <FactList facts={certifications} />
            </div>
            <div className="skills-group">
              <h3>Languages</h3>
              <FactList facts={languages} />
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
