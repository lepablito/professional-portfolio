---
title: "Certification exam simulator with an original question bank"
summary: "Certification prep is a choice between ten official sample questions and leaked exam dumps — this generates an original, domain-weighted bank from the official guides and drills it with spaced repetition."
stack: ["Python", "FastAPI", "SQLite", "Pydantic", "React 19", "TypeScript", "Vite", "Gemini API", "Anthropic API", "Ollama"]
date: "2026-07-09"
featured: true
order: 2
---

## Problem

Preparing for five cloud and AI certifications at once — GCP Generative AI
Leader, Claude Certified Architect, AWS Cloud Practitioner (CLF-C02), AWS AI
Practitioner (AIF-C01) and GCP Associate Cloud Engineer — runs into the same wall
five times. Vendors publish an exam guide with domains and their weights, and
maybe ten sample questions. Everything else on offer is a dump site recycling
questions that are under NDA, wrong as often as not, and useless for
understanding *why* an answer is right.

What is actually missing is not more questions. It is a bank that follows the
official blueprint domain by domain, and a way to find out which domain is
weakest before the exam does it for you.

So: generate an original bank grounded in the official syllabus, weight it the
way the real exam is weighted, and drill it under exam conditions with spaced
repetition on everything failed.

## Architecture

The hard split in this system is **offline generation versus runtime serving**.
Nothing calls an LLM while a mock exam is running: the bank is a build artifact,
produced by a pipeline that can be re-run to extend it, and the app that serves
it is a plain local web app with no network dependency at all.

<figure class="diagram" tabindex="0">
<svg viewBox="0 0 640 428" role="img" aria-labelledby="d2-title d2-desc" preserveAspectRatio="xMidYMid meet">
  <title id="d2-title">Offline generation pipeline and local runtime of the exam simulator</title>
  <desc id="d2-desc">Offline, the official exam guides, public sample questions and domain weights feed a generation step running on Gemini, Claude or a local Qwen3 model; its output is reviewed by a local LLM judge and translated to English. At runtime the resulting SQLite bank is served by FastAPI to a React single-page app offering practice, timed exams and spaced repetition, with no network calls.</desc>
  <defs>
    <marker id="arw-cert" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0 0 L8 4 L0 8 z" class="d-head" />
    </marker>
  </defs>

  <rect x="8" y="8" width="624" height="244" class="d-band" />
  <text x="20" y="28" class="d-band-label">A · OFFLINE — GENERATED ONCE</text>
  <rect x="24" y="44" width="184" height="44" class="d-box" />
  <text x="116" y="65" class="d-label" text-anchor="middle">EXAM GUIDES</text>
  <text x="116" y="80" class="d-sub" text-anchor="middle">5 official syllabi</text>
  <rect x="228" y="44" width="184" height="44" class="d-box" />
  <text x="320" y="65" class="d-label" text-anchor="middle">STYLE SAMPLES</text>
  <text x="320" y="80" class="d-sub" text-anchor="middle">public sample Q&amp;A</text>
  <rect x="432" y="44" width="184" height="44" class="d-box" />
  <text x="524" y="65" class="d-label" text-anchor="middle">DOMAIN WEIGHTS</text>
  <text x="524" y="80" class="d-sub" text-anchor="middle">23 domains</text>
  <path d="M116 88 V 104" class="d-flow" marker-end="url(#arw-cert)" />
  <path d="M320 88 V 104" class="d-flow" marker-end="url(#arw-cert)" />
  <path d="M524 88 V 104" class="d-flow" marker-end="url(#arw-cert)" />

  <rect x="24" y="104" width="592" height="48" class="d-box" />
  <text x="320" y="126" class="d-label" text-anchor="middle">GENERATION · GEMINI · CLAUDE · QWEN3 VIA OLLAMA</text>
  <text x="320" y="142" class="d-sub" text-anchor="middle">proportional per-domain split · pydantic validation · hash dedup · resumable</text>
  <path d="M320 152 V 164 H 152 V 176" class="d-flow" marker-end="url(#arw-cert)" />
  <path d="M320 152 V 164 H 488 V 176" class="d-flow" marker-end="url(#arw-cert)" />

  <rect x="24" y="176" width="256" height="48" class="d-box" />
  <text x="152" y="197" class="d-label" text-anchor="middle">LLM JUDGE · GPT-OSS:20B</text>
  <text x="152" y="213" class="d-sub" text-anchor="middle">983 ok · 19 minor · 50 flagged</text>
  <rect x="360" y="176" width="256" height="48" class="d-box" />
  <text x="488" y="197" class="d-label" text-anchor="middle">TRANSLATION · QWEN3:30B</text>
  <text x="488" y="213" class="d-sub" text-anchor="middle">1,012 questions → EN</text>

  <path d="M152 224 V 236 H 488 V 224" class="d-flow" />
  <path d="M320 236 V 268 H 16 V 344 H 22" class="d-flow d-dashed" marker-end="url(#arw-cert)" />
  <text x="332" y="272" class="d-sub">bank frozen at build time</text>

  <rect x="8" y="284" width="624" height="132" class="d-band" />
  <text x="20" y="304" class="d-band-label">B · RUNTIME — LOCALHOST, SINGLE USER</text>
  <rect x="24" y="320" width="184" height="48" class="d-box" />
  <text x="116" y="341" class="d-label" text-anchor="middle">SQLITE</text>
  <text x="116" y="357" class="d-sub" text-anchor="middle">1,062 questions</text>
  <path d="M208 344 H 236" class="d-flow" marker-end="url(#arw-cert)" />
  <rect x="240" y="320" width="184" height="48" class="d-box" />
  <text x="332" y="341" class="d-label" text-anchor="middle">FASTAPI</text>
  <text x="332" y="357" class="d-sub" text-anchor="middle">stdlib sqlite3 · no ORM</text>
  <path d="M424 344 H 452" class="d-flow" marker-end="url(#arw-cert)" />
  <rect x="456" y="320" width="160" height="48" class="d-box" />
  <text x="536" y="341" class="d-label" text-anchor="middle">REACT 19 SPA</text>
  <text x="536" y="357" class="d-sub" text-anchor="middle">practice · exam · SM-2</text>
  <text x="320" y="394" class="d-sub" text-anchor="middle">routers: certifications · questions · practice · exams · progress · review</text>
