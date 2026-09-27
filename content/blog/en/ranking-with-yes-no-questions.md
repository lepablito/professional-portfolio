---
title: "One passage, one yes/no question"
description: "I put two decision models, Jev and Laya, up against the LLM reranker of my D&D wiki. Jev, reading full passages, found the right source for all 36 questions. Laya without fine-tuning did worse than not reranking at all."
date: "2026-09-27"
tags: ["rag", "reranking", "llm-local", "ollama"]
draft: true
---

The [previous post](/blog/rag-wiki-dnd/) ended with a diagnosis: the Oracle
of my D&D wiki finds the right material, it just doesn't always put it first.
Its three search paths bring the right source back somewhere among ~27
candidates every single time, but that source only lands in the top 8 that
reach the model 83% of the time. A reranker (the same `qwen2.5:14b` that
answers the chat, reading a short annotation of each candidate instead of its
text) lifts that to 93%.

That reranker is a generative model doing a classifier's job: it reads a
numbered list and writes numbers back. So I wanted to know whether a model
built for that kind of decision would do it better, and tried two:

- **Jev**, from TypeSafe, a hosted model of the kind they call "System One".
  You give it a state and a set of typed questions, and it returns an answer
  to each one with a probability attached. I call it through OpenRouter
  (`~typesafe/jev-latest`, which resolved to `jev-1.13`).
- **Laya**, from Convai, which plays the same game with open weights: a
  322M-parameter encoder, multilingual checkpoint, running on my own GPU.

Both support a yes/no question type called Noul that returns the probability
of "yes". So instead of asking one model to rank 27 things at once, you ask
each passage the same question and sort by the answer.

## Same candidates for everyone

For the comparison to mean anything, every variant has to choose from exactly
the same candidates, and I didn't want to rewrite retrieval for an
experiment. So the harness calls the production `rag.search()` and, for the
duration of that one call, swaps the reranker for a spy that keeps whatever
list it receives and hands back the RRF order. That captures what the
reranker sees in production: 26.9 candidates per question on average.

Each gate asks every candidate two Noul questions, `is_relevant` and
`contains_answer_evidence`, scores it with the mean of the two, and sends the
8 best to the model, the same k the reranker uses. I tried each model with two
inputs: the full chunk text (up to 1200 words) and the ~38-word annotation the
reranker reads. Every call goes to a disk cache the moment it returns, so
rerunning is free and a crash halfway through doesn't lose anything.

The eval bank is last post's, plus the six "arc" questions added since (the
ones whose answer is spread over several sessions), 36 in total. Before
looking at any gate I checked the controls. On the 30 original questions,
plain RRF gives recall@8 0.833 and MRR 0.707, exactly last time's numbers. The
reranker gives the same 0.933 recall, with a slightly lower MRR (0.737 against
0.757). And the candidates contain the right source for all 36 questions, so
every miss from here on is a ranking miss.

## Results

| Variant | recall@8 | MRR | per passage (p50) | per question (p50) | cost, 36 questions |
|---|---:|---:|---:|---:|---:|
| RRF, no reranker | 0.83 | 0.73 | n/a | n/a | $0 |
| Current reranker (qwen2.5:14b) | 0.94 | 0.77 | 61 ms | 1.6 s | $0 |
| Jev · full text | **1.00** | **0.97** | 268 ms | 7.5 s | $0.062 |
| Jev · annotation | 0.92 | 0.78 | 262 ms | 7.3 s | $0.020 |
| Laya zero-shot · full text | 0.61 | 0.39 | 29 ms | 0.9 s | $0 |
| Laya zero-shot · annotation | 0.72 | 0.49 | 28 ms | 0.8 s | $0 |

recall@8 is the fraction of questions with at least one passage from an
expected source among the 8, and MRR is the mean of 1/rank of the first such
passage. The reranker makes a single call per question for all the
candidates, so its per-passage time is that call divided by the number of
candidates.

With the full text, Jev gets a correct passage into the top 8 for every
question, nearly always in first place. Paraphrases were the family that hurt
most last time (questions written without any of the session's proper
nouns), and they go from 0.58 with RRF and 0.83 with the reranker to 12 out of
12. Arc questions are the one place where it doesn't come out ahead: of the
sessions an arc question expects, Jev's 8 cover 0.77, against 0.80 for the
reranker and 0.81 for plain RRF.

