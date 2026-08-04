// Generates the CV PDFs by rendering an HTML template with Playwright's
// Chromium (already a devDependency, same trick as scripts/generate-og.mjs)
// and printing it to A4.
//
//   node scripts/generate-cv.mjs        → public/cv-es.pdf   (Spanish)
//   node scripts/generate-cv.mjs en     → public/cv.pdf      (English)
//   node scripts/generate-cv.mjs all    → both
//
// WHY THIS EXISTS: the original public/cv.pdf was laid out in Microsoft Word
// and that .docx is not in the repo, so the Spanish version could not be
// produced by translating the source. This template reproduces the Word
// design from the PDF itself — A4, 36pt margins, Calibri, #1F3864 headings
// with a rule under each section — and is therefore a faithful
// reconstruction, not a byte-for-byte copy. Review the output before
// sending it anywhere.
//
// FONT: Calibri is a Microsoft font. On a machine without it, Chromium falls
// back to Carlito (metric-compatible, common on Linux) or the generic
// sans-serif, and line breaks will shift. The output is committed, so builds
// never depend on this script.
//
// Content lives in this file on purpose: the CV carries detail the site does
// not (phone number, per-role bullets, EQF levels). Keep it in step with
// src/lib/about-data.ts when a role or a degree changes.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "@playwright/test";

const root = process.cwd();

const shared = {
  name: "Pablo Marcos Parra",
  phone: "+34 615 924 565",
  email: "pablo.marcos.parra@gmail.com",
  linkedin: "linkedin.com/in/pablomarcosparra",
  website: "lepablito.github.io/professional-portfolio",
};

const en = {
  file: "cv.pdf",
  htmlLang: "en",
  role: "AI Engineer  |  Generative AI, LLMs & Autonomous Agents",
  location: "Valladolid, Spain",
  sections: {
    summary: "Professional Summary",
    experience: "Work Experience",
    skills: "Skills",
    education: "Education",
    certifications: "Certifications",
    languages: "Languages",
    community: "Community & Volunteering",
  },
  summary:
    "AI Engineer with 4+ years building Generative AI, LLM and autonomous-agent systems and getting them into production, most of that in the financial sector at Santander Group. I work across the whole ML lifecycle, from ETL pipelines through to microservices deployed on Google Cloud Platform (Vertex AI), Azure and AWS. I also lead a team, run developer relations internally, and speak regularly at conferences and community events.",
  experience: [
    {
      title: "Applied AI Engineer",
      period: "09/2023 – Present",
      org: "Santander Consumer Finance Global Services – Santander Group · Valladolid, Spain",
      bullets: [
        "Lead the design and delivery of automated process solutions on a microservices architecture used across business units.",
        "Build and deploy Generative AI and LLM solutions for financial services, including autonomous agents that take over knowledge-intensive workflows.",
        "Design and present GenAI demos and proofs of concept to executive and technical audiences to build buy-in for new AI work.",
        "Run internal developer relations: evangelize GenAI practices, build technical showcases, and demo them live to engineering teams.",
        "Build ETL pipelines and internal Python libraries that other teams reuse for their own analytics and ML work.",
        "Manage team resources and mentor junior analysts on how to design AI solutions.",
      ],
    },
    {
      title: "AI Researcher",
      period: "02/2022 – 08/2023",
      org: "AIR Institute · Valladolid, Spain",
      bullets: [
        "Researched and implemented Generative AI and LLM solutions, and helped bring transformer architectures into applied research projects early on.",
        "Built and interpreted ML models for Explainable AI (xAI), time series forecasting and predictive maintenance.",
        "Implemented NLP algorithms for text understanding and classification using transformers and embeddings.",
      ],
    },
  ],
  skills: [
    ["Programming", "Python (advanced), R, SQL, LaTeX"],
    ["Generative AI & LLMs", "LLMs, Prompt Engineering, RAG, Fine-Tuning, Agentic AI, Autonomous Agents, LangChain"],
    ["Machine Learning & Deep Learning", "TensorFlow, Keras, PyTorch, Scikit-learn, Time Series, Explainable AI (xAI)"],
    ["NLP", "Transformers, Embeddings, Text Classification, Named Entity Recognition (NER)"],
    ["Data & MLOps", "ETL Pipelines, Microservices, REST APIs, Docker"],
    ["Cloud", "Google Cloud Platform (Vertex AI), Microsoft Azure AI, Azure Cognitive Services, AWS"],
    ["Leadership & Communication", "Team Leadership, Developer Relations, Public Speaking, Mentoring"],
  ],
  education: [
    "MSc in Data Science  ·  Universitat Oberta de Catalunya (UOC)  ·  EQF Level 7",
    "BEng in Computer Engineering  ·  University of Valladolid, Spain  ·  EQF Level 6",
    "BSc in Statistics  ·  University of Valladolid, Spain  ·  EQF Level 6",
  ],
  certifications: [
    "Azure AI Fundamentals (AI-900)  ·  Microsoft",
    "Introduction to Quantum Computing  ·  UNED",
  ],
  languages: "Spanish  ·  Native          English  ·  C1 / C2, professional working proficiency",
  community: [
    "Google Developer Group Valladolid  ·  Organizer & Speaker  ·  Feb 2023 – Present",
    "Young Programmers Club  ·  Python Instructor, ages 12–18, Informatics Olympiads preparation  ·  Oct 2022 – Present",
    "Google Developer Student Club  ·  Lead  ·  2021 – 2023",
  ],
};