</svg>
<figcaption>fig. 1 — Generation is a pipeline, not a feature. Runtime never calls an LLM.</figcaption>
</figure>

**Generation** reads the official syllabus for a certification, splits a target
question count across its domains in proportion to the official weights, and
injects the syllabus plus one or two public sample questions as grounding for
style — never as content to reproduce. Output is parsed into Pydantic models and
deduplicated by content hash, so re-running the script extends the bank instead
of duplicating it. The provider is switchable: Gemini, Anthropic, or a local
Qwen3 through Ollama.

**Quality control** is a second, independent pass. A local judge model answers
each question *without seeing the marked answer*, compares its own choice against
the stored key, and flags factual errors, ambiguity and undeclared multi-answer
questions. It never edits or deletes — it writes a verdict, and flagged questions
are deactivated rather than removed, so the audit trail survives.

**Serving** is deliberately boring: FastAPI over the standard library's `sqlite3`
with no ORM, six routers, and a React 19 SPA covering the dashboard, practice
mode (immediate feedback, per-option explanations), timed exam mode (proportional
domain sampling, no feedback until the end, result against the real pass
threshold) and an SM-2 review queue. In "local production" mode the same server
also serves the built frontend.

## Decisions & trade-offs

- **Questions are generated offline and never at runtime.** Question load is
  instant, a mock exam costs nothing in tokens or latency, and the app works with
  the network unplugged. **Trade-off:** the bank is a build artifact — growing it
  or fixing a bad domain means re-running a pipeline, not clicking a button.
- **Original questions only; official material is grounding, never content.**
  Exam guides supply the syllabus and public samples supply the register, and
  neither is ever reproduced or shown. **Trade-off:** considerably more prompt
  engineering and validation than scraping a dump would have taken, in exchange
  for a bank that is legally and ethically clean.
- **A second LLM audits the first one.** Generation and validation use different
  models, and the judge answers independently before it ever sees the key, which
  is what makes disagreement informative. **Trade-off:** an extra pipeline stage
  over the whole bank — it deactivated 50 questions (4.7%) that would otherwise
  have taught me something wrong.
- **Raw `sqlite3`, no ORM, no auth.** One user, one machine, one file. **Trade-off:**
  hand-written SQL and no migration tooling — acceptable at this size, and it
  would be the first thing to go if this ever became multi-user.
- **The Gemini free tier is treated as a design constraint, not an obstacle.**
  Request throttling, exponential backoff honouring the API's `retryDelay`,
  resumable runs and hash dedup were all built because the daily quota runs out
  mid-generation. **Trade-off:** none worth mentioning — the constraint produced
  a pipeline that is idempotent and interruptible, which is what it should have
  been anyway.

## Metrics

These are properties of the system as it stands, measured against the live
database. There is no before/after here: the honest number for study outcomes is
that there isn't one yet — `exam_attempts` is empty, so nothing in this table
claims the tool improves exam results.

| Metric | Value |
| ------ | ----- |
| Questions in the bank | 1,062 across 5 certifications and 23 domains |
| Per certification | 204 – 229 questions |
| Active after review | 1,012 · 50 deactivated by the judge |
| Judge verdicts | 983 ok · 19 minor · 50 flagged (`gpt-oss:20b`) |
| Generation models used | claude-sonnet-5 (378) · qwen3:30b (274) · claude-opus-4-8 (204) · gemini-2.5-flash (196) |
| Question types | 863 single-answer · 199 multi-answer |
| Difficulty mix | 691 medium · 230 hard · 141 easy |
| English translations | 1,012 (`qwen3:30b-a3b`), Spanish originals untouched |
| Runtime LLM calls | 0 |
| Recorded exam attempts | 0 — no outcome data yet |

## Lessons learned

**Grounding beat model size.** The questions that read most like the real exam
came from feeding the model the actual syllabus section and one sample for
register, not from reaching for a bigger model. A local Qwen3 with good grounding
produced 274 usable questions; the expensive models were not proportionally
better.

**The judge earned its keep, and it is the part I trust least.** Fifty flagged
questions is a 4.7% error rate that would have gone straight into my study time —
worth every token. But a single local judge is one opinion: the TFM I built
around [LLM-as-a-judge validation](/projects/llm-energy-benchmark/) needed three
independent validation layers before its scores meant anything, and this pipeline
has none of them. The verdicts are useful as a filter, not as ground truth.

**Rate limits produced a better pipeline than a generous quota would have.**
Being forced to make generation resumable, idempotent and deduplicated turned it
into something I can re-run against any certification at any time. A pipeline
that assumes it will be interrupted is simply a better pipeline.

**Nothing here proves it works.** The bank is built, reviewed, translated and
served — and the review queue is empty because I have not sat a full mock yet.
Writing "0 recorded attempts" into a case study is less satisfying than a
made-up score improvement, and it is the only version of this section that is
true.

## Links

- No public repository: this is a single-user tool that runs on `localhost`, and
  parts of the seed material (exam guides, official samples) are not mine to
  redistribute.
- Related: [Measuring what prompting techniques actually burn](/projects/llm-energy-benchmark/) — the LLM-as-a-judge methodology this pipeline borrows from.
