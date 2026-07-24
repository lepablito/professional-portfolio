---
title: "Measuring what prompting techniques actually burn"
summary: "Prompt engineering optimizes for answer quality and ignores the energy bill — a multi-agent harness measured 2,700 LLM inferences to put a number on the trade-off."
stack: ["Python", "LangGraph", "Anthropic API", "Ollama", "CodeCarbon", "EcoLogits", "SQLite", "statsmodels"]
date: "2026-06-14"
repo: "https://github.com/lepablito/TFM_UOC_PabloMarcosParra"
featured: true
order: 1
---

## Problem

Every prompt engineering guide optimizes the same variable: answer quality. Add
examples, ask the model to think step by step, give it more context. What none of
them report is the other side of the ledger — chain-of-thought does not just
produce longer answers, it produces longer *inference*, and inference is where
LLMs spend most of their energy at scale.

The question this project set out to answer is narrow enough to be measurable:
**how much extra energy does a prompting technique cost, and does the quality it
buys justify it?** Answering it honestly means measuring both sides on the same
runs — energy and quality — across models that behave nothing alike, from a 3B
model on a local GPU to a frontier API endpoint whose internals are invisible.

This was my MSc thesis in Data Science at the Universitat Oberta de Catalunya
(tutor: Josep-Anton Mir Tutusaus), defended in June 2026.

## Architecture

The system is a multi-agent harness orchestrated with LangGraph, split into three
phases. The split is the whole design: LLM non-determinism is confined to a
pre-processing phase that runs **once** and writes its output to disk, so the
experiment loop replays identical prompts across every repetition.

