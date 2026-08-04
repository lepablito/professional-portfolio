// Every user-visible string on the site, in both languages. Long-form page
// copy lives here too (not inlined in the .astro files) so a translation is
// always a one-file edit and the two languages sit side by side for review.
//
// `es` is annotated with the shape of `en` on purpose: forget a key, or let
// the two drift, and `astro check` fails before the page renders. A Vitest
// case (src/lib/portfolio.test.ts) additionally rejects empty strings.
//
// Proper nouns (Python, RAG, LangChain, GDG) are deliberately not translated.
import type { Lang } from "./i18n";

const en = {
  meta: {
    role: "Applied AI Engineer",
    description:
      "AI Engineer with 4+ years taking Generative AI and LLM systems from prototype to production, focused on autonomous agents, RAG and cloud microservice architectures.",
  },

  a11y: {
    skipToContent: "Skip to content",
    newTab: " (opens in new tab)",
    themeToggle: "Dark theme",
    languageNav: "Language",
    mainNav: "Main",
    tags: "Tags",
    techStack: "Tech stack",
    bio: "Bio",
    portraitAlt: "Portrait of Pablo Marcos Parra",
  },

  nav: {
    projects: "Projects",
    blog: "Blog",
    about: "About",
  },

  common: {
    location: "Valladolid, Spain",
    locationShort: "Valladolid, ES · 41.65° N, 4.72° W",
    downloadCv: "Download CV (PDF)",
    cvShort: "CV (PDF)",
    email: "Email",
    emailMe: "Email me",
    demo: "Demo",
    code: "Code",
    liveDemo: "Live demo",
    sourceCode: "Source code",
    minRead: "min read",
    exampleBadge: "Example content",
    exampleNoteLead: "Example content.",
    /** Marks an entry shown in its English original inside a Spanish listing. */
    englishOnly: "Only available in English",
  },

  home: {
    // Split in three because the marker underline sits on a different word in
    // each language; `heroAfter` may be empty.
    heroBefore: "Applied AI Engineer building",
    heroMarked: "production-grade",
    heroAfter: "LLM systems",
    focus: "Focus",
    focusValue: "autonomous agents · RAG · fine-tuning",
    currently: "Currently",
    location: "Location",
    profileHeading: "Profile",
    profileMore: "More about me →",
    profileBody:
      "Pablo is an AI Engineer specialized in LLMs, autonomous agents and RAG systems, with experience building AI solutions end to end — from data pipelines to microservices deployed in production. He has spent most of his career in the financial sector (Grupo Santander), where he learned to build robust, scalable and secure systems. Outside of work he is an active tech community organizer and speaker (Google Developer Group Valladolid).",
    workHeading: "Selected work",
    workMore: "All projects →",
    contactHeading: "Contact",
    contactTitle: "Let's build something that ships.",
    contactLede:
      "The fastest way to reach me is email or LinkedIn. For the full picture, the CV has the details.",
  },

  projects: {
    title: "Projects",
    description:
      "Case studies of AI systems taken to production: the problem, the architecture, the trade-offs, the metrics and the lessons.",
    h1: "Case studies, not screenshots.",
    lede: "Every project here follows the same structure: problem → architecture → decisions & trade-offs → metrics → lessons learned. The parts that matter when a system has to survive production.",
    listLabel: "All projects",
    empty: "New case studies are on the way — check back soon.",
    back: "← All projects",
    eyebrow: "Case study",
    relatedPost: "Related blog post →",
    exampleNote:
      "This case study is placeholder material that shows the layout — it does not describe a real project yet.",
  },

  blog: {
    title: "Blog",
    description:
      "Technical notes on building LLM systems: agents, RAG, evaluation and the road from prototype to production.",
    h1: "Notes from production.",
    lede: "Write-ups on LLM systems, agents and the unglamorous work that makes them reliable.",
    listLabel: "All posts",
    empty: "The first post is in the works — check back soon.",
    back: "← Blog",
    eyebrow: "Blog",
    relatedProject: "Related case study →",
    exampleNote:
      "This post is placeholder material that shows the layout — it will be replaced by a real write-up.",
  },

  about: {
    title: "About",
    description:
      "AI Engineer with 4+ years building production-ready AI systems — GenAI, LLMs and autonomous agents on GCP, Azure and AWS. Community organizer at GDG Valladolid.",
    eyebrow: "About",
    h1: "Prototype fast, ship for real.",
    p1: "I'm an AI engineer with 4+ years building production-ready AI systems. My current focus is Generative AI — LLMs and autonomous agents — taken from prototype all the way to production. Most of my recent work runs on Google Cloud (Vertex AI), with hands-on experience across Azure and AWS as well.",
    p2: 'I\'ve built machine-learning systems end to end: from designing the data pipelines and ETLs that feed them to the cloud microservice architectures they run on. Much of that happened inside Grupo Santander, where "production" means robust, scalable and secure by default.',
    p3: "Underneath it all is a foundation in computer science, statistics and data science — paired with a genuine passion for developer relations: conference talks, community initiatives and live public demos. Teaching something is still my favorite way to learn it.",
    experienceHeading: "Experience",
    communityHeading: "Community",
    communityTitle: "Half of engineering is explaining it well.",
    skillsHeading: "Skills",
    backgroundHeading: "Background",
    educationHeading: "Education",
    certificationsHeading: "Certifications",
    languagesHeading: "Languages",
  },

  skills: {
    genai: "Generative AI & LLMs",
    ml: "ML & Deep Learning",
    nlp: "NLP",
    data: "Data & MLOps",
    cloud: "Cloud",
    programming: "Programming",
  },

  notFound: {
    title: "Not found",
    eyebrow: "Not found",
    h1: "This page doesn't exist.",
    lede: "The link may be old, or the page may have moved.",
    home: "Back to home",
    projects: "Browse projects",
  },
};

