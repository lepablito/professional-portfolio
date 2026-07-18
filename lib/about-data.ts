// Biographical data, separated from presentation the same way projects and
// posts live in content/. The home hero derives "currently" from here so a
// job change is a one-file edit.

export const currentPosition = "AI Team @ Grupo Santander";

export const experience = [
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
] as const;

export const community = [
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
] as const;

export const skills = [
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
] as const;

export interface Fact {
  primary: string;
  secondary: string;
}

export const education: Fact[] = [
  { primary: "MSc in Data Science", secondary: "Universitat Oberta de Catalunya (UOC)" },
  { primary: "BEng in Computer Engineering", secondary: "Universidad de Valladolid" },
  { primary: "BSc in Statistics", secondary: "Universidad de Valladolid" },
];

export const certifications: Fact[] = [
  { primary: "Azure AI Fundamentals (AI-900)", secondary: "Microsoft" },
  { primary: "Introduction to Quantum Computing", secondary: "UNED" },
];

export const languages: Fact[] = [
  { primary: "Spanish", secondary: "Native" },
  { primary: "English", secondary: "C1/C2 · Full professional proficiency" },
];
