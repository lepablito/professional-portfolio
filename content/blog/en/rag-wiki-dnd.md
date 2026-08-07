---
title: "Retrieval isn't the problem. Ranking is."
description: "How retrieval works in the Oracle of my D&D wiki: three search paths fused by rank, a reranker that only helps as long as it never sees the raw text, and leftover slots for what didn't fit."
date: "2026-08-07"
tags: ["rag", "llm-local", "ollama", "chromadb", "reranking"]
---

I play a D&D campaign with over a hundred sessions of notes. Enough that
nobody at the table remembers what happened to a minor NPC who showed up in
session 23 and came back, changed, in session 91. The Oracle is a chat that
answers natural-language questions about that campaign, questions like "what
happened to the archduke?", using **only** the notes, and citing exactly
where each claim comes from. This is RAG in the strict sense: there is nothing the
model knows about this campaign from training, because it doesn't exist
outside these files.

What's interesting isn't that a local LLM is answering. It's that half the
system, the half that decides **what you show the model** before it
answers, is where correctness actually gets decided, and that half turned
out to be a lot less obvious than a three-step RAG tutorial makes it look.

## Chunk by session, not by word count

Before retrieving anything you have to decide what counts as a retrievable
unit. Naive chunking (cut every N words) splits entries down the middle: a
god's name in one chunk, its description in the next, and a query that finds
one without finding the other.

The goal here is for **a session to be a chunk**. A header detector (`##
Session 12 — ...`, `**Session 7**`, accented and unaccented variants) splits
the document into session blocks before anything else happens. Only if a
block doesn't fit under the cap (`SESSION_MAX_WORDS = 1200`) does it get
subdivided, and even then Markdown sub-headings are respected: consecutive
sections get packed together up to the cap without ever splitting one, and
only what genuinely doesn't fit on its own gets blindly windowed with
overlap (`OVERLAP_WORDS = 120`, about 10% of the cap).

A passing mention, like "…we saw this back in session 5…", deliberately
doesn't count as a session header: if it did, every cross-reference would spawn a
phantom non-existant session and inflate the session count.

## Hybrid retrieval: three paths, not one

With the corpus chunked, the obvious question is how to search it. The
answer here is to not pick one: three independent searches run in parallel
and their results get fused.

- **Semantic**: embeddings (`bge-m3`) against ChromaDB, cosine distance.
  Understands paraphrase: *"who died?"* finds *"fell in battle"*. It loses
  on the made-up proper nouns of a home campaign (*Norkiel*, *Galerna*)
  that the embedding model has never seen and projects to some arbitrary
  corner of vector space.
- **Keyword**: BM25 over SQLite FTS5. Nails *"Norkiel"* literally, but
  doesn't generalize: *"who died?"* won't find *"fell"*.
- **Entity**: if the question names an entity already extracted into the
  Compendium (by its canonical name or an alias), this path literally
  searches for every other session where it appears. It exists because,
  measured against the real corpus, asking about someone who shows up in six
  sessions only returned fragments from two or three with the other two
  paths. Coverage went from 70% to 91% with this one added.

None of the three is skippable on its own, and the third has a known
trade-off: for an entity that shows up all over the campaign (a player
character, or a very common alias), it pulls in candidates from so many
sessions that it can crowd out the one that actually mattered. That's a
trade-off that got measured and accepted, not an edge case that slipped
through unnoticed.