const es = {
  file: "cv-es.pdf",
  htmlLang: "es",
  role: "Ingeniero de IA  |  IA Generativa, LLMs y Agentes Autónomos",
  location: "Valladolid, España",
  sections: {
    summary: "Perfil Profesional",
    experience: "Experiencia Profesional",
    skills: "Competencias",
    education: "Formación",
    certifications: "Certificaciones",
    languages: "Idiomas",
    community: "Comunidad y Voluntariado",
  },
  summary:
    "Ingeniero de IA con más de 4 años construyendo sistemas de IA generativa, LLM y agentes autónomos y llevándolos a producción, la mayor parte en el sector financiero del Grupo Santander. Trabajo en todo el ciclo de vida del ML, desde los pipelines de ETL hasta los microservicios desplegados en Google Cloud Platform (Vertex AI), Azure y AWS. Además lidero un equipo, impulso el developer relations interno y doy charlas con regularidad en conferencias y eventos de comunidad.",
  experience: [
    {
      title: "Ingeniero de IA Aplicada",
      period: "09/2023 – Actualidad",
      org: "Santander Consumer Finance Global Services – Grupo Santander · Valladolid, España",
      bullets: [
        "Lidero el diseño y la entrega de automatizaciones sobre microservicios, usadas en varias unidades de negocio.",
        "Construyo y despliego soluciones de IA generativa y LLM para servicios financieros, incluidos agentes autónomos que asumen flujos de trabajo intensivos en conocimiento.",
        "Diseño y presento demos y PoCs de IA generativa ante audiencias ejecutivas y técnicas para impulsar nuevas iniciativas.",
        "Impulso el developer relations interno: divulgo prácticas de IA generativa y hago demos en directo a ingeniería.",
        "Construyo pipelines de ETL y librerías internas de Python que otros equipos reutilizan en su propio trabajo de analítica y ML.",
        "Gestiono los recursos del equipo y mentorizo a analistas junior en el diseño de soluciones de IA.",
      ],
    },
    {
      title: "Investigador en IA",
      period: "02/2022 – 08/2023",
      org: "AIR Institute · Valladolid, España",
      bullets: [
        "Investigué e implementé soluciones de IA generativa y LLM, y contribuí a introducir arquitecturas transformer en proyectos de investigación aplicada en una fase temprana.",
        "Construí e interpreté modelos de ML para IA explicable (xAI), predicción de series temporales y mantenimiento predictivo.",
        "Implementé algoritmos de PLN para comprensión y clasificación de texto usando transformers y embeddings.",
      ],
    },
  ],
  skills: [
    ["Programación", "Python (avanzado), R, SQL, LaTeX"],
    ["IA Generativa y LLMs", "LLMs, Prompt Engineering, RAG, Fine-Tuning, Agentic AI, Agentes Autónomos, LangChain"],
    ["Machine Learning y Deep Learning", "TensorFlow, Keras, PyTorch, Scikit-learn, Series Temporales, IA Explicable (xAI)"],
    ["PLN", "Transformers, Embeddings, Clasificación de Texto, Reconocimiento de Entidades Nombradas (NER)"],
    ["Datos y MLOps", "Pipelines de ETL, Microservicios, APIs REST, Docker"],
    ["Cloud", "Google Cloud Platform (Vertex AI), Microsoft Azure AI, Azure Cognitive Services, AWS"],
    ["Liderazgo y Comunicación", "Liderazgo de Equipos, Developer Relations, Comunicación en Público, Mentoring"],
  ],
  education: [
    "Máster en Ciencia de Datos  ·  Universitat Oberta de Catalunya (UOC)  ·  Nivel EQF 7",
    "Grado en Ingeniería Informática  ·  Universidad de Valladolid, España  ·  Nivel EQF 6",
    "Grado en Estadística  ·  Universidad de Valladolid, España  ·  Nivel EQF 6",
  ],
  certifications: [
    "Azure AI Fundamentals (AI-900)  ·  Microsoft",
    "Introducción a la Computación Cuántica  ·  UNED",
  ],
  languages: "Español  ·  Nativo          Inglés  ·  C1 / C2, competencia profesional plena",
  community: [
    "Google Developer Group Valladolid  ·  Organizador y ponente  ·  Feb 2023 – Actualidad",
    "Club de Jóvenes Programadores  ·  Profesor de Python (12–18 años), Olimpiada de Informática  ·  Oct 2022 – Actualidad",
    "Google Developer Student Club  ·  Lead  ·  2021 – 2023",
  ],
};

