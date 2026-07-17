import type { Metadata } from "next";
import { Reveal } from "@/components/Reveal";
import { asset, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description:
    "AI Engineer with 4+ years building production-ready AI systems — GenAI, LLMs and autonomous agents on GCP, Azure and AWS. Community organizer at GDG Valladolid.",
  openGraph: {
    title: "About",
    description:
      "AI Engineer with 4+ years building production-ready AI systems — GenAI, LLMs and autonomous agents on GCP, Azure and AWS. Community organizer at GDG Valladolid.",
    url: "/about/",
  },
};

const experience = [
  {
    role: "Analyst II · AI Team",
    org: "Santander Consumer Finance Global Services (Grupo Santander)",
    period: "Oct 2025 – Present",
    description:
      "Leading end-to-end design of automation solutions on a microservice architecture. Designing high-impact GenAI demos and PoCs for executive and technical audiences, driving internal DevRel initiatives, managing team resources and mentoring junior analysts.",
  },
  {
    role: "Analyst I · AI Team & Junior Data Analyst",
    org: "Santander Consumer Finance Global Services (Grupo Santander)",
    period: "Sep 2023 – Sep 2025",
    description:
      "Developed and deployed GenAI and LLM solutions for financial use cases, including autonomous agents that automate knowledge-intensive workflows. Built data pipelines and ETLs, and developed internal Python libraries.",
  },
  {
    role: "AI Researcher",
    org: "AIR Institute",
    period: "Feb 2022 – Aug 2023",
    description:
      "Research and implementation of GenAI and LLM solutions; explainable AI models, time-series forecasting and predictive maintenance; NLP algorithms for text understanding and classification.",
  },
];

const community = [
  {
    role: "Google Developer Group Valladolid",
    detail: "Organizer & speaker",
    period: "Feb 2023 – Present",
    description: "Running the local Google developer community: organizing meetups and giving talks on applied AI.",
  },
  {
    role: "Young Programmers Club",
    detail: "Python instructor",
    period: "Oct 2022 – Present",
    description: "Teaching Python to students aged 12–18 and preparing them for the Informatics Olympiad.",
  },
  {
    role: "Google Developer Student Club",
    detail: "Lead",
    period: "2021 – 2023",
    description: "Led the university chapter, coordinating events and workshops for student developers.",
  },
];

const skills = [
  {
    group: "Generative AI & LLMs",
    items: ["LLMs", "Prompt Engineering", "RAG", "Fine-Tuning", "Agentic AI", "Autonomous Agents", "LangChain"],
  },
  {
    group: "ML & Deep Learning",
    items: ["TensorFlow", "Keras", "PyTorch", "Scikit-learn", "Time Series", "Predictive Maintenance", "Explainable AI"],
  },
  {
    group: "NLP",
    items: ["Transformers", "Embeddings", "Text Classification", "NER"],
  },
  {
    group: "Data & MLOps",
    items: ["ETL Pipelines", "Microservices", "REST APIs", "Docker"],
  },
  {
    group: "Cloud",
    items: ["GCP (Vertex AI)", "Azure AI", "AWS"],
  },
  {
    group: "Programming",
    items: ["Python", "R", "SQL"],
  },
];

const education = [
  { degree: "MSc in Data Science", school: "Universitat Oberta de Catalunya (UOC)" },
  { degree: "BEng in Computer Engineering", school: "Universidad de Valladolid" },
  { degree: "BSc in Statistics", school: "Universidad de Valladolid" },
];

const certifications = [
  { name: "Azure AI Fundamentals (AI-900)", issuer: "Microsoft" },
  { name: "Introduction to Quantum Computing", issuer: "UNED" },
];

const languages = [
  { name: "Spanish", level: "Native" },
  { name: "English", level: "C1/C2 · Full professional proficiency" },
];

export default function AboutPage() {
  return (
    <>
      <header className="article-header wrap">
        <p className="eyebrow rise">
          <span className="eyebrow-mark">§</span>About
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
                <a className="btn" href={site.linkedin} target="_blank" rel="noopener noreferrer">
                  LinkedIn ↗
                </a>
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
              <span className="eyebrow-mark">§ 01</span>Experience
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
              <span className="eyebrow-mark">§ 02</span>Community
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
              <span className="eyebrow-mark">§ 03</span>Skills
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
              <span className="eyebrow-mark">§ 04</span>Background
            </h2>
          </div>
          <div className="skills-grid">
            <div className="skills-group">
              <h3>Education</h3>
              <ul className="fact-list">
                {education.map((entry) => (
                  <li key={entry.degree}>
                    <span>{entry.degree}</span>
                    <span className="mono">{entry.school}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="skills-group">
              <h3>Certifications</h3>
              <ul className="fact-list">
                {certifications.map((entry) => (
                  <li key={entry.name}>
                    <span>{entry.name}</span>
                    <span className="mono">{entry.issuer}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="skills-group">
              <h3>Languages</h3>
              <ul className="fact-list">
                {languages.map((entry) => (
                  <li key={entry.name}>
                    <span>{entry.name}</span>
                    <span className="mono">{entry.level}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