<figure class="diagram" tabindex="0">
<svg viewBox="0 0 640 500" role="img" aria-labelledby="d-rag-title-en d-rag-desc-en" preserveAspectRatio="xMidYMid meet">
  <title id="d-rag-title-en">Three retrieval paths fused by rank, then reordered by a reranker</title>
  <desc id="d-rag-desc-en">A question is searched in parallel across three paths: semantic search with bge-m3 and ChromaDB, keyword search with BM25 over SQLite FTS5, and entity search against Compendium aliases. The three rankings are fused by position with Reciprocal Rank Fusion, not by score. Of the fused candidates, a reranker based on qwen2.5:14b reorders them by reading only the one- or two-sentence annotation of each fragment, never its raw text, and keeps the best eight. If any candidate is missing an annotation, or the model fails, the reranker turns itself off and the fused ranking is returned untouched. Candidates that don't make the top eight contribute up to sixteen one-line summaries, grouped by session, added to the prompt context in a separate block.</desc>
  <defs>
    <marker id="arw-rag" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0 0 L8 4 L0 8 z" class="d-head" />
    </marker>
  </defs>

  <rect x="8" y="8" width="624" height="116" class="d-band" />
  <text x="20" y="28" class="d-band-label">A · THREE PATHS IN PARALLEL</text>
  <rect x="24" y="44" width="184" height="60" class="d-box" />
  <text x="116" y="66" class="d-label" text-anchor="middle">SEMANTIC</text>
  <text x="116" y="82" class="d-sub" text-anchor="middle">bge-m3 + ChromaDB</text>
  <text x="116" y="96" class="d-sub" text-anchor="middle">cosine distance</text>

  <rect x="228" y="44" width="184" height="60" class="d-box" />
  <text x="320" y="66" class="d-label" text-anchor="middle">KEYWORD</text>
  <text x="320" y="82" class="d-sub" text-anchor="middle">BM25</text>
  <text x="320" y="96" class="d-sub" text-anchor="middle">SQLite FTS5</text>

  <rect x="432" y="44" width="184" height="60" class="d-box" />
  <text x="524" y="66" class="d-label" text-anchor="middle">ENTITY</text>
  <text x="524" y="82" class="d-sub" text-anchor="middle">Compendium aliases</text>
  <text x="524" y="96" class="d-sub" text-anchor="middle">named in the question</text>

  <path d="M116 104 V 130 H 320 V 150" class="d-flow" />
  <path d="M320 104 V 150" class="d-flow" marker-end="url(#arw-rag)" />
  <path d="M524 104 V 130 H 320 V 150" class="d-flow" />

  <rect x="8" y="134" width="624" height="72" class="d-band" />
  <text x="20" y="150" class="d-band-label">B · RANK FUSION</text>
  <rect x="140" y="164" width="360" height="34" class="d-box" />
  <text x="320" y="186" class="d-label" text-anchor="middle">RRF — score = Σ 1 / (60 + rank)</text>
  <path d="M320 206 V 226" class="d-flow" marker-end="url(#arw-rag)" />

  <rect x="8" y="216" width="624" height="90" class="d-band" />
  <text x="20" y="232" class="d-band-label">C · RANKING</text>
  <rect x="140" y="246" width="360" height="50" class="d-box" />
  <text x="320" y="266" class="d-label" text-anchor="middle">RERANKER · qwen2.5:14b</text>
  <text x="320" y="283" class="d-sub" text-anchor="middle">reads the annotation, never the raw text</text>
  <path d="M500 271 H 560" class="d-flow d-dashed" />
  <text x="566" y="266" class="d-sub">missing annotation /</text>
  <text x="566" y="280" class="d-sub">Ollama down →</text>
  <text x="566" y="294" class="d-sub">RRF order untouched</text>

  <path d="M230 296 V 316 H 190 V 336" class="d-flow" marker-end="url(#arw-rag)" />
  <path d="M410 296 V 316 H 450 V 336" class="d-flow" marker-end="url(#arw-rag)" />

  <rect x="8" y="330" width="624" height="80" class="d-band" />
  <text x="20" y="346" class="d-band-label">D · FINAL PROMPT CONTEXT</text>
  <rect x="24" y="360" width="270" height="40" class="d-box" />
  <text x="159" y="384" class="d-label" text-anchor="middle">8 FULL FRAGMENTS</text>
  <rect x="346" y="360" width="270" height="40" class="d-box" />
  <text x="481" y="384" class="d-label" text-anchor="middle">≤16 ONE-LINE SUMMARIES</text>

  <path d="M159 400 V 416 H 320 V 432" class="d-flow" />
  <path d="M481 400 V 416 H 320 V 432" class="d-flow" marker-end="url(#arw-rag)" />

  <rect x="8" y="424" width="624" height="68" class="d-band" />
  <text x="20" y="440" class="d-band-label">E · RESPONSE</text>
  <rect x="140" y="450" width="360" height="34" class="d-box" />
  <text x="320" y="472" class="d-label" text-anchor="middle">CHAT · answer with a mandatory citation per claim</text>
</svg>
<figcaption>fig. 1 — Retrieval brings in the candidates; ranking decides which ones reach the model.</figcaption>
</figure>

## Fuse by rank, not by score

The three paths aren't comparable to each other: semantic search gives a
cosine similarity between 0 and 1, BM25 returns a score with no fixed scale.
Adding them directly would be mixing units. The fusion step uses
**Reciprocal Rank Fusion**, which throws away the score entirely and keeps
only each result's position in its own list:

```
score(chunk) = Σ  1 / (RRF_K + rank_in_that_list)      RRF_K = 60
             paths
```