type Strings = typeof en;

/** Keys of the skill-group labels — the group name is the only translated
 * part of a skills block (the items are proper nouns). */
export type SkillKey = keyof Strings["skills"];

const es: Strings = {
  meta: {
    role: "Ingeniero de IA aplicada",
    description:
      "Ingeniero de IA con más de 4 años llevando sistemas de IA generativa y LLM del prototipo a producción, centrado en agentes autónomos, RAG y arquitecturas de microservicios en la nube.",
  },

  a11y: {
    skipToContent: "Saltar al contenido",
    newTab: " (se abre en una pestaña nueva)",
    themeToggle: "Tema oscuro",
    languageNav: "Idioma",
    mainNav: "Principal",
    tags: "Etiquetas",
    techStack: "Stack técnico",
    bio: "Biografía",
    portraitAlt: "Retrato de Pablo Marcos Parra",
  },

  nav: {
    projects: "Proyectos",
    blog: "Blog",
    about: "Sobre mí",
  },

  common: {
    location: "Valladolid, España",
    locationShort: "Valladolid, ES · 41,65° N, 4,72° O",
    downloadCv: "Descargar CV (PDF)",
    cvShort: "CV (PDF)",
    email: "Email",
    emailMe: "Escríbeme",
    demo: "Demo",
    code: "Código",
    liveDemo: "Demo en vivo",
    sourceCode: "Código fuente",
    minRead: "min de lectura",
    exampleBadge: "Contenido de ejemplo",
    exampleNoteLead: "Contenido de ejemplo.",
    englishOnly: "Solo disponible en inglés",
  },

  home: {
    heroBefore: "Ingeniero de IA que construye sistemas LLM",
    heroMarked: "listos para producción",
    heroAfter: "",
    focus: "Enfoque",
    focusValue: "agentes autónomos · RAG · fine-tuning",
    currently: "Actualmente",
    location: "Ubicación",
    profileHeading: "Perfil",
    profileMore: "Más sobre mí →",
    profileBody:
      "Pablo es ingeniero de IA especializado en LLMs, agentes autónomos y sistemas RAG, con experiencia construyendo soluciones de IA de principio a fin: desde los pipelines de datos hasta los microservicios desplegados en producción. Ha pasado la mayor parte de su carrera en el sector financiero (Grupo Santander), donde aprendió a construir sistemas robustos, escalables y seguros. Fuera del trabajo organiza y da charlas en la comunidad técnica (Google Developer Group Valladolid).",
    workHeading: "Trabajo seleccionado",
    workMore: "Todos los proyectos →",
    contactHeading: "Contacto",
    contactTitle: "Construyamos algo que llegue a producción.",
    contactLede:
      "La vía más rápida para localizarme es el email o LinkedIn. Para el detalle completo, está el CV.",
  },

  projects: {
    title: "Proyectos",
    description:
      "Casos de estudio de sistemas de IA llevados a producción: el problema, la arquitectura, los compromisos, las métricas y las lecciones.",
    h1: "Casos de estudio, no capturas de pantalla.",
    lede: "Todos los proyectos siguen la misma estructura: problema → arquitectura → decisiones y compromisos → métricas → lecciones aprendidas. Lo que de verdad importa cuando un sistema tiene que sobrevivir en producción.",
    listLabel: "Todos los proyectos",
    empty: "Hay nuevos casos de estudio en camino: vuelve pronto.",
    back: "← Todos los proyectos",
    eyebrow: "Caso de estudio",
    relatedPost: "Artículo relacionado →",
    exampleNote:
      "Este caso de estudio es material de relleno que muestra la maquetación; todavía no describe un proyecto real.",
  },

  blog: {
    title: "Blog",
    description:
      "Notas técnicas sobre construir sistemas LLM: agentes, RAG, evaluación y el camino del prototipo a producción.",
    h1: "Notas desde producción.",
    lede: "Artículos sobre sistemas LLM, agentes y el trabajo poco lucido que los hace fiables.",
    listLabel: "Todos los artículos",
    empty: "El primer artículo está en camino: vuelve pronto.",
    back: "← Blog",
    eyebrow: "Blog",
    relatedProject: "Caso de estudio relacionado →",
    exampleNote:
      "Este artículo es material de relleno que muestra la maquetación; se sustituirá por un texto real.",
  },

  about: {
    title: "Sobre mí",
    description:
      "Ingeniero de IA con más de 4 años construyendo sistemas de IA listos para producción: IA generativa, LLMs y agentes autónomos en GCP, Azure y AWS. Organizador de GDG Valladolid.",
    eyebrow: "Sobre mí",
    h1: "Prototipa rápido, entrega de verdad.",
    p1: "Soy ingeniero de IA y llevo más de 4 años construyendo sistemas de IA listos para producción. Ahora mismo me centro en la IA generativa —LLMs y agentes autónomos— llevada del prototipo hasta producción. La mayor parte de mi trabajo reciente corre sobre Google Cloud (Vertex AI), con experiencia práctica también en Azure y AWS.",
    p2: 'He construido sistemas de machine learning de principio a fin: desde el diseño de los pipelines de datos y los ETL que los alimentan hasta las arquitecturas de microservicios en la nube sobre las que se ejecutan. Buena parte de eso ocurrió dentro del Grupo Santander, donde "producción" significa robusto, escalable y seguro por defecto.',
    p3: "Debajo de todo hay una base de ingeniería informática, estadística y ciencia de datos, junto con una pasión sincera por el developer relations: charlas en conferencias, iniciativas de comunidad y demos en directo. Enseñar algo sigue siendo mi forma favorita de aprenderlo.",
    experienceHeading: "Experiencia",
    communityHeading: "Comunidad",
    communityTitle: "La mitad de la ingeniería es saber explicarla.",
    skillsHeading: "Competencias",
    backgroundHeading: "Formación",
    educationHeading: "Educación",
    certificationsHeading: "Certificaciones",
    languagesHeading: "Idiomas",
  },

  skills: {
    genai: "IA generativa y LLMs",
    ml: "ML y deep learning",
    nlp: "NLP",
    data: "Datos y MLOps",
    cloud: "Cloud",
    programming: "Programación",
  },

  notFound: {
    title: "Página no encontrada",
    eyebrow: "No encontrada",
    h1: "Esta página no existe.",
    lede: "Puede que el enlace esté anticuado o que la página se haya movido.",
    home: "Volver al inicio",
    projects: "Ver proyectos",
  },
};

export const strings: Record<Lang, Strings> = { en, es };

/** All copy for one language: `const s = t(lang); s.nav.blog`. */
export function t(lang: Lang): Strings {
  return strings[lang];
}