const escape = (value) =>
  String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Measurements read straight off the original PDF's content stream: A4,
// 36pt margins, 20/11/9.5pt header, 10.6pt section headings over a rule,
// 10pt body on ~12.7pt leading.
//
// Sizes are in `pt`, which maps 1:1 to PDF points — `20pt` here is the
// original's 20pt name. (Beware when checking this with a PDF text
// extractor: the text matrix has to be composed with the page matrix, or
// every size reads 4/3 off and sends you chasing a unit bug that isn't
// there.)
//
// The Spanish copy is ~10% longer than the English and the original already
// filled the page, so a few bullets are deliberately tighter than a literal
// translation would be — that is what keeps this to one page, like the
// original. Adding a line anywhere means taking one out somewhere else.
export function render(cv) {
  const section = (title, body) =>
    `<h2>${escape(title)}</h2>${body}`;

  const job = (entry) => `
    <div class="job">
      <div class="job-head">
        <span class="job-title">${escape(entry.title)}</span>
        <span class="job-period">${escape(entry.period)}</span>
      </div>
      <p class="job-org">${escape(entry.org)}</p>
      <ul>${entry.bullets.map((b) => `<li>${escape(b)}</li>`).join("")}</ul>
    </div>`;

  return `<!doctype html>
<html lang="${cv.htmlLang}">
<head>
<meta charset="utf-8">
<title>${escape(shared.name)} — ${escape(cv.role)}</title>
<style>
  /* Page margins are set on page.pdf(), not here: with preferCSSPageSize a
     margin in @page is dropped, the text runs edge to edge, and the whole CV
     silently reflows against a 595pt column instead of the original's 523pt. */
  @page { size: A4; }

  :root {
    --navy: #1F3864;
    --gray: #3F3F3F;
  }

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    font-family: Calibri, Carlito, "Segoe UI", sans-serif;
    font-size: 10pt;
    line-height: 1.27;
    color: #000;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  h1 {
    font-size: 20pt;
    font-weight: 700;
    color: var(--navy);
    line-height: 1.1;
  }

  .role {
    font-size: 11pt;
    color: var(--gray);
    margin-top: 1pt;
  }

  .contact {
    font-size: 9.5pt;
    margin-top: 3pt;
  }

  /* The two contact lines run as one block in the original, no gap. */
  .contact + .contact { margin-top: 0; }

  .contact a { color: var(--navy); text-decoration: none; }

  .header { border-bottom: 0.75pt solid var(--navy); padding-bottom: 4pt; }

  h2 {
    font-size: 10.6pt;
    font-weight: 700;
    color: var(--navy);
    text-transform: uppercase;
    letter-spacing: 0.02em;
    border-bottom: 0.75pt solid var(--navy);
    padding-bottom: 1.5pt;
    margin-top: 7pt;
    margin-bottom: 5pt;
  }

  .summary { text-align: justify; }

  .job { margin-top: 7pt; }
  .job:first-of-type { margin-top: 0; }

  .job-head {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 12pt;
  }

  .job-title { font-size: 10.6pt; font-weight: 700; }
  .job-period { font-size: 9.5pt; color: var(--gray); white-space: nowrap; }
  .job-org { font-size: 9.5pt; font-style: italic; color: var(--navy); margin-top: 1pt; }

  ul { list-style: none; margin-top: 3pt; }

  li {
    position: relative;
    padding-left: 10pt;
    margin-bottom: 1.9pt;
    text-align: justify;
  }

  li::before {
    content: "•";
    position: absolute;
    left: 0;
    color: var(--navy);
  }

  .skill { margin-bottom: 2.5pt; }
  .skill b { color: var(--navy); }

  /* The original separates fields with doubled spaces ("MSc  ·  UOC") and
     splits the two languages with a wide gap. HTML would collapse both. */
  .line, .contact, .role { white-space: pre-wrap; }

  .line { margin-bottom: 1.5pt; }
</style>
</head>
<body>
  <header class="header">
    <h1>${escape(shared.name)}</h1>
    <p class="role">${escape(cv.role)}</p>
    <p class="contact">${escape(cv.location)}  |  ${escape(shared.phone)}  |  ${escape(shared.email)}</p>
    <!-- One line, no indentation: .contact is pre-wrap, so source whitespace
         would show up in the PDF. -->
    <p class="contact"><a href="https://${shared.linkedin}">${escape(shared.linkedin)}</a>  |  <a href="https://${shared.website}/">${escape(shared.website)}</a></p>
  </header>

  ${section(cv.sections.summary, `<p class="summary">${escape(cv.summary)}</p>`)}
  ${section(cv.sections.experience, cv.experience.map(job).join(""))}
  ${section(
    cv.sections.skills,
    cv.skills.map(([label, items]) => `<p class="skill"><b>${escape(label)}:</b> ${escape(items)}</p>`).join("")
  )}
  ${section(cv.sections.education, cv.education.map((l) => `<p class="line">${escape(l)}</p>`).join(""))}
  ${section(
    cv.sections.certifications,
    cv.certifications.map((l) => `<p class="line">${escape(l)}</p>`).join("")
  )}
  ${section(cv.sections.languages, `<p class="line">${escape(cv.languages)}</p>`)}
  ${section(cv.sections.community, cv.community.map((l) => `<p class="line">${escape(l)}</p>`).join(""))}
</body>
</html>`;
}

export const cvs = { en, es };

// Only print when run directly, so the template can be imported (to preview
// it as an image, say) without launching a browser.
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const arg = (process.argv[2] ?? "es").toLowerCase();
  const targets = arg === "all" ? [en, es] : arg === "en" ? [en] : [es];

  const browser = await chromium.launch();
  const page = await browser.newPage();

  for (const cv of targets) {
    const out = path.join(root, "public", cv.file);
    await page.setContent(render(cv), { waitUntil: "load" });
    // 0.5in = the original's 36pt margins, leaving a 523pt text column.
    await page.pdf({
      path: out,
      format: "A4",
      printBackground: true,
      margin: { top: "0.5in", right: "0.5in", bottom: "0.5in", left: "0.5in" },
    });
    const kb = Math.round(fs.statSync(out).size / 1024);
    console.log(`Wrote public/${cv.file} (${kb} kB)`);
  }

  await browser.close();
}