A chunk that shows up in two lists scores twice and rises above the top
result of either list alone, which is exactly the behavior you want: cross-path
confirmation. Each path asks for more results than are ultimately
needed (`max(k*2, k+5)`) so fusion has some depth to work with, and if the
text index is empty (a freshly created corpus that hasn't been re-ingested),
BM25 simply returns `[]` and everything gracefully degrades to
vector-only search, with no special-case branch to handle it.

This is where I changed my mind about what RRF actually decides. At first I
thought of fusion as the step that produces the final result. It isn't: it
fuses up to 40 candidates (in practice around 27 come out) and from there
something else takes over.

## Retrieval isn't the failure mode. Ranking is.

Measured against a bank of 30 questions: the **union** of the three paths
contains the correct source all 30 times. The top-8 that comes straight out
of RRF fusion only gets it right 25 times. The conclusion isn't intuitive if
you're coming from thinking about RAG as "search and you're done": the
problem wasn't finding the right fragment, it was that it didn't always land
among the first eight.

The fix is a single extra call to the same LLM already serving chat
(`qwen2.5:14b`), asking it to reorder the ~27 candidates and return the best
8. The detail that isn't cosmetic: the model isn't shown each fragment's
text, it's shown its **annotation**: a one- or two-sentence description
generated during ingestion and cached, not computed on the fly. Measured:
with raw text, global recall *drops* to 0.73, worse than not reranking at
all. With the annotation, it climbs to 0.93. Text and annotation together
give 0.87, still worse than the annotation alone. Giving the reranker more
information doesn't make it better if that extra information is noise for
the task of ranking.

That's why the reranker turns itself off, with no configuration needed, the
moment any candidate is missing its cached annotation, or Ollama doesn't
respond, or the output JSON fails to parse: in any of those cases it returns
the RRF order untouched. It never raises an exception that takes down
search, and it never returns fewer fragments than were asked for.

It uses the same model already serving chat responses, and that's not a
coincidence or a cosmetic saving either: Ollama keeps the last-used model
resident in memory. With the same model, reranking costs 1.4s; with a
different one, there's an unload-and-reload between the reranker and the
generation step, and the per-question cost jumps to around 6s.

## The slots left over: summaries of what didn't fit

Eight full fragments cover most questions, but not all of them. Some
questions no single session answers on its own (*"what role has this
character played over the course of the campaign?"* might need seven), and
there the measured failure wasn't retrieval either: the union of candidates
covered 0.88 of the sessions relevant to that story arc, but the eight the
reranker picked only covered 0.67. The problem was they didn't fit.

The fix reuses what's already there: behind the 8 full fragments come up to
16 one-line summaries (the same annotation the reranker uses) of the
candidates that got left out. A full session is roughly 1200 words; its
annotation, about 38. Sixteen summaries fit for the price of half a session
more, with no extra LLM call and no added latency, because the annotation
was already cached.

Two design rules there that aren't obvious until you break them once:

- **One slot per session, not per chunk.** A long session gets chunked into
  several fragments; spending two slots on two halves of the same session
  leaves out an entire other session that actually had something new to
  offer.
- **Summaries go in their own labeled block**, never mixed in with the full
  material. The model needs to be able to tell "I have this one in full,
  cite it with confidence" apart from "this is a headline, not a citable
  fragment."

## Two quiet refinements

Two small pieces that show up in no diagram but decided whether the system
held up in real use rather than just on the eval bank:

**Citation is a hard instruction, not a suggestion.** The prompt requires
putting, after every claim, the exact label of the fragment it came from
(`Session 119`, `Sheet: Katerina_Emberdusk`, `World: GODS`). With a softer
phrasing ("cite when possible"), 12 out of 36 answers on the bank cited no
source at all despite being correct; tightening the instruction brought that
down to 3. One nuance that took a while to catch: if the instruction's own
example includes a concrete session number, the model copies it literally
into answers that don't come from that session at all. The format is
described without ever giving a sample number.

**Chat history feeds search too, not just the model.** When a question
doesn't stand on its own, like *"and then what happened?"*, searching with
that phrase as-is finds nothing useful. A deterministic heuristic, no LLM call
involved, detects this kind of question (starts with *and / but / then / so*,
or is short and names nobody) and prepends the user's last turn **for search
purposes only**; the question actually being answered is still the original
one. It's deliberately conservative: a proper noun in the question overrides
everything else, because *"and what did Baika do?"* already carries its own
topic, and expanding it would pollute the search instead of helping it.

## What I take away from this

If I had to sum up the system in one line, it's this: retrieving well is
necessary but it isn't where the difficulty lives. The three search paths,
the rank fusion, the session-based chunking: all of that together already
gets the correct source into the candidate set 100% of the time. What
actually took the work was deciding, out of that already-correct set, which
eight things to show the model and in what order, and what to do with the
ones left over instead of throwing them away. None of those decisions show
up in the one-line description of "RAG": embeddings, vector store, LLM. They
all showed up from measuring what failed on real questions about a real
campaign.