<figure class="diagram" tabindex="0">
<svg viewBox="0 0 640 304" role="img" aria-labelledby="d-gate-title-en d-gate-desc-en" preserveAspectRatio="xMidYMid meet">
  <title id="d-gate-title-en">Of the 8 passages that reach the model, how many come from an expected source, per variant</title>
  <desc id="d-gate-desc-en">RRF, no reranker (reference): 2.7 of 8 passages from an expected source, recall@8 0.83. Current reranker (qwen2.5:14b): 2.6 of 8 passages from an expected source, recall@8 0.94, 61 ms per passage (p50). Jev · full text: 2.8 of 8 passages from an expected source, recall@8 1.00, 268 ms per passage (p50). Jev · annotation: 2.3 of 8 passages from an expected source, recall@8 0.92, 262 ms per passage (p50). Laya zero-shot · full text: 1.5 of 8 passages from an expected source, recall@8 0.61, 29 ms per passage (p50). Laya zero-shot · annotation: 1.8 of 8 passages from an expected source, recall@8 0.72, 28 ms per passage (p50).</desc>
  <rect x="224" y="10" width="10" height="10" style="fill:var(--accent)" />
  <text x="240" y="19" class="d-sub">from an expected source</text>
  <rect x="384" y="10" width="10" height="10" style="fill:var(--line)" />
  <text x="400" y="19" class="d-sub">rest of the 8</text>
  <line x1="224.0" y1="44" x2="224.0" y2="296" style="stroke:var(--grid);stroke-width:1" />
  <text x="224.0" y="40" class="d-sub" text-anchor="middle">0</text>
  <line x1="368.0" y1="44" x2="368.0" y2="296" style="stroke:var(--grid);stroke-width:1" />
  <text x="368.0" y="40" class="d-sub" text-anchor="middle">4</text>
  <line x1="512.0" y1="44" x2="512.0" y2="296" style="stroke:var(--grid);stroke-width:1" />
  <text x="512.0" y="40" class="d-sub" text-anchor="middle">8</text>
  <g><title>RRF, no reranker (reference): 2.69 of 8 passages from an expected source (mean of 36 questions). recall@8 0.83 · no selection cost.</title>
    <text x="212" y="69" class="d-label" text-anchor="end">RRF, no reranker (reference)</text>
    <text x="212" y="82" class="d-sub" text-anchor="end">recall@8 0.83 · no selection cost</text>
    <rect x="224.0" y="60.0" width="96.0" height="14" style="fill:var(--accent)" />
    <rect x="322.0" y="60.0" width="190.0" height="14" style="fill:var(--line)" />
    <text x="522" y="71" class="d-label">2.7 / 8</text>
  </g>
  <g><title>Current reranker (qwen2.5:14b): 2.64 of 8 passages from an expected source (mean of 36 questions). recall@8 0.94 · 61 ms/passage · p50.</title>
    <text x="212" y="109" class="d-label" text-anchor="end">Current reranker (qwen2.5:14b)</text>
    <text x="212" y="122" class="d-sub" text-anchor="end">recall@8 0.94 · 61 ms/passage · p50</text>
    <rect x="224.0" y="100.0" width="94.0" height="14" style="fill:var(--accent)" />
    <rect x="320.0" y="100.0" width="192.0" height="14" style="fill:var(--line)" />
    <text x="522" y="111" class="d-label">2.6 / 8</text>
  </g>
  <g><title>Jev · full text: 2.81 of 8 passages from an expected source (mean of 36 questions). recall@8 1.00 · 268 ms/passage · p50.</title>
    <text x="212" y="149" class="d-label" text-anchor="end">Jev · full text</text>
    <text x="212" y="162" class="d-sub" text-anchor="end">recall@8 1.00 · 268 ms/passage · p50</text>
    <rect x="224.0" y="140.0" width="100.0" height="14" style="fill:var(--accent)" />
    <rect x="326.0" y="140.0" width="186.0" height="14" style="fill:var(--line)" />
    <text x="522" y="151" class="d-label">2.8 / 8</text>
  </g>
  <g><title>Jev · annotation: 2.28 of 8 passages from an expected source (mean of 36 questions). recall@8 0.92 · 262 ms/passage · p50.</title>
    <text x="212" y="189" class="d-label" text-anchor="end">Jev · annotation</text>
    <text x="212" y="202" class="d-sub" text-anchor="end">recall@8 0.92 · 262 ms/passage · p50</text>
    <rect x="224.0" y="180.0" width="81.0" height="14" style="fill:var(--accent)" />
    <rect x="307.0" y="180.0" width="205.0" height="14" style="fill:var(--line)" />
    <text x="522" y="191" class="d-label">2.3 / 8</text>
  </g>
  <g><title>Laya zero-shot · full text: 1.53 of 8 passages from an expected source (mean of 36 questions). recall@8 0.61 · 29 ms/passage · p50.</title>
    <text x="212" y="229" class="d-label" text-anchor="end">Laya zero-shot · full text</text>
    <text x="212" y="242" class="d-sub" text-anchor="end">recall@8 0.61 · 29 ms/passage · p50</text>
    <rect x="224.0" y="220.0" width="54.0" height="14" style="fill:var(--accent)" />
    <rect x="280.0" y="220.0" width="232.0" height="14" style="fill:var(--line)" />
    <text x="522" y="231" class="d-label">1.5 / 8</text>
  </g>
  <g><title>Laya zero-shot · annotation: 1.78 of 8 passages from an expected source (mean of 36 questions). recall@8 0.72 · 28 ms/passage · p50.</title>
    <text x="212" y="269" class="d-label" text-anchor="end">Laya zero-shot · annotation</text>
    <text x="212" y="282" class="d-sub" text-anchor="end">recall@8 0.72 · 28 ms/passage · p50</text>
    <rect x="224.0" y="260.0" width="63.0" height="14" style="fill:var(--accent)" />
    <rect x="289.0" y="260.0" width="223.0" height="14" style="fill:var(--line)" />
    <text x="522" y="271" class="d-label">1.8 / 8</text>
  </g>