<figure class="diagram" tabindex="0">
<svg viewBox="0 0 640 552" role="img" aria-labelledby="d1-title d1-desc" preserveAspectRatio="xMidYMid meet">
  <title id="d1-title">Three-phase architecture of the energy measurement harness</title>
  <desc id="d1-desc">Pre-processing generates prompts and rubrics once with Claude Haiku and stores them as artifacts. The LangGraph experiment phase dispatches each cell to remote APIs in parallel and to local models sequentially, meters both with EcoLogits and CodeCarbon, and scores every answer with a blind rubric judge — Claude Haiku, with 13.3% of the runs re-scored by Claude Sonnet to validate it — into SQLite. Post-processing runs mixed ANOVA and Wilcoxon tests over the 2,700 stored runs to produce figures and a KPI report.</desc>
  <defs>
    <marker id="arw-tfm" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0 0 L8 4 L0 8 z" class="d-head" />
    </marker>
  </defs>

  <rect x="8" y="8" width="624" height="120" class="d-band" />
  <text x="20" y="28" class="d-band-label">A · PRE-PROCESSING — RUNS ONCE</text>
  <rect x="24" y="44" width="188" height="30" class="d-box" />
  <text x="118" y="63" class="d-label" text-anchor="middle">ROUTER · HAIKU 4.5</text>
  <rect x="24" y="84" width="188" height="30" class="d-box" />
  <text x="118" y="103" class="d-label" text-anchor="middle">RUBRICS · HAIKU 4.5</text>
  <path d="M212 59 H 252" class="d-flow" marker-end="url(#arw-tfm)" />
  <path d="M212 99 H 252" class="d-flow" marker-end="url(#arw-tfm)" />
  <rect x="256" y="44" width="200" height="70" class="d-box" />
  <text x="356" y="68" class="d-label" text-anchor="middle">ARTIFACTS/</text>
  <text x="356" y="85" class="d-sub" text-anchor="middle">12 prompt variants ×</text>
  <text x="356" y="100" class="d-sub" text-anchor="middle">15 instances + rubrics</text>
  <text x="472" y="75" class="d-sub">frozen on disk —</text>
  <text x="472" y="90" class="d-sub">runtime is a lookup</text>

  <path d="M356 114 V 144" class="d-flow d-dashed" marker-end="url(#arw-tfm)" />

  <rect x="8" y="152" width="624" height="256" class="d-band" />
  <text x="20" y="172" class="d-band-label">B · EXPERIMENT — LANGGRAPH</text>
  <rect x="236" y="188" width="168" height="30" class="d-box" />
  <text x="320" y="207" class="d-label" text-anchor="middle">DISPATCHER</text>
  <path d="M320 218 V 230 H 152 V 240" class="d-flow" marker-end="url(#arw-tfm)" />
  <path d="M320 218 V 230 H 488 V 240" class="d-flow" marker-end="url(#arw-tfm)" />
  <rect x="24" y="240" width="256" height="48" class="d-box" />
  <text x="152" y="260" class="d-label" text-anchor="middle">API FAN-OUT · PARALLEL</text>
  <text x="152" y="277" class="d-sub" text-anchor="middle">gemini-2.5-flash · gpt-5-mini</text>
  <rect x="360" y="240" width="256" height="48" class="d-box" />
  <text x="488" y="260" class="d-label" text-anchor="middle">LOCAL QUEUE · SEQUENTIAL</text>
  <text x="488" y="277" class="d-sub" text-anchor="middle">llama-3.2-3b · mistral-7b · qwen-2.5-14b</text>
  <path d="M152 288 V 300" class="d-flow" marker-end="url(#arw-tfm)" />
  <path d="M488 288 V 300" class="d-flow" marker-end="url(#arw-tfm)" />
  <rect x="24" y="300" width="592" height="30" class="d-box" />
  <text x="320" y="319" class="d-label" text-anchor="middle">TELEMETRY · ECOLOGITS (API) + CODECARBON (LOCAL)</text>
  <path d="M320 330 V 344" class="d-flow" marker-end="url(#arw-tfm)" />
  <rect x="24" y="344" width="380" height="48" class="d-box" />
  <text x="214" y="365" class="d-label" text-anchor="middle">JUDGE · HAIKU 4.5</text>
  <text x="214" y="381" class="d-sub" text-anchor="middle">blind to technique · rubric-scored</text>
  <path d="M404 368 H 428" class="d-flow" marker-end="url(#arw-tfm)" />
  <rect x="432" y="344" width="184" height="48" class="d-box" />
  <text x="524" y="365" class="d-label" text-anchor="middle">VALIDATION · SONNET 4.6</text>
  <text x="524" y="381" class="d-sub" text-anchor="middle">13.3% sample · ρ 0.948</text>

  <path d="M214 392 V 424" class="d-flow" marker-end="url(#arw-tfm)" />

  <rect x="8" y="432" width="624" height="112" class="d-band" />
  <text x="20" y="452" class="d-band-label">C · POST-PROCESSING</text>
  <rect x="24" y="468" width="192" height="52" class="d-box" />
  <text x="120" y="492" class="d-label" text-anchor="middle">SQLITE</text>
  <text x="120" y="508" class="d-sub" text-anchor="middle">2,700 runs</text>
  <path d="M216 494 H 244" class="d-flow" marker-end="url(#arw-tfm)" />
  <rect x="248" y="468" width="192" height="52" class="d-box" />
  <text x="344" y="492" class="d-label" text-anchor="middle">MIXED ANOVA</text>
  <text x="344" y="508" class="d-sub" text-anchor="middle">wilcoxon · bonferroni</text>
  <path d="M440 494 H 468" class="d-flow" marker-end="url(#arw-tfm)" />
  <rect x="472" y="468" width="144" height="52" class="d-box" />
  <text x="544" y="492" class="d-label" text-anchor="middle">FIGURES</text>
  <text x="544" y="508" class="d-sub" text-anchor="middle">+ KPI report</text>
</svg>
<figcaption>fig. 1 — Three-phase harness. Non-determinism lives in phase A only.</figcaption>
</figure>

**Experimental grid.** Three tasks (XSum summarization, HumanEval code
generation, GSM8K arithmetic reasoning) × 5 instances × 12 cells (3 techniques ×
2 context lengths × 2 syntactic formats) × 5 models × 3 repetitions = **2,700
evaluated inferences**.

**Metering** had to be split by model type, because there is no single tool that
sees both. Local models run through Ollama as an external process, so CodeCarbon
runs in `tracking_mode='machine'` around the call. Remote models are opaque, so
EcoLogits estimates from token counts and published model characteristics. The
two are not interchangeable and are never compared directly — every statistical
model is fitted separately for API and local.

**The judge** scores each answer against the rubric for its instance, blind to
which technique produced it, with structured output via `tool_use`.

## Decisions & trade-offs

- **The Router is an LLM at pre-processing time and a dictionary lookup at
  runtime.** Generating prompt variants on the fly would have been a more
  impressive agent demo, but the three repetitions of each cell would have
  received three slightly different prompts and the variance would have been
  unattributable. **Trade-off:** the runtime graph is less "agentic" than the
  architecture diagram suggests — and that is the point.
