// Biographical data, separated from presentation the same way projects and
// posts live in content/. The home hero derives "currently" from here so a
// job change is a one-file edit.
//
// Prose differs per language, so experience/community/background are stored
// once per locale. Skills are the exception: the items are proper nouns
// (Python, LangChain, RAG) and only the group label is translated — it comes
// from src/lib/strings.ts, keyed by `key`.
import type { Lang } from "./i18n";
import type { SkillKey } from "./strings";

export interface Fact {
  primary: string;
  secondary: string;
}

interface Entry {
  role: string;
  org: string;
  period: string;
  description: string;
}

interface CommunityEntry {
  role: string;
  detail: string;
  period: string;
  description: string;
}

interface AboutData {
  currentPosition: string;
  experience: readonly Entry[];
  community: readonly CommunityEntry[];
  education: readonly Fact[];
  certifications: readonly Fact[];
  languages: readonly Fact[];
}

export const skillGroups: readonly { key: SkillKey; items: readonly string[] }[] = [
  {
    key: "genai",
    items: ["LLMs", "Prompt Engineering", "RAG", "Fine-Tuning", "Agentic AI", "Autonomous Agents", "LangChain"],
  },
  {
    key: "ml",
    items: ["TensorFlow", "Keras", "PyTorch", "Scikit-learn", "Time Series", "Predictive Maintenance", "Explainable AI"],
  },
  {
    key: "nlp",
    items: ["Transformers", "Embeddings", "Text Classification", "NER"],
  },
  {
    key: "data",
    items: ["ETL Pipelines", "Microservices", "REST APIs", "Docker"],
  },
  {
    key: "cloud",
    items: ["GCP (Vertex AI)", "Azure AI", "AWS"],
  },
  {
    key: "programming",
    items: ["Python", "R", "SQL"],
  },
];

const en: AboutData = {
  currentPosition: "AI Team @ Santander Consumer Finance GS (Santander Group)",

  experience: [
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
  ],

  community: [
    {
      role: "Google Developer Group Valladolid",
      detail: "Organizer & speaker",
      period: "Feb 2023 – Present",
      description:
        "Running the local Google developer community: organizing meetups and giving talks on applied AI.",
    },
    {
      role: "Young Programmers Club",
      detail: "Python instructor",
      period: "Oct 2022 – Present",
      description:
        "Teaching Python to students aged 12–18 and preparing them for the Informatics Olympiad.",
    },
    {
      role: "Google Developer Student Club",
      detail: "Lead",
      period: "2021 – 2023",
      description:
        "Led the university chapter, coordinating events and workshops for student developers.",
    },
  ],

  education: [
    { primary: "MSc in Data Science", secondary: "Universitat Oberta de Catalunya (UOC)" },
    { primary: "BEng in Computer Engineering", secondary: "Universidad de Valladolid" },
    { primary: "BSc in Statistics", secondary: "Universidad de Valladolid" },
  ],

  certifications: [
    { primary: "Azure AI Fundamentals (AI-900)", secondary: "Microsoft" },
    { primary: "Introduction to Quantum Computing", secondary: "UNED" },
  ],

  languages: [
    { primary: "Spanish", secondary: "Native" },
    { primary: "English", secondary: "C1/C2 · Full professional proficiency" },
  ],
};

const es: AboutData = {
  currentPosition: "Equipo de IA @ Santander Consumer Finance GS (Grupo Santander)",

  experience: [
    {
      role: "Analyst II · Equipo de IA",
      org: "Santander Consumer Finance Global Services (Grupo Santander)",
      period: "Oct 2025 – Actualidad",
      description:
        "Lidero el diseño de extremo a extremo de soluciones de automatización sobre una arquitectura de microservicios. Diseño demos y PoCs de IA generativa de alto impacto para audiencias ejecutivas y técnicas, impulso iniciativas internas de DevRel, gestiono los recursos del equipo y mentorizo a analistas junior.",
    },
    {
      role: "Analyst I · Equipo de IA y Analista de Datos Junior",
      org: "Santander Consumer Finance Global Services (Grupo Santander)",
      period: "Sep 2023 – Sep 2025",
      description:
        "Desarrollé y desplegué soluciones de IA generativa y LLM para casos de uso financieros, incluidos agentes autónomos que automatizan flujos de trabajo intensivos en conocimiento. Construí pipelines de datos y ETLs, y desarrollé librerías internas en Python.",
    },
    {
      role: "Investigador en IA",
      org: "AIR Institute",
      period: "Feb 2022 – Ago 2023",
      description:
        "Investigación e implementación de soluciones de IA generativa y LLM; modelos de IA explicable, predicción de series temporales y mantenimiento predictivo; algoritmos de PLN para comprensión y clasificación de texto.",
    },
  ],

  community: [
    {
      role: "Google Developer Group Valladolid",
      detail: "Organizador y ponente",
      period: "Feb 2023 – Actualidad",
      description:
        "Dirijo la comunidad local de desarrolladores de Google: organizo meetups y doy charlas sobre IA aplicada.",
    },
    {
      role: "Club de Jóvenes Programadores",
      detail: "Profesor de Python",
      period: "Oct 2022 – Actualidad",
      description:
        "Enseño Python a estudiantes de 12 a 18 años y los preparo para la Olimpiada de Informática.",
    },
    {
      role: "Google Developer Student Club",
      detail: "Responsable",
      period: "2021 – 2023",
      description:
        "Lideré el capítulo universitario, coordinando eventos y talleres para estudiantes desarrolladores.",
    },
  ],

  education: [
    { primary: "Máster en Ciencia de Datos", secondary: "Universitat Oberta de Catalunya (UOC)" },
    { primary: "Grado en Ingeniería Informática", secondary: "Universidad de Valladolid" },
    { primary: "Grado en Estadística", secondary: "Universidad de Valladolid" },
  ],

  certifications: [
    { primary: "Azure AI Fundamentals (AI-900)", secondary: "Microsoft" },
    { primary: "Introducción a la Computación Cuántica", secondary: "UNED" },
  ],

  languages: [
    { primary: "Español", secondary: "Nativo" },
    { primary: "Inglés", secondary: "C1/C2 · Competencia profesional plena" },
  ],
};

export const aboutData: Record<Lang, AboutData> = { en, es };