</svg>
<figcaption>fig. 1 — Of the 8 passages that reach the model, how many come from an expected session or document (mean of 36 questions). Ground truth is per source, not per passage.</figcaption>
</figure>

The figure counts how many of the 8 come from an expected source, and on that
count Jev, the reranker and plain RRF are almost tied, between 2.6 and 2.8.
What Jev adds is that one of those passages is always there and usually
first, which is what recall and MRR pick up.

## The annotation result flips

I didn't see this one coming. In the previous post the trick with the
reranker was never showing it raw text: with the text, recall dropped to
0.73, below not reranking at all, and with the annotation it went up to 0.93.
Jev goes the other way. Full text gives 1.00, the annotation gives 0.92, and
paraphrases fall back to 0.83.

My guess, which I haven't tested, is that it depends on what each model is
being asked to do. The reranker compares 27 candidates inside one prompt, so it
wants short descriptions it can line up side by side, and 27 full sessions are
mostly noise to it. Jev reads one passage at a time with a 32k context, so for
Jev the full text is information, and the annotation throws away exactly the
detail a paraphrased question depends on.

## Laya without fine-tuning is worse than doing nothing

Zero-shot Laya picks worse than the RRF order it's supposed to improve on:
0.61 recall with full text and 0.72 with annotations, against 0.83 for RRF. On
paraphrases it gets 4 out of 12. Its scores do spread out (0.02 at p10, 0.92
at p90), but the high ones land on the wrong passages too often.

That matches Laya's own documentation, which says the base checkpoints score
close to chance zero-shot and that the jump comes from fine-tuning on
decisions from your own domain. It's still tempting at 29 ms per passage,
running locally for free, so fine-tuning it is the next experiment. I've
written the preparation script but haven't run it. It needs hand-labeled
passages first, and the train/test split has to be by question: the ~27
candidates of a question share its query, so splitting them up would leak
test questions into training.

## What Jev costs

In money, very little. The 36 questions with full text cost $0.062, about 1.5M
input tokens at $0.042 per million, and the `usage.cost` OpenRouter sends back
matched that estimate. That works out to roughly $0.0017 per question.

Latency is another story. Jev needs a call per passage, around 270 ms each,
and my harness sends them one after another, which adds up to 7.5 s per
question against 1.6 s for the reranker. Most of those 270 ms are network, and
nothing stops you from firing the 27 calls in parallel, but I haven't measured
that, so I'm not going to guess a number. The reranker, for its part, is only
"free" because it reuses the 14B model already loaded for chat, and it still
ties up the GPU while it runs.

## As a strict gate

Top 8 keeps the comparison with the reranker fair. With a probability per
passage, though, you can also set a threshold and let through only what
clears it, which the reranker's ordered list doesn't give you. With a score of
0.5 or more (capped at 8), Jev on full text lets through 4 passages per
question on average and still doesn't lose a single question: recall stays at
1.00. On annotations it's much stricter, with 1.3 passages on average and 10
questions left with nothing. Laya doesn't separate here either, and with full
text it lets almost everything through (6.6 of 8).

For the Oracle this is the most useful number in the whole experiment: half
the context without losing the right source. Whether the answers get better
with 4 passages instead of 8 I can't say, since the experiment only measures
what reaches the model.

## The fine print

The ground truth is per source. A passage counts as a hit if its session or
document is among the expected ones, even when that particular chunk is about
something else. That's why I'm not leaning on precision: every variant lands
between 0.19 and 0.35, and on the literal questions, whose ground truth is
"sessions where the name appears", that number comes out inflated. The
harness exports every candidate to a CSV for hand labeling, and precision can
be recomputed from it without calling any API again.

36 questions is not that many. One question is almost 3 points of global
recall, and 8 points inside a 12-question family, so Jev's 1.00 means zero
misses on a small sample.

The two Noul questions turned out to be nearly the same question. In Jev,
`is_relevant` and `contains_answer_evidence` correlate at 0.95, so the second
one adds little. Dropping it wouldn't save much, though, because most of each
call is the passage text, and a call with a one-line passage already costs
about 450 tokens.

Two smaller things. In 3 questions the reranker named fewer than 8 passages
and the code filled the rest in RRF order; that also happens in production, so
I measured it as is. And this is a single run. Everything is cached and
reproducible, but I didn't repeat it to look at variance.

## What I take away from this

Last time, the hard part turned out to be choosing which eight candidates to
show the model, and the answer then was an LLM reading short summaries of all
of them at once. This time the best result came from a model that writes
nothing and reads passages one by one, and it only does this well when it gets
the full text. On this bank it beats the reranker on recall and MRR and loses
a bit on arc coverage. It's also much slower, and it costs about a sixth of a
cent per question. Next I want to measure Jev with parallel calls to see how
much of those 7.5 s is left, and fine-tune Laya to see whether a local 322M
model can catch up.