- **Rubrics are semi-dynamic: a fixed structure per task with contextual slots
  filled by an LLM.** Fully generated rubrics would score every instance on a
  different scale; fully static ones would score a summary without knowing which
  facts mattered. **Trade-off:** more moving parts than a single global rubric,
  in exchange for scores that are comparable across cells.
- **The judge comes from a model family absent from the experiment.** Anthropic
  judges OpenAI, Google and local open-weight models, so no model can prefer its
  own output, and 13.3% of the runs were re-scored by a stronger judge to
  validate the cheap one. **Trade-off:** it worked, and it was expensive — the
  meta-system ended up burning more energy than everything it was measuring.
- **No thermal cooldowns between runs; GPU temperature is a covariate instead.**
  Waiting for the GPU to return to baseline between inferences would have added
  roughly 13 hours to the run. **Trade-off:** temperature had to be modelled
  rather than controlled — and the model priced it at +6.9% energy per additional
  degree, which turned an operational shortcut into a result.

## Metrics

All figures come from the consolidated run (`f3fb12ab-8bab-…`, 2,700 executions
over ~11 hours) and the statistical models in the thesis, chapter 4.

| Metric | Value |
| ------ | ----- |
| Evaluated inferences | 2,700 · 100% judged · 0 unrecovered failures (182 retried) |
| Energy: zero-shot vs CoT (API) | zero-shot draws **33.5%** of CoT |
| Energy: few-shot vs CoT (API) | few-shot draws **31.4%** of CoT |
| Energy: zero-shot vs CoT (local) | zero-shot draws **50%**, few-shot **64.6%** |
| Effect size, zero-shot vs CoT | Cohen's *d* = −0.485 (small–medium), *p* < 1e−63 |
| Effect size, zero-shot vs few-shot | Cohen's *d* = −0.071 (negligible) |
| Quality (judge, 0–100) | zero-shot 49.0 · few-shot 52.4 · CoT 53.1 |
| XML vs plain text, long context | −29.8% energy |
| Model spread | gpt-5-mini ≈ 26% of gemini-2.5-flash for the same cell |
| GPU temperature | +6.9% energy per additional degree |
| Inter-judge agreement (n = 359) | Spearman ρ = **0.948** |
| Judge vs objective metric | ρ = 0.868 (GSM8K) · 0.600 (HumanEval) · 0.467 (XSum) |
| Total energy accounted | 826.47 Wh · 143.16 g CO₂ |
| Meta-system share of that total | **59.4%** |

## Lessons learned

**Few-shot is the honest default.** It matches chain-of-thought on quality for
API models — the difference is not statistically significant — while costing
what zero-shot costs. Chain-of-thought buys its quality with a real, measurable
energy premium, and on local models that premium doubles consumption. The common
advice to "just add step-by-step reasoning" is not free, and now there is a
number attached to it.

**Measuring cost more energy than the thing being measured.** The judge and its
validation pass accounted for 59.4% of total consumption. That is an
uncomfortable result to publish in a Green AI thesis, and reporting it is more
useful than hiding it: any LLM-as-a-judge pipeline needs its own efficiency
budget, and the validation judge in particular deserves a cheaper strategy.

**Validating the judge is most of the work.** Three independent layers —
inter-judge agreement, correlation with objective metrics, and a verbosity-bias
check — all passed, except one: quadratic-weighted kappa for
`gsm8k.conciseness` came in at 0.187, well under the 0.4 threshold. One criterion
out of fifteen failed, and pretending otherwise would have invalidated the rest.
Conciseness on short arithmetic answers turns out to be something two judges
simply disagree about.

**What I would do differently.** Five instances per task is thin for
generalizing at the instance level; ten to fifteen would have been better and
would have scaled the cost proportionally. I would also add TOON as a third
syntactic format — if XML already cuts 29.8% off long contexts, a
token-oriented notation is the obvious next lever.

## Links

- Source code, artifacts and data: [github.com/lepablito/TFM_UOC_PabloMarcosParra](https://github.com/lepablito/TFM_UOC_PabloMarcosParra)
- Full thesis (67 pp., PDF, written in Spanish): [Multi-agent architecture for measuring the energy impact of prompting techniques and context length on heterogeneous LLMs](/docs/tfm-pablo-marcos-parra.pdf)
